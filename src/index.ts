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

export default plugin;