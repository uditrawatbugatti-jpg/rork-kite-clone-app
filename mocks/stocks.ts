export interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  exchange: 'NSE' | 'BSE';
  isUp: boolean;
}

export interface Holding {
  symbol: string;
  quantity: number;
  avgPrice: number;
  ltp: number;
  pnl: number;
  pnlPercent: number;
  dayChange: number;
  dayChangePercent: number;
  invested: number;
  current: number;
  closePrice?: number;
}

export interface Position {
  symbol: string;
  product: 'MIS' | 'CNC' | 'NRML';
  quantity: number;
  avgPrice: number;
  ltp: number;
  pnl: number;
  type: 'BUY' | 'SELL';
  closePrice?: number;
}

export interface Order {
  id: string;
  symbol: string;
  exchange: 'NSE' | 'BSE';
  type: 'BUY' | 'SELL';
  product: 'MIS' | 'CNC';
  status: 'EXECUTED' | 'REJECTED' | 'CANCELLED' | 'OPEN';
  price: number;
  quantity: number;
  totalQuantity: number;
  time: string;
  message?: string;
}

export const INDICES = [
  {
    name: 'NIFTY 50',
    price: 24677.80,
    change: -90.10,
    changePercent: -0.36,
    isUp: false,
  },
  {
    name: 'SENSEX',
    price: 81709.12,
    change: -236.18,
    changePercent: -0.29,
    isUp: false,
  },
];

export const WATCHLIST_DATA: Stock[] = [
  {
    symbol: 'RELIANCE',
    name: 'Reliance Industries',
    price: 1272.45,
    change: -8.30,
    changePercent: -0.65,
    exchange: 'NSE',
    isUp: false,
  },
  {
    symbol: 'HDFCBANK',
    name: 'HDFC Bank',
    price: 1847.20,
    change: 12.55,
    changePercent: 0.68,
    exchange: 'NSE',
    isUp: true,
  },
  {
    symbol: 'TCS',
    name: 'Tata Consultancy Services',
    price: 4198.75,
    change: -42.10,
    changePercent: -0.99,
    exchange: 'NSE',
    isUp: false,
  },
  {
    symbol: 'INFY',
    name: 'Infosys',
    price: 1932.85,
    change: 18.40,
    changePercent: 0.96,
    exchange: 'NSE',
    isUp: true,
  },
  {
    symbol: 'ICICIBANK',
    name: 'ICICI Bank',
    price: 1348.60,
    change: 9.25,
    changePercent: 0.69,
    exchange: 'NSE',
    isUp: true,
  },
  {
    symbol: 'SBIN',
    name: 'State Bank of India',
    price: 844.15,
    change: -5.70,
    changePercent: -0.67,
    exchange: 'NSE',
    isUp: false,
  },
  {
    symbol: 'BHARTIARTL',
    name: 'Bharti Airtel',
    price: 1598.30,
    change: 22.45,
    changePercent: 1.42,
    exchange: 'NSE',
    isUp: true,
  },
  {
    symbol: 'ITC',
    name: 'ITC Ltd',
    price: 492.80,
    change: 4.15,
    changePercent: 0.85,
    exchange: 'NSE',
    isUp: true,
  },
  {
    symbol: 'ADANIENT',
    name: 'Adani Enterprises',
    price: 2415.50,
    change: -28.90,
    changePercent: -1.18,
    exchange: 'NSE',
    isUp: false,
  },
  {
    symbol: 'TATAMOTORS',
    name: 'Tata Motors',
    price: 752.35,
    change: 6.80,
    changePercent: 0.91,
    exchange: 'NSE',
    isUp: true,
  },
  {
    symbol: 'LT',
    name: 'Larsen & Toubro',
    price: 3685.40,
    change: 35.20,
    changePercent: 0.96,
    exchange: 'NSE',
    isUp: true,
  },
  {
    symbol: 'AXISBANK',
    name: 'Axis Bank',
    price: 1124.30,
    change: -7.85,
    changePercent: -0.69,
    exchange: 'NSE',
    isUp: false,
  },
];

export const HOLDINGS_DATA: Holding[] = [
  {
    symbol: 'RELIANCE',
    quantity: 30,
    avgPrice: 1126.67,
    ltp: 1272.45,
    pnl: 4373.40,
    pnlPercent: 12.94,
    dayChange: -8.30,
    dayChangePercent: -0.65,
    invested: 33800.10,
    current: 38173.50,
    closePrice: 1280.75,
  },
  {
    symbol: 'HDFCBANK',
    quantity: 40,
    avgPrice: 1635.00,
    ltp: 1847.20,
    pnl: 8488.00,
    pnlPercent: 12.98,
    dayChange: 12.55,
    dayChangePercent: 0.68,
    invested: 65400.00,
    current: 73888.00,
    closePrice: 1834.65,
  },
  {
    symbol: 'ITC',
    quantity: 150,
    avgPrice: 436.00,
    ltp: 492.80,
    pnl: 8520.00,
    pnlPercent: 13.03,
    dayChange: 4.15,
    dayChangePercent: 0.85,
    invested: 65400.00,
    current: 73920.00,
    closePrice: 488.65,
  },
  {
    symbol: 'TCS',
    quantity: 10,
    avgPrice: 3715.00,
    ltp: 4198.75,
    pnl: 4837.50,
    pnlPercent: 13.02,
    dayChange: -42.10,
    dayChangePercent: -0.99,
    invested: 37150.00,
    current: 41987.50,
    closePrice: 4240.85,
  },
  {
    symbol: 'INFY',
    quantity: 20,
    avgPrice: 1710.00,
    ltp: 1932.85,
    pnl: 4457.00,
    pnlPercent: 13.03,
    dayChange: 18.40,
    dayChangePercent: 0.96,
    invested: 34200.00,
    current: 38657.00,
    closePrice: 1914.45,
  },
  {
    symbol: 'SBIN',
    quantity: 7,
    avgPrice: 750.00,
    ltp: 844.15,
    pnl: 659.05,
    pnlPercent: 12.55,
    dayChange: -5.70,
    dayChangePercent: -0.67,
    invested: 5250.00,
    current: 5909.05,
    closePrice: 849.85,
  },
  {
    symbol: 'BHARTIARTL',
    quantity: 1,
    avgPrice: 299.90,
    ltp: 1598.30,
    pnl: 1298.40,
    pnlPercent: 433.01,
    dayChange: 22.45,
    dayChangePercent: 1.42,
    invested: 299.90,
    current: 1598.30,
    closePrice: 1575.85,
  },
];

export const POSITIONS_DATA: Position[] = [];

export const ORDERS_DATA: Order[] = [];
