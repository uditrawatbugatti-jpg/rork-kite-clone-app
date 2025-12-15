export interface IPO {
  symbol: string;
  name: string;
  priceRange: string;
  dates: string;
  status: 'Apply' | 'Pre-apply' | 'Closed';
  isSme?: boolean;
}

export const IPO_DATA: IPO[] = [
  {
    symbol: 'CORONA',
    name: 'Corona Remedies',
    priceRange: '₹1008 - ₹1062',
    dates: '8th - 10th Dec',
    status: 'Apply',
  },
  {
    symbol: 'WAKEFIT',
    name: 'Wakefit Innovations',
    priceRange: '₹185 - ₹195',
    dates: '8th - 10th Dec',
    status: 'Apply',
  },
  {
    symbol: 'PARKHOSPS',
    name: 'Park Medi World',
    priceRange: '₹154 - ₹162',
    dates: '10th - 12th Dec',
    status: 'Apply',
  },
  {
    symbol: 'NEPHROPLUS',
    name: 'Nephroplus (Nephrocare Health Services)',
    priceRange: '₹438 - ₹460',
    dates: '10th - 12th Dec',
    status: 'Apply',
  },
  {
    symbol: 'PRODOCS',
    name: 'Prodocs Solutions',
    priceRange: '₹131 - ₹138',
    dates: '8th - 10th Dec',
    status: 'Apply',
    isSme: true,
  },
  {
    symbol: 'RIDDHI',
    name: 'Riddhi Display Equipments',
    priceRange: '₹131 - ₹138',
    dates: '8th - 10th Dec',
    status: 'Apply',
  },
];
