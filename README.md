# eslint-plugin-pino

ESLint plugin to enforce correct pino logger usage patterns.

## Installation

```bash
npm install --save-dev eslint-plugin-pino
```

## Usage

Add `pino` to the plugins section of your `.eslintrc` configuration file:

```json
{
  "plugins": ["pino"]
}
```

Then configure the rules you want to use under the rules section:

```json
{
  "rules": {
    "pino/correct-args-position": "error"
  }
}
```

### Recommended Configuration

You can use the recommended configuration which includes the most important rules:

```json
{
  "extends": ["plugin:pino/recommended"]
}
```

## Rules

### `correct-args-position`

Enforces that pino logger methods have object arguments before the message string.

#### ✅ Correct

```javascript
logger.info({userId: 123}, 'User logged in');
logger.error({error: err, userId: 123}, 'Failed to process request');
logger.debug({data: result}, `Processing ${id} completed`);
```

#### ❌ Incorrect

```javascript
logger.info('User logged in', {userId: 123});
logger.error('Failed to process request', {error: err, userId: 123});
logger.debug(`Processing ${id} completed`, {data: result});
```

#### Why?

When using pino logger methods incorrectly (with the message before the object), the object arguments are treated as additional parameters and won't be included in the structured log output. This can result in lost context information that's crucial for debugging and monitoring.

The rule supports all pino logging methods:
- `trace`
- `debug` 
- `info`
- `warn`
- `error`
- `fatal`
- `child`
- `log`

#### Auto-fix

This rule provides automatic fixing. When you run ESLint with the `--fix` flag, it will automatically reorder the arguments to put objects first, then the message, then any other arguments.

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Build
npm run build

# Lint
npm run lint
```

## License

MIT