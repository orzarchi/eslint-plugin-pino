import { RuleTester } from 'eslint';
import { correctArgsPosition } from '../../src/rules/correct-args-position';

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
});

ruleTester.run('correct-args-position', correctArgsPosition, {
  valid: [
    // Correct usage - object before message
    "logger.info({userId: 123}, 'User logged in')",
    "logger.error({error: err}, 'Failed to process request')",
    "logger.debug({data: result}, 'Processing completed')",
    
    // Only message
    "logger.info('Simple message')",
    
    // Only object
    "logger.info({data: 'test'})",
    
    // Multiple objects before message
    "logger.info({userId: 123}, {sessionId: 'abc'}, 'User action')",
    
    // Template literals
    "logger.info({userId: 123}, `User ${name} logged in`)",
    
    // All pino methods
    "logger.trace({trace: true}, 'Trace message')",
    "logger.debug({debug: true}, 'Debug message')",
    "logger.warn({warn: true}, 'Warning message')",
    "logger.error({error: true}, 'Error message')",
    "logger.fatal({fatal: true}, 'Fatal message')",
    "logger.child({child: true}, 'Child message')",
    "logger.log({log: true}, 'Log message')",
    
    // Non-pino method calls should be ignored
    "someOtherLogger.info('message', {data: 'test'})",
    "console.log('message', {data: 'test'})",
    
    // No arguments
    "logger.info()",
  ],
  
  invalid: [
    {
      code: "logger.info('User logged in', {userId: 123})",
      errors: [
        {
          messageId: 'incorrectArgsPosition',
          data: {
            method: 'info',
            correctUsage: '{...}, "message"',
          },
        },
      ],
      output: "logger.info({userId: 123}, 'User logged in')",
    },
    {
      code: "logger.error('Failed to process', {error: err, userId: 123})",
      errors: [
        {
          messageId: 'incorrectArgsPosition',
          data: {
            method: 'error',
            correctUsage: '{...}, "message"',
          },
        },
      ],
      output: "logger.error({error: err, userId: 123}, 'Failed to process')",
    },
    {
      code: "logger.debug(`Processing ${id}`, {data: result})",
      errors: [
        {
          messageId: 'incorrectArgsPosition',
          data: {
            method: 'debug',
            correctUsage: '{...}, "message"',
          },
        },
      ],
      output: "logger.debug({data: result}, `Processing ${id}`)",
    },
    {
      code: "logger.warn('Warning message', {level: 'high'}, someVar)",
      errors: [
        {
          messageId: 'incorrectArgsPosition',
          data: {
            method: 'warn',
            correctUsage: '{...}, "message", ...',
          },
        },
      ],
      output: "logger.warn({level: 'high'}, 'Warning message', someVar)",
    },
    {
      code: "logger.trace('Multiple', {first: 1}, 'strings', {second: 2})",
      errors: [
        {
          messageId: 'incorrectArgsPosition',
          data: {
            method: 'trace',
            correctUsage: '{...}, "message"',
          },
        },
      ],
      output: "logger.trace({first: 1}, {second: 2}, 'Multiple', 'strings')",
    },
    // Test all pino methods
    {
      code: "logger.fatal('Fatal error', {critical: true})",
      errors: [
        {
          messageId: 'incorrectArgsPosition',
          data: {
            method: 'fatal',
            correctUsage: '{...}, "message"',
          },
        },
      ],
      output: "logger.fatal({critical: true}, 'Fatal error')",
    },
    {
      code: "logger.child('Child logger', {childId: 'test'})",
      errors: [
        {
          messageId: 'incorrectArgsPosition',
          data: {
            method: 'child',
            correctUsage: '{...}, "message"',
          },
        },
      ],
      output: "logger.child({childId: 'test'}, 'Child logger')",
    },
    {
      code: "logger.log('Log message', {logLevel: 'info'})",
      errors: [
        {
          messageId: 'incorrectArgsPosition',
          data: {
            method: 'log',
            correctUsage: '{...}, "message"',
          },
        },
      ],
      output: "logger.log({logLevel: 'info'}, 'Log message')",
    },
  ],
});