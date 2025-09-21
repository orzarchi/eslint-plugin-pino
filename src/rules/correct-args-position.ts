import { Rule } from 'eslint';
import { Node, CallExpression, MemberExpression, Identifier } from 'estree';

const PINO_METHODS = [
  'trace',
  'debug',
  'info',
  'warn',
  'error',
  'fatal',
  'child',
  'log'
];

export const correctArgsPosition: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce correct argument positioning for pino logger methods',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: 'code',
    schema: [],
    messages: {
      incorrectArgsPosition: 'Pino logger methods should have the object argument before the message string. Use {{method}}({{correctUsage}}) instead.',
    },
  },
  create(context: Rule.RuleContext): Rule.RuleListener {
    function isPinoLoggerCall(node: CallExpression): boolean {
      if (node.callee.type !== 'MemberExpression') {
        return false;
      }

      const memberExpr = node.callee as MemberExpression;
      if (memberExpr.property.type !== 'Identifier') {
        return false;
      }

      const methodName = (memberExpr.property as Identifier).name;
      if (!PINO_METHODS.includes(methodName)) {
        return false;
      }

      // Check if the object appears to be a logger
      // Look for common logger variable names or exclude known non-loggers
      if (memberExpr.object.type === 'Identifier') {
        const objectName = (memberExpr.object as Identifier).name;
        
        // Exclude known non-logger objects
        if (objectName === 'console' || objectName.endsWith('Console')) {
          return false;
        }
        
        // Only include names that are very likely to be pino loggers
        const lowerName = objectName.toLowerCase();
        if (lowerName === 'logger' || 
            lowerName === 'log' ||
            lowerName === 'pino' ||
            lowerName.startsWith('pino') ||
            lowerName.includes('pinolog')) {
          return true;
        }
        
        // For other names that could be loggers but might not be pino, be conservative
        // and exclude them to avoid false positives
        return false;
      }

      // For complex expressions like this.logger.info(), be conservative
      // and only include if the property name suggests it's a logger
      if (memberExpr.object.type === 'MemberExpression') {
        const nestedMember = memberExpr.object as MemberExpression;
        if (nestedMember.property.type === 'Identifier') {
          const propName = (nestedMember.property as Identifier).name.toLowerCase();
          return propName === 'logger' || propName === 'log' || propName === 'pino';
        }
      }
      
      return false;
    }

    function isObjectExpression(node: Node): boolean {
      return node.type === 'ObjectExpression';
    }

    function isStringLiteral(node: Node): boolean {
      return node.type === 'Literal' && typeof node.value === 'string';
    }

    function isTemplateLiteral(node: Node): boolean {
      return node.type === 'TemplateLiteral';
    }

    function isStringLike(node: Node): boolean {
      return isStringLiteral(node) || isTemplateLiteral(node);
    }

    function getMethodName(node: CallExpression): string {
      const memberExpr = node.callee as MemberExpression;
      return (memberExpr.property as Identifier).name;
    }

    function generateCorrectUsage(args: Node[]): string {
      const objectArgs = args.filter(isObjectExpression);
      const stringArgs = args.filter(isStringLike);
      const otherArgs = args.filter(arg => !isObjectExpression(arg) && !isStringLike(arg));

      const parts: string[] = [];
      
      if (objectArgs.length > 0) {
        parts.push('{...}');
      }
      
      if (stringArgs.length > 0) {
        parts.push('"message"');
      }
      
      if (otherArgs.length > 0) {
        parts.push('...');
      }

      return parts.join(', ');
    }

    return {
      CallExpression(node: CallExpression) {
        if (!isPinoLoggerCall(node) || node.arguments.length === 0) {
          return;
        }

        const args = node.arguments;
        const methodName = getMethodName(node);
        
        // Find first object and first string argument positions
        let firstObjectIndex = -1;
        let firstStringIndex = -1;
        
        for (let i = 0; i < args.length; i++) {
          if (firstObjectIndex === -1 && isObjectExpression(args[i])) {
            firstObjectIndex = i;
          }
          if (firstStringIndex === -1 && isStringLike(args[i])) {
            firstStringIndex = i;
          }
        }

        // If we have both object and string, object should come first
        if (firstObjectIndex !== -1 && firstStringIndex !== -1 && firstObjectIndex > firstStringIndex) {
          const correctUsage = generateCorrectUsage(args);
          
          context.report({
            node,
            messageId: 'incorrectArgsPosition',
            data: {
              method: methodName,
              correctUsage,
            },
            fix(fixer) {
              // Generate the corrected argument list
              const objectArgs = args.filter(isObjectExpression);
              const stringArgs = args.filter(isStringLike);
              const otherArgs = args.filter(arg => !isObjectExpression(arg) && !isStringLike(arg));
              
              const reorderedArgs = [...objectArgs, ...stringArgs, ...otherArgs];
              const sourceCode = context.getSourceCode();
              const argsText = reorderedArgs.map(arg => sourceCode.getText(arg)).join(', ');
              
              return fixer.replaceTextRange(
                [args[0].range![0], args[args.length - 1].range![1]],
                argsText
              );
            },
          });
        }
      },
    };
  },
};