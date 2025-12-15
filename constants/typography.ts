import { Platform } from 'react-native';

const systemFont = Platform.select({
  ios: 'System',
  android: 'sans-serif',
  default: 'System',
});

export const Typography = {
  fontFamily: systemFont,

  title: {
    fontFamily: systemFont,
    fontSize: 22,
    letterSpacing: -0.2,
    fontWeight: '700' as const,
  },

  sectionLabel: {
    fontFamily: systemFont,
    fontSize: 12,
    letterSpacing: 0.2,
    fontWeight: '600' as const,
  },

  body: {
    fontFamily: systemFont,
    fontSize: 14,
    letterSpacing: 0.1,
    fontWeight: '500' as const,
  },

  bodyStrong: {
    fontFamily: systemFont,
    fontSize: 14,
    letterSpacing: 0.1,
    fontWeight: '700' as const,
  },

  monoNumber: {
    fontFamily: Platform.select({
      ios: 'Menlo',
      android: 'monospace',
      default: 'monospace',
    }),
    fontVariant: ['tabular-nums'] as const,
  },
};
