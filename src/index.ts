import { correctArgsPosition } from './rules/correct-args-position';

const plugin = {
  rules: {
    'correct-args-position': correctArgsPosition,
  },
  configs: {
    recommended: {
      plugins: ['pino'],
      rules: {
        'pino/correct-args-position': 'error',
      },
    },
  },
};

// Named exports for CommonJS compatibility
export const rules = plugin.rules;
export const configs = plugin.configs;

// Default export for ESM
export default plugin;