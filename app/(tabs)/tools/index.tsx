import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, StatusBar, useColorScheme, RefreshControl, ActivityIndicator } from 'react-native';
import Colors from '@/constants/colors';
import { TrendingUp, Calendar, Building2, Landmark, FileText } from 'lucide-react-native';
import { useMarket } from '@/context/MarketContext';
import { 
  fetchAllMarketData, 
  IPOData, 
  GovtSecurity, 
  AuctionData, 
  CorporateBond 
} from '@/services/ipoService';

type TabType = 'IPO' | 'Govt. securities' | 'Auctions' | 'Corporate bonds';
type SubTabType = 'Ongoing' | 'Applied' | 'Upcoming';

export default function BidsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [activeTab, setActiveTab] = useState<TabType>('IPO');
  const [activeSubTab, setActiveSubTab] = useState<SubTabType>('Ongoing');
  const { indices } = useMarket();
  
  const [ipos, setIpos] = useState<IPOData[]>([]);
  const [govtSecurities, setGovtSecurities] = useState<GovtSecurity[]>([]);
  const [auctions, setAuctions] = useState<AuctionData[]>([]);
  const [corporateBonds, setCorporateBonds] = useState<CorporateBond[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    console.log('[ToolsScreen] Loading market data...');
    try {
      const data = fetchAllMarketData();
      setIpos(data.ipos);
      setGovtSecurities(data.govtSecurities);
      setAuctions(data.auctions);
      setCorporateBonds(data.corporateBonds);
    } catch (error) {
      console.error('[ToolsScreen] Error loading data:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 60000);
    return () => clearInterval(interval);
  }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const getFilteredIPOs = () => {
    if (activeSubTab === 'Ongoing') {
      return ipos.filter(ipo => ipo.status === 'ongoing');
    } else if (activeSubTab === 'Upcoming') {
      return ipos.filter(ipo => ipo.status === 'upcoming');
    }
    return [];
  };

  const getFilteredGovtSecurities = () => {
    if (activeSubTab === 'Upcoming') {
      return govtSecurities.filter(gs => gs.status === 'upcoming');
    } else if (activeSubTab === 'Ongoing') {
      return govtSecurities.filter(gs => gs.status === 'ongoing');
    }
    return [];
  };

  const getFilteredAuctions = () => {
    if (activeSubTab === 'Upcoming') {
      return auctions.filter(a => a.status === 'upcoming');
    } else if (activeSubTab === 'Ongoing') {
      return auctions.filter(a => a.status === 'ongoing');
    }
    return [];
  };

  const getFilteredBonds = () => {
    if (activeSubTab === 'Upcoming') {
      return corporateBonds.filter(b => b.status === 'upcoming');
    } else if (activeSubTab === 'Ongoing') {
      return corporateBonds.filter(b => b.status === 'ongoing');
    }
    return [];
  };

  const getItemCount = (tab: TabType): number => {
    switch (tab) {
      case 'IPO': return ipos.length;
      case 'Govt. securities': return govtSecurities.length;
      case 'Auctions': return auctions.length;
      case 'Corporate bonds': return corporateBonds.length;
      default: return 0;
    }
  };

  const renderIndices = () => (
    <View style={[styles.indicesContainer, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
      {indices.map((index, i) => (
        <View key={i} style={[styles.indexItem, i === 0 && styles.indexItemBorder, { borderColor: colors.border }]}>
          <View style={styles.indexTopRow}>
            <Text style={[styles.indexName, { color: colors.textSecondary }]}>{index.name}</Text>
            <Text style={[styles.indexPrice, { color: index.isUp ? colors.success : colors.danger }]}>
              {formatCurrency(index.price)}
            </Text>
          </View>
          <View style={styles.indexBottomRow}>
            <Text style={[styles.indexChange, { color: colors.textSecondary }]}>
               {index.change > 0 ? '+' : ''}{index.change.toFixed(2)} ({index.changePercent.toFixed(2)}%)
            </Text>
          </View>
        </View>
      ))}
    </View>
  );

  const renderIpoItem = ({ item }: { item: IPOData }) => (
    <TouchableOpacity
      style={[styles.itemCard, { borderBottomColor: colors.border, backgroundColor: colors.background }]}
      activeOpacity={0.9}
      onPress={() => {
        console.log('[Tools] IPO pressed', item.symbol);
      }}
      testID={`tools-ipo-${item.symbol}`}
    >
      <View style={styles.itemHeader}>
        <Text style={[styles.itemCompanyName, { color: colors.textSecondary }]}>{item.name}</Text>
        {item.subscriptionStatus && (
          <View style={[styles.subscriptionBadge, { backgroundColor: colors.success + '20' }]}>
            <Text style={[styles.subscriptionText, { color: colors.success }]}>{item.subscriptionStatus}</Text>
          </View>
        )}
      </View>
      <View style={styles.itemRow}>
        <View style={styles.itemInfo}>
          <View style={styles.symbolRow}>
            <Text style={[styles.itemSymbol, { color: colors.text }]}>{item.symbol}</Text>
            {item.isSme && <Text style={[styles.smeTag, { color: colors.tint, backgroundColor: colors.tint + '15' }]}>SME</Text>}
          </View>
          <Text style={[styles.itemPriceRange, { color: colors.text }]}>{item.priceRange}</Text>
          <Text style={[styles.lotSize, { color: colors.textSecondary }]}>Lot: {item.lotSize} shares</Text>
        </View>
        <View style={styles.itemAction}>
          <TouchableOpacity
            style={[styles.applyButton, { backgroundColor: item.status === 'upcoming' ? colors.textSecondary : colors.primary }]}
            onPress={() => {
              const title = item.status === 'upcoming' ? 'Notify' : 'Apply';
              console.log('[Tools] IPO action pressed', title, item.symbol);
            }}
            testID={`tools-ipo-action-${item.symbol}`}
          >
            <Text style={styles.applyButtonText}>{item.status === 'upcoming' ? 'Notify' : 'Apply'}</Text>
          </TouchableOpacity>
          <Text style={[styles.itemDates, { color: colors.textSecondary }]}>{item.dates}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderGovtSecurityItem = ({ item }: { item: GovtSecurity }) => (
    <TouchableOpacity
      style={[styles.itemCard, { borderBottomColor: colors.border, backgroundColor: colors.background }]}
      activeOpacity={0.9}
      onPress={() => {
        console.log('[Tools] G-Sec pressed', item.id);
      }}
      testID={`tools-gsec-${item.id}`}
    >
      <View style={styles.itemHeader}>
        <View style={styles.typeTagContainer}>
          <View style={[styles.typeTag, { backgroundColor: colors.tint + '15' }]}>
            <Text style={[styles.typeTagText, { color: colors.tint }]}>{item.type}</Text>
          </View>
        </View>
      </View>
      <View style={styles.itemRow}>
        <View style={styles.itemInfo}>
          <Text style={[styles.itemSymbol, { color: colors.text }]}>{item.name}</Text>
          <Text style={[styles.itemPriceRange, { color: colors.success }]}>Coupon: {item.couponRate}</Text>
          <Text style={[styles.lotSize, { color: colors.textSecondary }]}>Min: ₹{item.minInvestment.toLocaleString('en-IN')}</Text>
        </View>
        <View style={styles.itemAction}>
          <TouchableOpacity
            style={[styles.applyButton, { backgroundColor: item.status === 'upcoming' ? colors.textSecondary : colors.primary }]}
            onPress={() => {
              const title = item.status === 'upcoming' ? 'Notify' : 'Invest';
              console.log('[Tools] G-Sec action pressed', title, item.id);
            }}
            testID={`tools-gsec-action-${item.id}`}
          >
            <Text style={styles.applyButtonText}>{item.status === 'upcoming' ? 'Notify' : 'Invest'}</Text>
          </TouchableOpacity>
          <Text style={[styles.itemDates, { color: colors.textSecondary }]}>{item.dates}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderAuctionItem = ({ item }: { item: AuctionData }) => (
    <TouchableOpacity
      style={[styles.itemCard, { borderBottomColor: colors.border, backgroundColor: colors.background }]}
      activeOpacity={0.9}
      onPress={() => {
        console.log('[Tools] Auction pressed', item.id);
      }}
      testID={`tools-auction-${item.id}`}
    >
      <View style={styles.itemHeader}>
        <View style={styles.typeTagContainer}>
          <View style={[styles.typeTag, { backgroundColor: item.type === 'RBI' ? '#FF6B6B20' : '#4ECDC420' }]}>
            <Text style={[styles.typeTagText, { color: item.type === 'RBI' ? '#FF6B6B' : '#4ECDC4' }]}>{item.type}</Text>
          </View>
        </View>
      </View>
      <View style={styles.itemRow}>
        <View style={styles.itemInfo}>
          <Text style={[styles.itemSymbol, { color: colors.text }]}>{item.name}</Text>
          <Text style={[styles.itemPriceRange, { color: colors.text }]}>{item.notifiedAmount}</Text>
          <Text style={[styles.lotSize, { color: colors.textSecondary }]}>{item.description}</Text>
        </View>
        <View style={styles.itemAction}>
          <TouchableOpacity
            style={[styles.applyButton, { backgroundColor: colors.textSecondary }]}
            onPress={() => {
              console.log('[Tools] Auction details pressed', item.id);
            }}
            testID={`tools-auction-details-${item.id}`}
          >
            <Text style={styles.applyButtonText}>Details</Text>
          </TouchableOpacity>
          <Text style={[styles.itemDates, { color: colors.textSecondary }]}>{item.dates}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderBondItem = ({ item }: { item: CorporateBond }) => (
    <TouchableOpacity
      style={[styles.itemCard, { borderBottomColor: colors.border, backgroundColor: colors.background }]}
      activeOpacity={0.9}
      onPress={() => {
        console.log('[Tools] Corporate bond pressed', item.id);
      }}
      testID={`tools-bond-${item.id}`}
    >
      <View style={styles.itemHeader}>
        <View style={styles.typeTagContainer}>
          <View style={[styles.typeTag, { backgroundColor: '#9B59B620' }]}>
            <Text style={[styles.typeTagText, { color: '#9B59B6' }]}>{item.type}</Text>
          </View>
          <View style={[styles.ratingTag, { backgroundColor: item.rating === 'AAA' ? '#27AE6020' : '#F39C1220' }]}>
            <Text style={[styles.ratingText, { color: item.rating === 'AAA' ? '#27AE60' : '#F39C12' }]}>{item.rating}</Text>
          </View>
        </View>
      </View>
      <View style={styles.itemRow}>
        <View style={styles.itemInfo}>
          <Text style={[styles.itemSymbol, { color: colors.text }]}>{item.issuerName}</Text>
          <View style={styles.bondRates}>
            <Text style={[styles.itemPriceRange, { color: colors.success }]}>Coupon: {item.couponRate}</Text>
            <Text style={[styles.yieldText, { color: colors.textSecondary }]}>YTM: {item.yieldToMaturity}</Text>
          </View>
          <Text style={[styles.lotSize, { color: colors.textSecondary }]}>Min: ₹{item.minInvestment.toLocaleString('en-IN')}</Text>
        </View>
        <View style={styles.itemAction}>
          <TouchableOpacity
            style={[styles.applyButton, { backgroundColor: item.status === 'upcoming' ? colors.textSecondary : colors.primary }]}
            onPress={() => {
              const title = item.status === 'upcoming' ? 'Notify' : 'Invest';
              console.log('[Tools] Bond action pressed', title, item.id);
            }}
            testID={`tools-bond-action-${item.id}`}
          >
            <Text style={styles.applyButtonText}>{item.status === 'upcoming' ? 'Notify' : 'Invest'}</Text>
          </TouchableOpacity>
          <Text style={[styles.itemDates, { color: colors.textSecondary }]}>{item.dates}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
        {activeSubTab === 'Applied' ? 'No applications yet' : 'No items available'}
      </Text>
    </View>
  );

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.tint} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading...</Text>
        </View>
      );
    }

    let data: any[] = [];
    let renderItem: any;
    let keyExtractor: (item: any) => string;

    switch (activeTab) {
      case 'IPO':
        data = getFilteredIPOs();
        renderItem = renderIpoItem;
        keyExtractor = (item: IPOData) => item.symbol;
        break;
      case 'Govt. securities':
        data = getFilteredGovtSecurities();
        renderItem = renderGovtSecurityItem;
        keyExtractor = (item: GovtSecurity) => item.id;
        break;
      case 'Auctions':
        data = getFilteredAuctions();
        renderItem = renderAuctionItem;
        keyExtractor = (item: AuctionData) => item.id;
        break;
      case 'Corporate bonds':
        data = getFilteredBonds();
        renderItem = renderBondItem;
        keyExtractor = (item: CorporateBond) => item.id;
        break;
    }

    return (
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: colors.border }} />}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.tint}
            colors={[colors.tint]}
          />
        }
      />
    );
  };

  const getTabIcon = (tab: TabType) => {
    switch (tab) {
      case 'IPO': return <TrendingUp size={14} color={activeTab === tab ? colors.tint : colors.textSecondary} />;
      case 'Govt. securities': return <Landmark size={14} color={activeTab === tab ? colors.tint : colors.textSecondary} />;
      case 'Auctions': return <Calendar size={14} color={activeTab === tab ? colors.tint : colors.textSecondary} />;
      case 'Corporate bonds': return <Building2 size={14} color={activeTab === tab ? colors.tint : colors.textSecondary} />;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
      
      {renderIndices()}

      <View style={[styles.mainTabs, { borderBottomColor: colors.border, backgroundColor: colors.background }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
          {(['IPO', 'Govt. securities', 'Auctions', 'Corporate bonds'] as TabType[]).map((tab) => (
            <TouchableOpacity 
              key={tab} 
              style={[
                styles.mainTab, 
                activeTab === tab && { borderBottomColor: colors.tint, borderBottomWidth: 2 }
              ]}
              onPress={() => {
                setActiveTab(tab);
                setActiveSubTab('Upcoming');
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {getTabIcon(tab)}
                <Text style={[
                  styles.mainTabText, 
                  { color: activeTab === tab ? colors.tint : colors.textSecondary, marginLeft: 4 }
                ]}>
                  {tab}
                </Text>
                <View style={[styles.badge, { backgroundColor: colors.tint }]}>
                  <Text style={styles.badgeText}>{getItemCount(tab)}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={[styles.subTabsContainer, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity
              onPress={() => {
                console.log('[Tools] Search pressed');
              }}
              testID="tools-search"
            >
              <View style={[styles.searchIconContainer]}>
                <FileText size={18} color={colors.textSecondary} />
              </View>
            </TouchableOpacity>
          </View>

          <View style={[styles.segmentedControl, { backgroundColor: colors.surface }]}>
            {(['Ongoing', 'Applied', 'Upcoming'] as SubTabType[]).map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.segmentTab,
                  activeSubTab === tab && { backgroundColor: colors.background, shadowColor: "#000", shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.1, shadowRadius: 1, elevation: 2 }
                ]}
                onPress={() => setActiveSubTab(tab)}
              >
                <Text style={[
                  styles.segmentTabText, 
                  { color: activeSubTab === tab ? colors.tint : colors.textSecondary }
                ]}>{tab}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {renderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  indicesContainer: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  indexItem: {
    flex: 1,
    paddingHorizontal: 16,
  },
  indexItemBorder: {
    borderRightWidth: 1,
  },
  indexTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  indexBottomRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  indexName: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  indexPrice: {
    fontSize: 14,
    fontWeight: '700',
  },
  indexChange: {
    fontSize: 11,
  },
  mainTabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  mainTab: {
    paddingVertical: 14,
    marginRight: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainTabText: {
    fontSize: 13,
    fontWeight: '600',
  },
  badge: {
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 6,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  subTabsContainer: {
    borderBottomWidth: 1,
  },
  searchIconContainer: {
    padding: 4,
  },
  segmentedControl: {
    flexDirection: 'row',
    borderRadius: 4,
    padding: 2,
    alignSelf: 'flex-end',
  },
  segmentTab: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 4,
  },
  segmentTabText: {
    fontSize: 12,
    fontWeight: '500',
  },
  listContent: {
    paddingBottom: 20,
    flexGrow: 1,
  },
  itemCard: {
    padding: 16,
    borderBottomWidth: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  itemCompanyName: {
    fontSize: 12,
    flex: 1,
  },
  subscriptionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  subscriptionText: {
    fontSize: 11,
    fontWeight: '600',
  },
  symbolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemSymbol: {
    fontSize: 15,
    fontWeight: '500',
    marginRight: 8,
  },
  smeTag: {
    fontSize: 10,
    fontWeight: '600',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 2,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
  },
  itemPriceRange: {
    fontSize: 14,
    fontWeight: '500',
  },
  lotSize: {
    fontSize: 11,
    marginTop: 2,
  },
  itemAction: {
    alignItems: 'flex-end',
  },
  applyButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 4,
    marginBottom: 4,
  },
  applyButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  itemDates: {
    fontSize: 10,
  },
  typeTagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typeTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typeTagText: {
    fontSize: 10,
    fontWeight: '600',
  },
  ratingTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  ratingText: {
    fontSize: 10,
    fontWeight: '700',
  },
  bondRates: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  yieldText: {
    fontSize: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
});
