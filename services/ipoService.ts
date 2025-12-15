export interface IPOData {
  symbol: string;
  name: string;
  priceRange: string;
  minPrice: number;
  maxPrice: number;
  lotSize: number;
  dates: string;
  openDate: string;
  closeDate: string;
  listingDate?: string;
  status: 'ongoing' | 'upcoming' | 'closed' | 'listed';
  isSme?: boolean;
  subscriptionStatus?: string;
  gmp?: number;
}

export interface GovtSecurity {
  id: string;
  name: string;
  type: 'T-Bill' | 'G-Sec' | 'SDL' | 'FRB';
  couponRate: string;
  maturityDate: string;
  issueDate: string;
  faceValue: number;
  minInvestment: number;
  status: 'ongoing' | 'upcoming' | 'closed';
  dates: string;
}

export interface AuctionData {
  id: string;
  name: string;
  type: 'RBI' | 'SEBI' | 'State';
  auctionDate: string;
  settlementDate: string;
  notifiedAmount: string;
  status: 'ongoing' | 'upcoming' | 'closed';
  dates: string;
  description: string;
}

export interface CorporateBond {
  id: string;
  issuerName: string;
  rating: string;
  couponRate: string;
  maturityDate: string;
  faceValue: number;
  minInvestment: number;
  yieldToMaturity: string;
  status: 'ongoing' | 'upcoming' | 'closed';
  dates: string;
  type: 'NCD' | 'Bond' | 'Debenture';
}

const getCurrentDate = () => new Date();

const formatDate = (date: Date): string => {
  const day = date.getDate();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${day}${getOrdinalSuffix(day)} ${months[date.getMonth()]}`;
};

const getOrdinalSuffix = (day: number): string => {
  if (day > 3 && day < 21) return 'th';
  switch (day % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
};

const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const generateIPOData = (): IPOData[] => {
  const today = getCurrentDate();
  
  const ongoingIPOs: IPOData[] = [
    {
      symbol: 'MOBIKWIK',
      name: 'One Mobikwik Systems Limited',
      priceRange: '₹265 - ₹279',
      minPrice: 265,
      maxPrice: 279,
      lotSize: 53,
      dates: `${formatDate(addDays(today, -1))} - ${formatDate(addDays(today, 1))}`,
      openDate: addDays(today, -1).toISOString(),
      closeDate: addDays(today, 1).toISOString(),
      status: 'ongoing',
      subscriptionStatus: '119.38x',
    },
    {
      symbol: 'SAILIFE',
      name: 'Sai Life Sciences Limited',
      priceRange: '₹522 - ₹549',
      minPrice: 522,
      maxPrice: 549,
      lotSize: 27,
      dates: `${formatDate(addDays(today, -1))} - ${formatDate(addDays(today, 1))}`,
      openDate: addDays(today, -1).toISOString(),
      closeDate: addDays(today, 1).toISOString(),
      status: 'ongoing',
      subscriptionStatus: '10.27x',
    },
    {
      symbol: 'INVENTURUS',
      name: 'Inventurus Knowledge Solutions',
      priceRange: '₹1,329 - ₹1,399',
      minPrice: 1329,
      maxPrice: 1399,
      lotSize: 10,
      dates: `${formatDate(today)} - ${formatDate(addDays(today, 2))}`,
      openDate: today.toISOString(),
      closeDate: addDays(today, 2).toISOString(),
      status: 'ongoing',
      subscriptionStatus: '52.68x',
    },
    {
      symbol: 'INTLGEMS',
      name: 'International Gemmological Institute',
      priceRange: '₹397 - ₹417',
      minPrice: 397,
      maxPrice: 417,
      lotSize: 35,
      dates: `${formatDate(today)} - ${formatDate(addDays(today, 2))}`,
      openDate: today.toISOString(),
      closeDate: addDays(today, 2).toISOString(),
      status: 'ongoing',
      subscriptionStatus: '35.81x',
    },
    {
      symbol: 'DAXAUTOMOT',
      name: 'DAX Automotive Limited',
      priceRange: '₹288 - ₹304',
      minPrice: 288,
      maxPrice: 304,
      lotSize: 49,
      dates: `${formatDate(today)} - ${formatDate(addDays(today, 2))}`,
      openDate: today.toISOString(),
      closeDate: addDays(today, 2).toISOString(),
      status: 'ongoing',
      isSme: true,
      subscriptionStatus: '8.45x',
    },
  ];

  const upcomingIPOs: IPOData[] = [
    {
      symbol: 'DAMANI',
      name: 'Damani Industries Limited',
      priceRange: '₹32 - ₹34',
      minPrice: 32,
      maxPrice: 34,
      lotSize: 4000,
      dates: `${formatDate(addDays(today, 3))} - ${formatDate(addDays(today, 5))}`,
      openDate: addDays(today, 3).toISOString(),
      closeDate: addDays(today, 5).toISOString(),
      status: 'upcoming',
      isSme: true,
    },
    {
      symbol: 'VENTIVE',
      name: 'Ventive Hospitality Limited',
      priceRange: '₹610 - ₹643',
      minPrice: 610,
      maxPrice: 643,
      lotSize: 23,
      dates: `${formatDate(addDays(today, 5))} - ${formatDate(addDays(today, 7))}`,
      openDate: addDays(today, 5).toISOString(),
      closeDate: addDays(today, 7).toISOString(),
      status: 'upcoming',
    },
    {
      symbol: 'SENORES',
      name: 'Senores Pharmaceuticals Limited',
      priceRange: '₹372 - ₹391',
      minPrice: 372,
      maxPrice: 391,
      lotSize: 38,
      dates: `${formatDate(addDays(today, 7))} - ${formatDate(addDays(today, 9))}`,
      openDate: addDays(today, 7).toISOString(),
      closeDate: addDays(today, 9).toISOString(),
      status: 'upcoming',
    },
    {
      symbol: 'TRANSRAIL',
      name: 'Transrail Lighting Limited',
      priceRange: '₹410 - ₹432',
      minPrice: 410,
      maxPrice: 432,
      lotSize: 34,
      dates: `${formatDate(addDays(today, 8))} - ${formatDate(addDays(today, 10))}`,
      openDate: addDays(today, 8).toISOString(),
      closeDate: addDays(today, 10).toISOString(),
      status: 'upcoming',
    },
    {
      symbol: 'CONCORD',
      name: 'Concord Enviro Systems Limited',
      priceRange: '₹665 - ₹701',
      minPrice: 665,
      maxPrice: 701,
      lotSize: 21,
      dates: `${formatDate(addDays(today, 10))} - ${formatDate(addDays(today, 12))}`,
      openDate: addDays(today, 10).toISOString(),
      closeDate: addDays(today, 12).toISOString(),
      status: 'upcoming',
    },
  ];

  return [...ongoingIPOs, ...upcomingIPOs];
};

export const generateGovtSecurities = (): GovtSecurity[] => {
  const today = getCurrentDate();
  
  return [
    {
      id: 'gsec-1',
      name: '7.26% GOI 2033',
      type: 'G-Sec',
      couponRate: '7.26%',
      maturityDate: '2033-01-14',
      issueDate: addDays(today, 2).toISOString().split('T')[0],
      faceValue: 100,
      minInvestment: 10000,
      status: 'upcoming',
      dates: `${formatDate(addDays(today, 2))}`,
    },
    {
      id: 'gsec-2',
      name: '7.18% GOI 2037',
      type: 'G-Sec',
      couponRate: '7.18%',
      maturityDate: '2037-08-14',
      issueDate: addDays(today, 5).toISOString().split('T')[0],
      faceValue: 100,
      minInvestment: 10000,
      status: 'upcoming',
      dates: `${formatDate(addDays(today, 5))}`,
    },
    {
      id: 'tbill-1',
      name: '91-Day T-Bill',
      type: 'T-Bill',
      couponRate: '6.85%*',
      maturityDate: addDays(today, 94).toISOString().split('T')[0],
      issueDate: addDays(today, 3).toISOString().split('T')[0],
      faceValue: 100,
      minInvestment: 10000,
      status: 'upcoming',
      dates: `${formatDate(addDays(today, 3))}`,
    },
    {
      id: 'tbill-2',
      name: '182-Day T-Bill',
      type: 'T-Bill',
      couponRate: '6.92%*',
      maturityDate: addDays(today, 185).toISOString().split('T')[0],
      issueDate: addDays(today, 3).toISOString().split('T')[0],
      faceValue: 100,
      minInvestment: 10000,
      status: 'upcoming',
      dates: `${formatDate(addDays(today, 3))}`,
    },
    {
      id: 'tbill-3',
      name: '364-Day T-Bill',
      type: 'T-Bill',
      couponRate: '6.98%*',
      maturityDate: addDays(today, 367).toISOString().split('T')[0],
      issueDate: addDays(today, 3).toISOString().split('T')[0],
      faceValue: 100,
      minInvestment: 10000,
      status: 'upcoming',
      dates: `${formatDate(addDays(today, 3))}`,
    },
    {
      id: 'sdl-1',
      name: 'Maharashtra SDL 2034',
      type: 'SDL',
      couponRate: '7.42%',
      maturityDate: '2034-12-20',
      issueDate: addDays(today, 7).toISOString().split('T')[0],
      faceValue: 100,
      minInvestment: 10000,
      status: 'upcoming',
      dates: `${formatDate(addDays(today, 7))}`,
    },
    {
      id: 'sdl-2',
      name: 'Tamil Nadu SDL 2039',
      type: 'SDL',
      couponRate: '7.48%',
      maturityDate: '2039-03-15',
      issueDate: addDays(today, 7).toISOString().split('T')[0],
      faceValue: 100,
      minInvestment: 10000,
      status: 'upcoming',
      dates: `${formatDate(addDays(today, 7))}`,
    },
  ];
};

export const generateAuctions = (): AuctionData[] => {
  const today = getCurrentDate();
  
  return [
    {
      id: 'auc-1',
      name: 'RBI G-Sec Auction',
      type: 'RBI',
      auctionDate: addDays(today, 4).toISOString().split('T')[0],
      settlementDate: addDays(today, 5).toISOString().split('T')[0],
      notifiedAmount: '₹32,000 Cr',
      status: 'upcoming',
      dates: `${formatDate(addDays(today, 4))}`,
      description: 'Weekly G-Sec auction by RBI',
    },
    {
      id: 'auc-2',
      name: 'T-Bill Auction (91/182/364 Day)',
      type: 'RBI',
      auctionDate: addDays(today, 3).toISOString().split('T')[0],
      settlementDate: addDays(today, 4).toISOString().split('T')[0],
      notifiedAmount: '₹45,000 Cr',
      status: 'upcoming',
      dates: `${formatDate(addDays(today, 3))}`,
      description: 'Weekly T-Bill auction',
    },
    {
      id: 'auc-3',
      name: 'State Development Loans',
      type: 'State',
      auctionDate: addDays(today, 7).toISOString().split('T')[0],
      settlementDate: addDays(today, 8).toISOString().split('T')[0],
      notifiedAmount: '₹28,500 Cr',
      status: 'upcoming',
      dates: `${formatDate(addDays(today, 7))}`,
      description: 'SDL auction by various states',
    },
    {
      id: 'auc-4',
      name: 'RBI CMB Auction',
      type: 'RBI',
      auctionDate: addDays(today, 10).toISOString().split('T')[0],
      settlementDate: addDays(today, 11).toISOString().split('T')[0],
      notifiedAmount: '₹15,000 Cr',
      status: 'upcoming',
      dates: `${formatDate(addDays(today, 10))}`,
      description: 'Cash Management Bills auction',
    },
    {
      id: 'auc-5',
      name: 'Sovereign Gold Bond',
      type: 'RBI',
      auctionDate: addDays(today, 14).toISOString().split('T')[0],
      settlementDate: addDays(today, 18).toISOString().split('T')[0],
      notifiedAmount: 'TBA',
      status: 'upcoming',
      dates: `${formatDate(addDays(today, 14))} - ${formatDate(addDays(today, 18))}`,
      description: 'SGB Series III 2024-25',
    },
  ];
};

export const generateCorporateBonds = (): CorporateBond[] => {
  const today = getCurrentDate();
  
  return [
    {
      id: 'bond-1',
      issuerName: 'HDFC Ltd NCD',
      rating: 'AAA',
      couponRate: '8.10%',
      maturityDate: '2027-12-15',
      faceValue: 1000,
      minInvestment: 10000,
      yieldToMaturity: '8.15%',
      status: 'upcoming',
      dates: `${formatDate(addDays(today, 5))} - ${formatDate(addDays(today, 12))}`,
      type: 'NCD',
    },
    {
      id: 'bond-2',
      issuerName: 'Bajaj Finance NCD',
      rating: 'AAA',
      couponRate: '8.25%',
      maturityDate: '2029-06-30',
      faceValue: 1000,
      minInvestment: 10000,
      yieldToMaturity: '8.30%',
      status: 'upcoming',
      dates: `${formatDate(addDays(today, 8))} - ${formatDate(addDays(today, 15))}`,
      type: 'NCD',
    },
    {
      id: 'bond-3',
      issuerName: 'Tata Capital NCD',
      rating: 'AAA',
      couponRate: '7.95%',
      maturityDate: '2026-09-20',
      faceValue: 1000,
      minInvestment: 10000,
      yieldToMaturity: '8.00%',
      status: 'upcoming',
      dates: `${formatDate(addDays(today, 10))} - ${formatDate(addDays(today, 17))}`,
      type: 'NCD',
    },
    {
      id: 'bond-4',
      issuerName: 'Mahindra Finance NCD',
      rating: 'AA+',
      couponRate: '8.40%',
      maturityDate: '2028-03-15',
      faceValue: 1000,
      minInvestment: 10000,
      yieldToMaturity: '8.45%',
      status: 'upcoming',
      dates: `${formatDate(addDays(today, 12))} - ${formatDate(addDays(today, 19))}`,
      type: 'NCD',
    },
    {
      id: 'bond-5',
      issuerName: 'IRFC Bond',
      rating: 'AAA',
      couponRate: '7.45%',
      maturityDate: '2034-01-10',
      faceValue: 1000,
      minInvestment: 10000,
      yieldToMaturity: '7.50%',
      status: 'upcoming',
      dates: `${formatDate(addDays(today, 15))} - ${formatDate(addDays(today, 22))}`,
      type: 'Bond',
    },
    {
      id: 'bond-6',
      issuerName: 'REC Limited NCD',
      rating: 'AAA',
      couponRate: '7.68%',
      maturityDate: '2031-06-25',
      faceValue: 1000,
      minInvestment: 10000,
      yieldToMaturity: '7.72%',
      status: 'upcoming',
      dates: `${formatDate(addDays(today, 18))} - ${formatDate(addDays(today, 25))}`,
      type: 'NCD',
    },
  ];
};

export const fetchAllMarketData = () => {
  console.log('[IPOService] Fetching all market data...');
  
  const ipos = generateIPOData();
  const govtSecurities = generateGovtSecurities();
  const auctions = generateAuctions();
  const corporateBonds = generateCorporateBonds();
  
  console.log(`[IPOService] Loaded ${ipos.length} IPOs, ${govtSecurities.length} Govt Securities, ${auctions.length} Auctions, ${corporateBonds.length} Corporate Bonds`);
  
  return {
    ipos,
    govtSecurities,
    auctions,
    corporateBonds,
  };
};
