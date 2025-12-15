export type PaytmMoneySegment = 'NSE' | 'BSE' | 'NFO' | 'MCX' | 'CDS';

export interface PaytmMoneyQuote {
  symbol: string;
  ltp: number;
  change: number;
  changePercent: number;
  previousClose?: number;
}

export type PaytmMoneyConfig = {
  baseUrl?: string;
  accessToken?: string;
  apiKey?: string;
  apiSecret?: string;
};

type PaytmMoneyFetchOptions = {
  accessToken: string;
  baseUrl: string;
  timeoutMs?: number;
};

function getEnvString(name: string): string | undefined {
  const v = (process.env as Record<string, string | undefined>)[name];
  return typeof v === 'string' && v.trim().length > 0 ? v.trim() : undefined;
}

export function getPaytmMoneyConfigFromEnv(): PaytmMoneyConfig {
  const baseUrl = getEnvString('EXPO_PUBLIC_PAYTM_MONEY_BASE_URL');
  const accessToken = getEnvString('EXPO_PUBLIC_PAYTM_MONEY_ACCESS_TOKEN');
  const apiKey = getEnvString('EXPO_PUBLIC_PAYTM_MONEY_API_KEY');
  const apiSecret = getEnvString('EXPO_PUBLIC_PAYTM_MONEY_API_SECRET');
  return { baseUrl, accessToken, apiKey, apiSecret };
}

export function resolvePaytmMoneyConfig(override?: PaytmMoneyConfig): PaytmMoneyConfig {
  const env = getPaytmMoneyConfigFromEnv();
  return {
    baseUrl: override?.baseUrl ?? env.baseUrl,
    accessToken: override?.accessToken ?? env.accessToken,
    apiKey: override?.apiKey ?? env.apiKey,
    apiSecret: override?.apiSecret ?? env.apiSecret,
  };
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const id = setTimeout(() => reject(new Error('Request timed out')), timeoutMs);
    promise
      .then((v) => {
        clearTimeout(id);
        resolve(v);
      })
      .catch((e) => {
        clearTimeout(id);
        reject(e);
      });
  });
}

async function paytmFetchJson<T>(path: string, opts: PaytmMoneyFetchOptions): Promise<T> {
  const url = `${opts.baseUrl.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
  console.log('[PaytmMoney] Fetch:', url);

  const res = await withTimeout(
    fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${opts.accessToken}`,
      },
    }),
    opts.timeoutMs ?? 12000,
  );

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    console.log('[PaytmMoney] Non-OK response', res.status, text.slice(0, 200));
    throw new Error(`PaytmMoney HTTP ${res.status}`);
  }

  return (await res.json()) as T;
}

export function isPaytmMoneyConfigured(config?: PaytmMoneyConfig): boolean {
  const { baseUrl, accessToken } = resolvePaytmMoneyConfig(config);
  return Boolean(baseUrl && accessToken);
}

export async function fetchPaytmMoneyQuotes(params: {
  symbols: string[];
  segment?: PaytmMoneySegment;
  config?: PaytmMoneyConfig;
}): Promise<Record<string, PaytmMoneyQuote>> {
  const { baseUrl, accessToken } = resolvePaytmMoneyConfig(params.config);
  if (!baseUrl) {
    console.log('[PaytmMoney] Missing baseUrl.');
    return {};
  }

  if (!accessToken) {
    console.log('[PaytmMoney] Missing accessToken. Provide an access token to fetch live quotes.');
    return {};
  }

  const segment = params.segment ?? 'NSE';
  const uniqueSymbols = Array.from(new Set(params.symbols.map((s) => s.trim()).filter(Boolean)));
  if (uniqueSymbols.length === 0) return {};

  try {
    const QUOTE_PATH = `market/quote?segment=${encodeURIComponent(segment)}&symbols=${encodeURIComponent(uniqueSymbols.join(','))}`;

    const data = await paytmFetchJson<unknown>(QUOTE_PATH, { baseUrl, accessToken });

    const arr: any[] = Array.isArray((data as any)?.data)
      ? (data as any).data
      : Array.isArray(data)
        ? (data as any)
        : [];

    const out: Record<string, PaytmMoneyQuote> = {};

    for (const item of arr) {
      const symbol = typeof item?.symbol === 'string' ? item.symbol : undefined;
      const ltpRaw = item?.ltp ?? item?.lastTradedPrice ?? item?.price;
      const changeRaw = item?.change ?? item?.netChange;
      const changePctRaw = item?.changePercent ?? item?.netChangePercent ?? item?.percentChange;
      const prevCloseRaw = item?.previousClose ?? item?.prevClose;

      const ltp = typeof ltpRaw === 'number' ? ltpRaw : Number(ltpRaw);
      const change = typeof changeRaw === 'number' ? changeRaw : Number(changeRaw);
      const changePercent = typeof changePctRaw === 'number' ? changePctRaw : Number(changePctRaw);
      const previousClose = typeof prevCloseRaw === 'number' ? prevCloseRaw : prevCloseRaw != null ? Number(prevCloseRaw) : undefined;

      if (!symbol || !Number.isFinite(ltp)) continue;

      out[symbol.toUpperCase()] = {
        symbol: symbol.toUpperCase(),
        ltp: Math.round(ltp * 100) / 100,
        change: Number.isFinite(change) ? Math.round(change * 100) / 100 : 0,
        changePercent: Number.isFinite(changePercent) ? Math.round(changePercent * 100) / 100 : 0,
        previousClose: Number.isFinite(previousClose) ? Math.round((previousClose ?? 0) * 100) / 100 : undefined,
      };
    }

    console.log('[PaytmMoney] Normalized quotes:', Object.keys(out).length);
    return out;
  } catch (e) {
    console.log('[PaytmMoney] Quote fetch failed:', e);
    return {};
  }
}
