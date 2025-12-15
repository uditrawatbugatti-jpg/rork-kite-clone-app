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
  closePrice?: number; // Previous day close price
}

export interface Position {
  symbol: string;
  product: 'MIS' | 'CNC' | 'NRML';
  quantity: number;
  avgPrice: number;
  ltp: number;
  pnl: number;
  type: 'BUY' | 'SELL';
  closePrice?: number; // Previous day close price
}

export interface Order {
  id: string;
  symbol: string;
  exchange: 'NSE' | 'BSE';
  type: 'BUY' | 'SELL';
  product: 'MIS' | 'CNC';
  status: 'EXECUTED' | 'REJECTED' | 'CANCELLED' | 'OPEN';
  price: number;
  quantity: number; // For executed orders, this is the filled quantity
  totalQuantity: number;
  time: string;
  message?: string; // For rejection reason
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
    quantity: 10,
    avgPrice: 1180.00,
    ltp: 1272.45,
    pnl: 924.50,
    pnlPercent: 7.83,
    dayChange: -8.30,
    dayChangePercent: -0.65,
    invested: 11800.00,
    current: 12724.50,
    closePrice: 1280.75,
  },
  {
    symbol: 'HDFCBANK',
    quantity: 25,
    avgPrice: 1650.00,
    ltp: 1847.20,
    pnl: 4930.00,
    pnlPercent: 11.95,
    dayChange: 12.55,
    dayChangePercent: 0.68,
    invested: 41250.00,
    current: 46180.00,
    closePrice: 1834.65,
  },
  {
    symbol: 'ITC',
    quantity: 100,
    avgPrice: 420.00,
    ltp: 492.80,
    pnl: 7280.00,
    pnlPercent: 17.33,
    dayChange: 4.15,
    dayChangePercent: 0.85,
    invested: 42000.00,
    current: 49280.00,
    closePrice: 488.65,
  },
  {
    symbol: 'TCS',
    quantity: 5,
    avgPrice: 3850.00,
    ltp: 4198.75,
    pnl: 1743.75,
    pnlPercent: 9.06,
    dayChange: -42.10,
    dayChangePercent: -0.99,
    invested: 19250.00,
    current: 20993.75,
    closePrice: 4240.85,
  },
];

export const POSITIONS_DATA: Position[] = [
  {
    symbol: 'NIFTY 19DEC 24800 CE',
    product: 'MIS',
    quantity: 50,
    avgPrice: 168.50,
    ltp: 198.25,
    pnl: 1487.50,
    type: 'BUY',
    closePrice: 182.30,
  },
  {
    symbol: 'BANKNIFTY 19DEC 53000 PE',
    product: 'NRML',
    quantity: 15,
    avgPrice: 385.00,
    ltp: 342.80,
    pnl: -633.00,
    type: 'BUY',
    closePrice: 358.45,
  },
];

export const ORDERS_DATA: Order[] = [
  {
    id: '1001',
    symbol: 'RELIANCE',
    exchange: 'NSE',
    type: 'BUY',
    product: 'CNC',
    status: 'EXECUTED',
    price: 1272.35,
    quantity: 10,
    totalQuantity: 10,
    time: '11:30:45',
  },
  {
    id: '1002',
    symbol: 'HDFCBANK',
    exchange: 'NSE',
    type: 'SELL',
    product: 'MIS',
    status: 'REJECTED',
    price: 1810.00,
    quantity: 0,
    totalQuantity: 25,
    time: '10:15:20',
    message: 'Insufficient margin',
  },
  {
    id: '1003',
    symbol: 'INFY',
    exchange: 'NSE',
    type: 'BUY',
    product: 'CNC',
    status: 'OPEN',
    price: 1920.00,
    quantity: 0,
    totalQuantity: 50,
    time: '09:45:10',
  },
  {
    id: '1004',
    symbol: 'TATASTEEL',
    exchange: 'NSE',
    type: 'BUY',
    product: 'CNC',
    status: 'CANCELLED',
    price: 142.50,
    quantity: 0,
    totalQuantity: 100,
    time: '12:05:00',
  },
];
