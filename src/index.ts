import { correctArgsPosition } from './rules/correct-args-position';

export = {
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