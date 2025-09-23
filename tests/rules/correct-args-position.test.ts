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
    
    // Variables before messages (correct)
    "logger.error(error, 'Error message')",
    "logger.info(data, 'Data processed')",
    "logger.debug(result, 'Debug info')",
    
    // this.logger patterns (correct)
    "this.logger.error(error, 'Error in method')",
    "this.logger.info({userId: 123}, 'User action')",
    
    // String interpolation patterns (correct - string first with interpolation values)
    "logger.info('Hello %s', name)",
    "logger.error('Error code: %d', errorCode)",
    "logger.debug('User %s has %d points', username, points)",
    
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
            correctUsage: '{...}, "message", ...',
          },
        },
      ],
      output: "logger.trace({first: 1}, 'Multiple', 'strings', {second: 2})",
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
    // Test error variables and other non-string arguments
    {
      code: "logger.error('Error adding reaction to message', error)",
      errors: [
        {
          messageId: 'incorrectArgsPosition',
          data: {
            method: 'error',
            correctUsage: 'data, "message"',
          },
        },
      ],
      output: "logger.error(error, 'Error adding reaction to message')",
    },
    {
      code: "this.logger.error('Error adding reaction to message', error)",
      errors: [
        {
          messageId: 'incorrectArgsPosition',
          data: {
            method: 'error',
            correctUsage: 'data, "message"',
          },
        },
      ],
      output: "this.logger.error(error, 'Error adding reaction to message')",
    },
    {
      code: "logger.info('Processing data', data, userId)",
      errors: [
        {
          messageId: 'incorrectArgsPosition',
          data: {
            method: 'info',
            correctUsage: 'data, "message", ...',
          },
        },
      ],
      output: "logger.info(data, 'Processing data', userId)",
    },
    {
      code: "logger.debug('Result is', result)",
      errors: [
        {
          messageId: 'incorrectArgsPosition',
          data: {
            method: 'debug',
            correctUsage: 'data, "message"',
          },
        },
      ],
      output: "logger.debug(result, 'Result is')",
    },
    {
      code: "logger.warn('Warning message', err, additionalData)",
      errors: [
        {
          messageId: 'incorrectArgsPosition',
          data: {
            method: 'warn',
            correctUsage: 'data, "message", ...',
          },
        },
      ],
      output: "logger.warn(err, 'Warning message', additionalData)",
    },
  ],
});