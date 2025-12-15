import { Platform } from 'react-native';

const systemFont = Platform.select({
  ios: 'System',
  android: 'Roboto',
  default: 'System',
});

export const Typography = {
  fontFamily: systemFont,

  stockSymbol: {
    fontFamily: systemFont,
    fontSize: 15,
    fontWeight: '500' as const,
  },

  stockName: {
    fontFamily: systemFont,
    fontSize: 11,
    fontWeight: '400' as const,
  },

  stockPrice: {
    fontFamily: systemFont,
    fontSize: 15,
    fontWeight: '600' as const,
  },

  stockChange: {
    fontFamily: systemFont,
    fontSize: 11,
    fontWeight: '400' as const,
  },

  indexName: {
    fontFamily: systemFont,
    fontSize: 11,
    fontWeight: '500' as const,
  },

  indexPrice: {
    fontFamily: systemFont,
    fontSize: 13,
    fontWeight: '600' as const,
  },

  indexChange: {
    fontFamily: systemFont,
    fontSize: 10,
    fontWeight: '400' as const,
  },

  title: {
    fontFamily: systemFont,
    fontSize: 18,
    fontWeight: '600' as const,
  },

  sectionLabel: {
    fontFamily: systemFont,
    fontSize: 11,
    fontWeight: '500' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },

  body: {
    fontFamily: systemFont,
    fontSize: 13,
    fontWeight: '400' as const,
  },

  bodyMedium: {
    fontFamily: systemFont,
    fontSize: 13,
    fontWeight: '500' as const,
  },

  bodyStrong: {
    fontFamily: systemFont,
    fontSize: 13,
    fontWeight: '600' as const,
  },

  caption: {
    fontFamily: systemFont,
    fontSize: 11,
    fontWeight: '400' as const,
  },

  monoNumber: {
    fontVariant: ['tabular-nums'] as const,
  },
};
