

const YAHOO_FINANCE_API = 'https://query1.finance.yahoo.com/v7/finance/quote';

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

// Fetch stock quotes from Yahoo Finance
export async function fetchStockQuotes(symbols: string[]): Promise<Record<string, StockQuote>> {
  try {
    const yahooSymbols = symbols
      .map(toYahooSymbol)
      .filter(Boolean) as string[];
    
    if (yahooSymbols.length === 0) {
      console.log('[StockService] No valid symbols to fetch');
      return {};
    }

    const symbolsParam = yahooSymbols.join(',');
    const cacheBuster = Date.now();
    const url = `${YAHOO_FINANCE_API}?symbols=${encodeURIComponent(symbolsParam)}&region=IN&lang=en-IN&formatted=false&_=${cacheBuster}`;
    
    console.log('[StockService] Fetching quotes for:', symbolsParam);
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const quotes: Record<string, StockQuote> = {};

    if (data.quoteResponse?.result) {
      for (const quote of data.quoteResponse.result as YahooQuote[]) {
        const localSymbol = toLocalSymbolFromYahoo(quote.symbol);
        if (!localSymbol) continue;

        const price = quote.regularMarketPrice ?? 0;
        const previousClose = quote.regularMarketPreviousClose ?? price;
        const change = quote.regularMarketChange ?? 0;
        const changePercent = quote.regularMarketChangePercent ?? 0;

        quotes[localSymbol] = {
          symbol: localSymbol,
          price: Math.round(price * 100) / 100,
          change: Math.round(change * 100) / 100,
          changePercent: Math.round(changePercent * 100) / 100,
          previousClose: Math.round(previousClose * 100) / 100,
          isUp: change >= 0,
        };
        
        console.log(`[StockService] ${localSymbol}: ₹${price.toFixed(2)} (${change >= 0 ? '+' : ''}${change.toFixed(2)})`);
      }
    }

    return quotes;
  } catch (error) {
    console.error('[StockService] Error fetching stock quotes:', error);
    return {};
  }
}

// Fetch index quotes
export async function fetchIndexQuotes(): Promise<IndexQuote[]> {
  try {
    const yahooSymbols = Object.values(INDEX_SYMBOL_MAP).join(',');
    const cacheBuster = Date.now();
    const url = `${YAHOO_FINANCE_API}?symbols=${encodeURIComponent(yahooSymbols)}&region=IN&lang=en-IN&formatted=false&_=${cacheBuster}`;
    
    console.log('[StockService] Fetching index quotes');
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const indices: IndexQuote[] = [];

    if (data.quoteResponse?.result) {
      for (const quote of data.quoteResponse.result) {
        const indexName = Object.entries(INDEX_SYMBOL_MAP).find(
          ([_, yahooSym]) => yahooSym === quote.symbol
        )?.[0];

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
          
          console.log(`[StockService] ${indexName}: ${price.toFixed(2)} (${change >= 0 ? '+' : ''}${change.toFixed(2)})`);
        }
      }
    }

    // Sort to ensure NIFTY 50 comes first
    return indices.sort((a, b) => {
      if (a.name === 'NIFTY 50') return -1;
      if (b.name === 'NIFTY 50') return 1;
      return 0;
    });
  } catch (error) {
    console.error('[StockService] Error fetching index quotes:', error);
    return [];
  }
}

// Alternative: Use a CORS proxy for web compatibility
const CORS_PROXIES = [
  'https://api.allorigins.win/raw?url=',
  'https://corsproxy.io/?',
];

export async function fetchStockQuotesWithProxy(symbols: string[]): Promise<Record<string, StockQuote>> {
  try {
    const yahooSymbols = symbols
      .map(toYahooSymbol)
      .filter(Boolean) as string[];
    
    if (yahooSymbols.length === 0) {
      return {};
    }

    const symbolsParam = yahooSymbols.join(',');
    const cacheBuster = Date.now();
    const targetUrl = `${YAHOO_FINANCE_API}?symbols=${encodeURIComponent(symbolsParam)}&region=IN&lang=en-IN&formatted=false&_=${cacheBuster}`;
    
    // Try direct first, then proxies
    const urls = [
      targetUrl,
      ...CORS_PROXIES.map(proxy => `${proxy}${encodeURIComponent(targetUrl)}`),
    ];

    for (const url of urls) {
      try {
        console.log('[StockService] Trying URL:', url.substring(0, 100));
        
        const response = await fetch(url, {
          headers: {
            'Accept': 'application/json',
          },
        });

        if (!response.ok) continue;

        const data = await response.json();
        const quotes: Record<string, StockQuote> = {};

        if (data.quoteResponse?.result) {
          for (const quote of data.quoteResponse.result as YahooQuote[]) {
            const localSymbol = toLocalSymbolFromYahoo(quote.symbol);
            if (!localSymbol) continue;

            const price = quote.regularMarketPrice ?? 0;
            const previousClose = quote.regularMarketPreviousClose ?? price;
            const change = quote.regularMarketChange ?? 0;
            const changePercent = quote.regularMarketChangePercent ?? 0;

            quotes[localSymbol] = {
              symbol: localSymbol,
              price: Math.round(price * 100) / 100,
              change: Math.round(change * 100) / 100,
              changePercent: Math.round(changePercent * 100) / 100,
              previousClose: Math.round(previousClose * 100) / 100,
              isUp: change >= 0,
            };
          }
          
          if (Object.keys(quotes).length > 0) {
            console.log('[StockService] Successfully fetched', Object.keys(quotes).length, 'quotes');
            return quotes;
          }
        }
      } catch {
        console.log('[StockService] URL failed, trying next...');
        continue;
      }
    }

    return {};
  } catch (error) {
    console.error('[StockService] Error fetching with proxy:', error);
    return {};
  }
}

export async function fetchIndexQuotesWithProxy(): Promise<IndexQuote[]> {
  try {
    const yahooSymbols = Object.values(INDEX_SYMBOL_MAP).join(',');
    const cacheBuster = Date.now();
    const targetUrl = `${YAHOO_FINANCE_API}?symbols=${encodeURIComponent(yahooSymbols)}&region=IN&lang=en-IN&formatted=false&_=${cacheBuster}`;
    
    const urls = [
      targetUrl,
      ...CORS_PROXIES.map(proxy => `${proxy}${encodeURIComponent(targetUrl)}`),
    ];

    for (const url of urls) {
      try {
        const response = await fetch(url, {
          headers: {
            'Accept': 'application/json',
          },
        });

        if (!response.ok) continue;

        const data = await response.json();
        const indices: IndexQuote[] = [];

        if (data.quoteResponse?.result) {
          for (const quote of data.quoteResponse.result) {
            const indexName = Object.entries(INDEX_SYMBOL_MAP).find(
              ([_, yahooSym]) => yahooSym === quote.symbol
            )?.[0];

            if (indexName) {
              indices.push({
                name: indexName,
                price: Math.round((quote.regularMarketPrice || 0) * 100) / 100,
                change: Math.round((quote.regularMarketChange || 0) * 100) / 100,
                changePercent: Math.round((quote.regularMarketChangePercent || 0) * 100) / 100,
                isUp: (quote.regularMarketChange || 0) >= 0,
              });
            }
          }

          if (indices.length > 0) {
            return indices.sort((a, b) => a.name === 'NIFTY 50' ? -1 : b.name === 'NIFTY 50' ? 1 : 0);
          }
        }
      } catch {
        continue;
      }
    }

    return [];
  } catch (error) {
    console.error('[StockService] Error fetching indices with proxy:', error);
    return [];
  }
}

export { SYMBOL_MAP, INDEX_SYMBOL_MAP, toYahooSymbol as getYahooSymbolForStock };
