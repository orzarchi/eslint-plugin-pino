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

    function hasInterpolationMarkers(node: Node): boolean {
      if (node.type === 'Literal' && typeof node.value === 'string') {
        // Check for common interpolation markers used by Pino/printf-style formatting
        return /%[sdioO%]/.test(node.value);
      }
      return false;
    }

    function isNullish(node: Node): boolean {
      return (node.type === 'Literal' && (node.value === null || node.value === undefined)) ||
             (node.type === 'Identifier' && node.name === 'undefined');
    }

    function getMethodName(node: CallExpression): string {
      const memberExpr = node.callee as MemberExpression;
      return (memberExpr.property as Identifier).name;
    }

    function generateCorrectUsage(args: Node[]): string {
      // Since we only swap first two arguments, show what the corrected first two should look like
      const parts: string[] = [];
      
      // First argument should be the non-string (second original argument)
      if (isObjectExpression(args[1])) {
        parts.push('{...}');
      } else {
        parts.push('data');
      }
      
      // Second argument should be the string (first original argument)
      parts.push('"message"');
      
      // If there are more arguments, show ellipsis
      if (args.length > 2) {
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
        
        // Check if first argument is string and second is non-string (need to swap)
        // But skip if the string has interpolation markers (valid Pino pattern)
        const needsReorder = args.length >= 2 && 
                           isStringLike(args[0]) && 
                           !isStringLike(args[1]) && 
                           !isNullish(args[1]) &&
                           !hasInterpolationMarkers(args[0]);

        if (needsReorder) {
          const correctUsage = generateCorrectUsage(args);
          
          context.report({
            node,
            messageId: 'incorrectArgsPosition',
            data: {
              method: methodName,
              correctUsage,
            },
            fix(fixer) {
              // Swap first two arguments only
              const sourceCode = context.getSourceCode();
              const firstArgText = sourceCode.getText(args[0]);
              const secondArgText = sourceCode.getText(args[1]);
              
              // Replace first argument with second
              const fixes = [
                fixer.replaceText(args[0], secondArgText),
                fixer.replaceText(args[1], firstArgText)
              ];
              
              return fixes;
            },
          });
        }
      },
    };
  },
};