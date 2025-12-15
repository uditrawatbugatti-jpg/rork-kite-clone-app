

import { Platform } from 'react-native';

const YAHOO_FINANCE_APIS = [
  'https://query1.finance.yahoo.com/v7/finance/quote',
  'https://query2.finance.yahoo.com/v7/finance/quote',
] as const;

const DEFAULT_TIMEOUT_MS = 10000;

type YahooQuote = {
  symbol?: string;
  regularMarketPrice?: number;
  regularMarketPreviousClose?: number;
  regularMarketChange?: number;
  regularMarketChangePercent?: number;
};

// Map local symbols to Yahoo Finance symbols (NSE)
const SYMBOL_MAP: Record<string, string> = {
  'RELIANCE': 'RELIANCE.NS',
  'HDFCBANK': 'HDFCBANK.NS',
  'TCS': 'TCS.NS',
  'INFY': 'INFY.NS',
  'ICICIBANK': 'ICICIBANK.NS',
  'SBIN': 'SBIN.NS',
  'BHARTIARTL': 'BHARTIARTL.NS',
  'ITC': 'ITC.NS',
  'ADANIENT': 'ADANIENT.NS',
  'TATAMOTORS': 'TATAMOTORS.NS',
  'LT': 'LT.NS',
  'AXISBANK': 'AXISBANK.NS',
  'WIPRO': 'WIPRO.NS',
  'HINDUNILVR': 'HINDUNILVR.NS',
  'KOTAKBANK': 'KOTAKBANK.NS',
  'BAJFINANCE': 'BAJFINANCE.NS',
  'MARUTI': 'MARUTI.NS',
  'ASIANPAINT': 'ASIANPAINT.NS',
  'SUNPHARMA': 'SUNPHARMA.NS',
  'TITAN': 'TITAN.NS',
};

// Index symbols
const INDEX_SYMBOL_MAP: Record<string, string> = {
  'NIFTY 50': '^NSEI',
  'SENSEX': '^BSESN',
};

export interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  previousClose: number;
  isUp: boolean;
}

export interface IndexQuote {
  name: string;
  price: number;
  change: number;
  changePercent: number;
  isUp: boolean;
}

const normalizeLocalSymbol = (symbol: string): string => symbol.trim().toUpperCase();

const toYahooSymbol = (localSymbol: string): string | undefined => {
  const sym = normalizeLocalSymbol(localSymbol);
  if (!sym) return undefined;

  if (sym.includes('.')) return sym;
  if (SYMBOL_MAP[sym]) return SYMBOL_MAP[sym];

  return `${sym}.NS`;
};

const toLocalSymbolFromYahoo = (yahooSymbol: string | undefined): string | undefined => {
  const sym = (yahooSymbol ?? '').toUpperCase();
  if (!sym) return undefined;

  const mapped = Object.entries(SYMBOL_MAP).find(([, yahooSym]) => yahooSym.toUpperCase() === sym)?.[0];
  if (mapped) return mapped;

  if (sym.endsWith('.NS')) return sym.replace(/\.NS$/i, '');
  return sym;
};

const withTimeout = async <T,>(fn: (signal: AbortSignal) => Promise<T>, timeoutMs: number): Promise<T> => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fn(controller.signal);
  } finally {
    clearTimeout(id);
  }
};

const getYahooHeaders = (): Record<string, string> => {
  const base: Record<string, string> = {
    Accept: 'application/json',
    'Cache-Control': 'no-cache',
    Pragma: 'no-cache',
  };

  if (Platform.OS !== 'web') {
    base['User-Agent'] = 'Mozilla/5.0 (Mobile; Expo) AppleWebKit/537.36 (KHTML, like Gecko)';
  }

  return base;
};

const buildYahooQuoteUrls = (symbolsParam: string): string[] => {
  const cacheBuster = Date.now();
  return YAHOO_FINANCE_APIS.map(
    (api) => `${api}?symbols=${encodeURIComponent(symbolsParam)}&region=IN&lang=en-IN&formatted=false&_=${cacheBuster}`,
  );
};

const parseYahooQuotesToRecord = (data: any): Record<string, StockQuote> => {
  const quotes: Record<string, StockQuote> = {};

  if (data?.quoteResponse?.result) {
    for (const quote of data.quoteResponse.result as YahooQuote[]) {
      const localSymbol = toLocalSymbolFromYahoo(quote.symbol);
      if (!localSymbol) continue;

      const price = quote.regularMarketPrice ?? 0;
      const previousClose = quote.regularMarketPreviousClose ?? price;
      const change = quote.regularMarketChange ?? 0;
      const changePercent = quote.regularMarketChangePercent ?? 0;

      if (price > 0) {
        quotes[localSymbol.toUpperCase()] = {
          symbol: localSymbol.toUpperCase(),
          price: Math.round(price * 100) / 100,
          change: Math.round(change * 100) / 100,
          changePercent: Math.round(changePercent * 100) / 100,
          previousClose: Math.round(previousClose * 100) / 100,
          isUp: change >= 0,
        };
      }
    }
  }

  return quotes;
};

const parseYahooIndicesToArray = (data: any): IndexQuote[] => {
  const indices: IndexQuote[] = [];

  if (data?.quoteResponse?.result) {
    for (const quote of data.quoteResponse.result) {
      const indexName = Object.entries(INDEX_SYMBOL_MAP).find(([, yahooSym]) => yahooSym === quote.symbol)?.[0];

      if (indexName) {
        const price = quote.regularMarketPrice || 0;
        const change = quote.regularMarketChange || 0;
        const changePercent = quote.regularMarketChangePercent || 0;

        indices.push({
          name: indexName,
          price: Math.round(price * 100) / 100,
          change: Math.round(change * 100) / 100,
          changePercent: Math.round(changePercent * 100) / 100,
          isUp: change >= 0,
        });
      }
    }
  }

  return indices;
};

const tryFetchJson = async (url: string): Promise<any> => {
  return await withTimeout(async (signal) => {
    const response = await fetch(url, {
      method: 'GET',
      headers: getYahooHeaders(),
      signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }, DEFAULT_TIMEOUT_MS);
};

// Fetch stock quotes from Yahoo Finance
export async function fetchStockQuotes(symbols: string[]): Promise<Record<string, StockQuote>> {
  try {
    const yahooSymbols = symbols.map(toYahooSymbol).filter(Boolean) as string[];

    if (yahooSymbols.length === 0) {
      console.log('[StockService] No valid symbols to fetch');
      return {};
    }

    const symbolsParam = yahooSymbols.join(',');
    const urls = buildYahooQuoteUrls(symbolsParam);

    console.log('[StockService] Fetching quotes for:', symbolsParam);

    for (const url of urls) {
      try {
        const data = await tryFetchJson(url);
        const quotes = parseYahooQuotesToRecord(data);
        if (Object.keys(quotes).length > 0) {
          for (const sym of Object.keys(quotes)) {
            const q = quotes[sym];
            console.log(`[StockService] ${sym}: ₹${q.price.toFixed(2)} (${q.change >= 0 ? '+' : ''}${q.change.toFixed(2)})`);
          }
          return quotes;
        }
      } catch (e) {
        console.log('[StockService] Quote endpoint failed, trying next...', String((e as any)?.message ?? e));
      }
    }

    return {};
  } catch (error) {
    console.error('[StockService] Error fetching stock quotes:', error);
    return {};
  }
}

// Fetch index quotes
export async function fetchIndexQuotes(): Promise<IndexQuote[]> {
  try {
    const yahooSymbols = Object.values(INDEX_SYMBOL_MAP).join(',');
    const urls = buildYahooQuoteUrls(yahooSymbols);

    console.log('[StockService] Fetching index quotes');

    for (const url of urls) {
      try {
        const data = await tryFetchJson(url);
        const indices = parseYahooIndicesToArray(data);
        if (indices.length > 0) {
          for (const idx of indices) {
            console.log(
              `[StockService] ${idx.name}: ${idx.price.toFixed(2)} (${idx.change >= 0 ? '+' : ''}${idx.change.toFixed(2)})`,
            );
          }

          return indices.sort((a, b) => {
            if (a.name === 'NIFTY 50') return -1;
            if (b.name === 'NIFTY 50') return 1;
            return 0;
          });
        }
      } catch (e) {
        console.log('[StockService] Index endpoint failed, trying next...', String((e as any)?.message ?? e));
      }
    }

    return [];
  } catch (error) {
    console.error('[StockService] Error fetching index quotes:', error);
    return [];
  }
}

// Alternative: Use a CORS proxy for web compatibility
const CORS_PROXIES = [
  'https://corsproxy.io/?',
  'https://api.allorigins.win/raw?url=',
  'https://api.codetabs.com/v1/proxy?quest=',
];

export async function fetchStockQuotesWithProxy(symbols: string[]): Promise<Record<string, StockQuote>> {
  try {
    const yahooSymbols = symbols.map(toYahooSymbol).filter(Boolean) as string[];

    if (yahooSymbols.length === 0) {
      console.log('[StockService] No valid symbols provided');
      return {};
    }

    console.log('[StockService] Fetching quotes for symbols:', yahooSymbols.slice(0, 5).join(', '), '...');

    const symbolsParam = yahooSymbols.join(',');
    const targetUrls = buildYahooQuoteUrls(symbolsParam);

    const urls = targetUrls.flatMap((targetUrl) => [
      targetUrl,
      ...CORS_PROXIES.map((proxy) => `${proxy}${encodeURIComponent(targetUrl)}`),
    ]);

    for (const url of urls) {
      try {
        const isProxied = url.includes('corsproxy') || url.includes('allorigins') || url.includes('codetabs');
        console.log('[StockService] Attempting:', isProxied ? 'proxied request' : 'direct request');

        const data = await tryFetchJson(url);
        const quotes = parseYahooQuotesToRecord(data);

        if (Object.keys(quotes).length > 0) {
          console.log('[StockService] ✓ Successfully fetched', Object.keys(quotes).length, 'stock quotes');
          Object.keys(quotes).slice(0, 3).forEach(sym => {
            const q = quotes[sym];
            console.log(`  ${sym}: ₹${q.price} (${q.change >= 0 ? '+' : ''}${q.change})`);
          });
          return quotes;
        } else {
          console.log('[StockService] Response had no valid quotes');
        }
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : String(error);
        console.log('[StockService] Request failed:', errMsg.substring(0, 100));
        continue;
      }
    }

    console.warn('[StockService] ✗ All stock quote endpoints failed');
    return {};
  } catch (error) {
    console.error('[StockService] Error in fetchStockQuotesWithProxy:', error);
    return {};
  }
}

export async function fetchIndexQuotesWithProxy(): Promise<IndexQuote[]> {
  try {
    const yahooSymbols = Object.values(INDEX_SYMBOL_MAP).join(',');
    console.log('[StockService] Fetching indices:', Object.keys(INDEX_SYMBOL_MAP).join(', '));
    
    const targetUrls = buildYahooQuoteUrls(yahooSymbols);

    const urls = targetUrls.flatMap((targetUrl) => [
      targetUrl,
      ...CORS_PROXIES.map((proxy) => `${proxy}${encodeURIComponent(targetUrl)}`),
    ]);

    for (const url of urls) {
      try {
        const isProxied = url.includes('corsproxy') || url.includes('allorigins') || url.includes('codetabs');
        console.log('[StockService] Attempting index fetch:', isProxied ? 'proxied' : 'direct');
        
        const data = await tryFetchJson(url);
        const indices = parseYahooIndicesToArray(data);

        if (indices.length > 0) {
          console.log('[StockService] ✓ Successfully fetched', indices.length, 'indices');
          indices.forEach(idx => {
            console.log(`  ${idx.name}: ${idx.price.toFixed(2)} (${idx.change >= 0 ? '+' : ''}${idx.change.toFixed(2)})`);
          });
          return indices.sort((a, b) => (a.name === 'NIFTY 50' ? -1 : b.name === 'NIFTY 50' ? 1 : 0));
        } else {
          console.log('[StockService] Response had no valid indices');
        }
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : String(error);
        console.log('[StockService] Index request failed:', errMsg.substring(0, 100));
        continue;
      }
    }

    console.warn('[StockService] ✗ All index quote endpoints failed');
    return [];
  } catch (error) {
    console.error('[StockService] Error in fetchIndexQuotesWithProxy:', error);
    return [];
  }
}

export { SYMBOL_MAP, INDEX_SYMBOL_MAP, toYahooSymbol as getYahooSymbolForStock };
