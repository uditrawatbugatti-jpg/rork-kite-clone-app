import { useState, useEffect, useCallback, useRef } from 'react';
import createContextHook from '@nkzw/create-context-hook';

import { 
  WATCHLIST_DATA as INITIAL_WATCHLIST, 
  HOLDINGS_DATA as INITIAL_HOLDINGS, 
  POSITIONS_DATA as INITIAL_POSITIONS, 
  INDICES as INITIAL_INDICES,
  Stock,
  Holding,
  Position
} from '@/mocks/stocks';
import {
  fetchStockQuotesWithProxy,
  fetchIndexQuotesWithProxy,
} from '@/services/stockPriceService';
import { fetchPaytmMoneyQuotes, isPaytmMoneyConfigured } from '@/services/paytmMoneyService';
import { usePaytmMoneyConfig } from '@/context/PaytmMoneyConfigContext';

const REFRESH_INTERVAL = 8000; // Refresh every 8 seconds

type ISTParts = {
  weekday: number; // 0=Sun ... 6=Sat
  hour: number;
  minute: number;
};

const WEEKDAY_TO_NUM: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

const getISTParts = (date: Date): ISTParts => {
  const weekdayStr = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Kolkata', weekday: 'short' }).format(date);
  const weekday = WEEKDAY_TO_NUM[weekdayStr] ?? 0;

  const hour = Number(
    new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Kolkata', hour: '2-digit', hour12: false }).format(date),
  );

  const minute = Number(
    new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Kolkata', minute: '2-digit' }).format(date),
  );

  return {
    weekday,
    hour,
    minute,
  };
};

const isNseMarketOpenNow = (now: Date): boolean => {
  const { weekday, hour, minute } = getISTParts(now);

  const isWeekend = weekday === 0 || weekday === 6;
  if (isWeekend) return false;

  const mins = hour * 60 + minute;
  const open = 9 * 60 + 15;
  const close = 15 * 60 + 30;
  return mins >= open && mins <= close;
};

// Helper to generate realistic price fluctuation for fallback
const getFluctuatedPrice = (currentPrice: number, volatility: number = 0.002) => {
  const random = Math.random();
  const direction = random > 0.48 ? 1 : -1;
  const magnitude = Math.random() * volatility * direction;
  const newPrice = currentPrice * (1 + magnitude);
  return Math.round(newPrice * 100) / 100;
};

const getVolatility = (symbol: string): number => {
  const highVolatility = ['ADANIENT', 'TATAMOTORS'];
  const mediumVolatility = ['RELIANCE', 'BHARTIARTL', 'SBIN'];
  
  if (highVolatility.includes(symbol)) return 0.004;
  if (mediumVolatility.includes(symbol)) return 0.003;
  return 0.002;
};

export const [MarketProvider, useMarket] = createContextHook(() => {
  const { config: paytmConfig } = usePaytmMoneyConfig();
  const [stocks, setStocks] = useState<Stock[]>(INITIAL_WATCHLIST);
  const [indices, setIndices] = useState(INITIAL_INDICES);
  const [holdings, setHoldings] = useState<Holding[]>(INITIAL_HOLDINGS);
  const [positions, setPositions] = useState<Position[]>(INITIAL_POSITIONS);
  const [isLiveData, setIsLiveData] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const lastFetchRef = useRef<number>(0);
  const isFetchingRef = useRef<boolean>(false);

  // Store base prices for fallback simulation
  const [basePrices] = useState(() => {
    const stockBases: Record<string, number> = {};
    INITIAL_WATCHLIST.forEach(stock => {
      stockBases[stock.symbol] = stock.price - stock.change;
    });
    return stockBases;
  });

  const [indexBases] = useState(() => {
    return INITIAL_INDICES.map(index => index.price - index.change);
  });

  // Fetch real-time data from Paytm Money (if configured), fallback to Yahoo Finance
  const fetchLiveData = useCallback(async (reason: 'init' | 'interval' | 'manual' = 'manual') => {
    if (isFetchingRef.current) {
      console.log('[MarketContext] Already fetching, skipping...');
      return;
    }

    const now = Date.now();
    if (now - lastFetchRef.current < 5000) {
      console.log('[MarketContext] Too soon to fetch again');
      return;
    }

    isFetchingRef.current = true;
    lastFetchRef.current = now;

    try {
      console.log('[MarketContext] Fetching live market data...', { reason });
      
      const allSymbols = new Set<string>();
      stocks.forEach((s) => allSymbols.add(s.symbol));
      holdings.forEach((h) => allSymbols.add(h.symbol));
      positions.forEach((p) => allSymbols.add(p.symbol));

      const rawSymbolsArray = Array.from(allSymbols).map((s) => s.toUpperCase());

      const paytmEnabled = isPaytmMoneyConfigured(paytmConfig);
      console.log('[MarketContext] Paytm configured:', paytmEnabled);

      const [paytmQuotes, yahooStockQuotes, indexQuotes] = await Promise.all([
        paytmEnabled
          ? fetchPaytmMoneyQuotes({ symbols: rawSymbolsArray, segment: 'NSE', config: paytmConfig })
          : Promise.resolve({}),
        fetchStockQuotesWithProxy(rawSymbolsArray),
        fetchIndexQuotesWithProxy(),
      ]);

      const upperYahooKeys = Object.keys(yahooStockQuotes).slice(0, 10);
      console.log('[MarketContext] Sample Yahoo keys:', upperYahooKeys);

      const hasPaytm = Object.keys(paytmQuotes).length > 0;
      const hasYahooStocks = Object.keys(yahooStockQuotes).length > 0;
      const hasIndexData = indexQuotes.length > 0;

      console.log('[MarketContext] Live sources:', {
        paytm: Object.keys(paytmQuotes).length,
        yahooStocks: Object.keys(yahooStockQuotes).length,
        indices: indexQuotes.length,
      });

      const getLiveQuoteForSymbol = (symbol: string) => {
        const upper = symbol.toUpperCase();
        const paytm = (paytmQuotes as any)[upper] as any;
        if (paytm) {
          const prevClose = paytm.previousClose ?? (paytm.ltp - paytm.change);
          return {
            price: paytm.ltp as number,
            previousClose: prevClose as number,
            change: paytm.change as number,
            changePercent: paytm.changePercent as number,
            isUp: (paytm.change as number) >= 0,
          };
        }
        const yahoo = yahooStockQuotes[upper] ?? yahooStockQuotes[symbol] ?? yahooStockQuotes[symbol.toUpperCase()];
        if (yahoo) {
          return {
            price: yahoo.price,
            previousClose: yahoo.previousClose,
            change: yahoo.change,
            changePercent: yahoo.changePercent,
            isUp: yahoo.isUp,
          };
        }
        return undefined;
      };

      const hasAnyLive = hasPaytm || hasYahooStocks;

      if (hasAnyLive) {
        setStocks((currentStocks) =>
          currentStocks.map((stock) => {
            const q = getLiveQuoteForSymbol(stock.symbol);
            if (!q) return stock;
            return {
              ...stock,
              price: q.price,
              change: q.change,
              changePercent: q.changePercent,
              isUp: q.isUp,
            };
          }),
        );

        setHoldings((currentHoldings) =>
          currentHoldings.map((holding) => {
            const q = getLiveQuoteForSymbol(holding.symbol);
            if (!q) return holding;

            const newLtp = q.price;
            const currentValue = holding.quantity * newLtp;
            const investedValue = holding.invested;
            const pnl = currentValue - investedValue;
            const pnlPercent = investedValue > 0 ? (pnl / investedValue) * 100 : 0;

            const prevClose = q.previousClose || holding.closePrice || holding.ltp - holding.dayChange;
            const safePrevClose = prevClose === 0 ? newLtp : prevClose;
            const dayChange = newLtp - safePrevClose;
            const dayChangePercent = safePrevClose > 0 ? (dayChange / safePrevClose) * 100 : 0;

            return {
              ...holding,
              ltp: newLtp,
              current: Math.round(currentValue * 100) / 100,
              pnl: Math.round(pnl * 100) / 100,
              pnlPercent: Math.round(pnlPercent * 100) / 100,
              dayChange: Math.round(dayChange * 100) / 100,
              dayChangePercent: Math.round(dayChangePercent * 100) / 100,
              closePrice: q.previousClose,
            };
          }),
        );

        setPositions((currentPositions) =>
          currentPositions.map((position) => {
            const q = getLiveQuoteForSymbol(position.symbol);
            if (!q) return position;

            const newLtp = q.price;
            const pnl = (newLtp - position.avgPrice) * position.quantity;

            return {
              ...position,
              ltp: newLtp,
              pnl: Math.round(pnl * 100) / 100,
            };
          }),
        );

        setIsLiveData(true);
        setLastUpdated(new Date());
      } else {
        console.log('[MarketContext] No live stock data available (Paytm/Yahoo). Falling back to simulation.');
        setIsLiveData(false);
      }

      if (hasIndexData) {
        console.log('[MarketContext] Received live index data:', indexQuotes.length, 'indices');
        setIndices(indexQuotes);
      }

      setIsLoading(false);
    } catch (error) {
      console.error('[MarketContext] Error fetching live data:', error);
      setIsLiveData(false);
      setIsLoading(false);
    } finally {
      isFetchingRef.current = false;
    }
  }, [holdings, paytmConfig, positions, stocks]);

  // Initial fetch on mount
  useEffect(() => {
    console.log('[MarketContext] Initial data fetch');
    fetchLiveData('init');
  }, [fetchLiveData]);

  // Periodic refresh
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('[MarketContext] Periodic refresh');
      fetchLiveData('interval');
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [fetchLiveData]);

  const [isMarketOpen, setIsMarketOpen] = useState<boolean>(() => isNseMarketOpenNow(new Date()));

  useEffect(() => {
    const interval = setInterval(() => {
      const open = isNseMarketOpenNow(new Date());
      setIsMarketOpen(open);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Fallback simulation when live data is not available (ONLY when market is open)
  useEffect(() => {
    if (isLiveData) return;
    if (!isMarketOpen) {
      console.log('[MarketContext] Market closed (IST). Simulation paused.');
      return;
    }

    const interval = setInterval(() => {
      // Update Indices with simulation
      setIndices((currentIndices) =>
        currentIndices.map((index, i) => {
          const volatility = 0.0015;
          const newPrice = getFluctuatedPrice(index.price, volatility);
          const basePrice = indexBases[i] || index.price - index.change;
          const safeBase = basePrice === 0 ? newPrice : basePrice;
          const change = newPrice - safeBase;
          const changePercent = safeBase > 0 ? (change / safeBase) * 100 : 0;
          return {
            ...index,
            price: newPrice,
            change: Math.round(change * 100) / 100,
            changePercent: Math.round(changePercent * 100) / 100,
            isUp: change >= 0,
          };
        }),
      );

      // Update Stocks with simulation
      setStocks((currentStocks) =>
        currentStocks.map((stock) => {
          const volatility = getVolatility(stock.symbol);
          const newPrice = getFluctuatedPrice(stock.price, volatility);
          const basePrice = basePrices[stock.symbol] || stock.price - stock.change;
          const safeBase = basePrice === 0 ? newPrice : basePrice;
          const change = newPrice - safeBase;
          const changePercent = safeBase > 0 ? (change / safeBase) * 100 : 0;

          return {
            ...stock,
            price: newPrice,
            change: Math.round(change * 100) / 100,
            changePercent: Math.round(changePercent * 100) / 100,
            isUp: change >= 0,
          };
        }),
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [isLiveData, isMarketOpen, basePrices, indexBases]);

  // Update Holdings and Positions based on Stock prices (for simulation mode)
  useEffect(() => {
    if (isLiveData) return;
    if (!isMarketOpen) return;

    const stockPrices = stocks.reduce((acc, stock) => {
      acc[stock.symbol] = stock.price;
      return acc;
    }, {} as Record<string, number>);

    setHoldings((currentHoldings) =>
      currentHoldings.map((holding) => {
        let newLtp = stockPrices[holding.symbol];
        if (!newLtp) {
          newLtp = getFluctuatedPrice(holding.ltp);
        }

        const currentValue = holding.quantity * newLtp;
        const investedValue = holding.invested;
        const pnl = currentValue - investedValue;
        const pnlPercent = investedValue > 0 ? (pnl / investedValue) * 100 : 0;

        const prevClose = holding.closePrice || holding.ltp - holding.dayChange;
        const safePrevClose = prevClose === 0 ? newLtp : prevClose;
        const dayChange = newLtp - safePrevClose;
        const dayChangePercent = safePrevClose > 0 ? (dayChange / safePrevClose) * 100 : 0;

        return {
          ...holding,
          ltp: newLtp,
          current: Math.round(currentValue * 100) / 100,
          pnl: Math.round(pnl * 100) / 100,
          pnlPercent: Math.round(pnlPercent * 100) / 100,
          dayChange: Math.round(dayChange * 100) / 100,
          dayChangePercent: Math.round(dayChangePercent * 100) / 100,
        };
      }),
    );

    setPositions((currentPositions) =>
      currentPositions.map((position) => {
        const newLtp = getFluctuatedPrice(position.ltp);
        const pnl = (newLtp - position.avgPrice) * position.quantity;

        return {
          ...position,
          ltp: newLtp,
          pnl: Math.round(pnl * 100) / 100,
        };
      }),
    );
  }, [stocks, isLiveData, isMarketOpen]);

  const updateHolding = useCallback((symbol: string, updates: Partial<Holding>) => {
    setHoldings(prev => prev.map(h => h.symbol === symbol ? { ...h, ...updates } : h));
  }, []);

  const addHolding = useCallback((holding: Holding) => {
    const newHolding = { 
      ...holding, 
      closePrice: holding.closePrice || holding.avgPrice
    };
    setHoldings(prev => [...prev, newHolding]);
  }, []);

  const deleteHolding = useCallback((symbol: string) => {
    setHoldings(prev => prev.filter(h => h.symbol !== symbol));
  }, []);

  const updatePosition = useCallback((symbol: string, updates: Partial<Position>) => {
    setPositions(prev => prev.map(p => p.symbol === symbol ? { ...p, ...updates } : p));
  }, []);

  const addPosition = useCallback((position: Position) => {
    const newPosition = { 
      ...position, 
      closePrice: position.closePrice || position.avgPrice 
    };
    setPositions(prev => [...prev, newPosition]);
  }, []);

  const deletePosition = useCallback((symbol: string) => {
    setPositions(prev => prev.filter(p => p.symbol !== symbol));
  }, []);

  const refreshData = useCallback(() => {
    console.log('[MarketContext] Manual refresh triggered');
    fetchLiveData('manual');
  }, [fetchLiveData]);

  return {
    stocks,
    indices,
    holdings,
    positions,
    isLiveData,
    lastUpdated,
    isLoading,
    updateHolding,
    addHolding,
    deleteHolding,
    updatePosition,
    addPosition,
    deletePosition,
    refreshData,
  };
});
