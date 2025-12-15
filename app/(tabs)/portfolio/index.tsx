import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  useColorScheme,
  StatusBar,
  Modal,
  Pressable,
  TextInput,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Colors from '@/constants/colors';
import { Typography } from '@/constants/typography';
import type { Holding, Position, Stock } from '@/mocks/stocks';
import {
  Search,
  SlidersHorizontal,
  ChevronDown,
  Users,
  PieChart,
  TrendingUp,
  FileText,
  MessageCircle,
  Settings,
  X,
  BarChart3,
  BadgeIndianRupee,
} from 'lucide-react-native';
import { useMarket } from '@/context/MarketContext';
import StockQuickActionsSheet from '@/components/StockQuickActionsSheet';

export default function PortfolioScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [activeTab, setActiveTab] = useState<'holdings' | 'positions'>('holdings');
  const { holdings, positions, indices, stocks } = useMarket();

  const [searchVisible, setSearchVisible] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [sheetVisible, setSheetVisible] = useState<boolean>(false);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);

  const [fabMenuVisible, setFabMenuVisible] = useState<boolean>(false);
  const fabBackdrop = useRef(new Animated.Value(0)).current;
  const fabTranslate = useRef(new Animated.Value(20)).current;

  // Use context data
  const currentHoldings = holdings;

  const holdingList = useMemo<Holding[]>(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return currentHoldings;
    return currentHoldings.filter((h) => {
      const meta = stocks.find((s) => s.symbol.toLowerCase() === h.symbol.toLowerCase());
      const name = meta?.name ?? '';
      return h.symbol.toLowerCase().includes(q) || name.toLowerCase().includes(q);
    });
  }, [currentHoldings, searchQuery, stocks]);

  const openPlaceholder = useCallback(
    (title: string, subtitle: string) => {
      router.push({ pathname: '/placeholder' as any, params: { title, subtitle } });
    },
    [router],
  );

  const getStockFromHolding = useCallback(
    (holding: Holding): Stock => {
      const fromList = stocks.find((s) => s.symbol === holding.symbol);
      if (fromList) return fromList;

      return {
        symbol: holding.symbol,
        name: holding.symbol,
        price: holding.ltp,
        change: holding.dayChange,
        changePercent: holding.dayChangePercent,
        exchange: 'NSE',
        isUp: holding.dayChange >= 0,
      };
    },
    [stocks],
  );

  const openStockSheetForHolding = useCallback(
    (holding: Holding) => {
      const stock = getStockFromHolding(holding);
      console.log('[Portfolio] Open stock sheet', { symbol: stock.symbol });
      setSelectedStock(stock);
      setSheetVisible(true);
    },
    [getStockFromHolding],
  );

  const closeFabMenu = useCallback(() => {
    Animated.parallel([
      Animated.timing(fabBackdrop, { toValue: 0, duration: 140, useNativeDriver: true }),
      Animated.timing(fabTranslate, { toValue: 20, duration: 140, useNativeDriver: true }),
    ]).start(({ finished }) => {
      if (finished) setFabMenuVisible(false);
    });
  }, [fabBackdrop, fabTranslate]);

  const openFabMenu = useCallback(() => {
    setFabMenuVisible(true);
    fabBackdrop.setValue(0);
    fabTranslate.setValue(20);

    Animated.parallel([
      Animated.timing(fabBackdrop, { toValue: 1, duration: 160, useNativeDriver: true }),
      Animated.spring(fabTranslate, { toValue: 0, useNativeDriver: true, damping: 18, stiffness: 220, mass: 0.9 }),
    ]).start();
  }, [fabBackdrop, fabTranslate]);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
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
      <TouchableOpacity
        style={styles.indicesExpand}
        onPress={() => {
          console.log('[Portfolio] Indices expand pressed');
        }}
        testID="portfolio-indices-expand"
      >
        <ChevronDown size={20} color={colors.textSecondary} />
      </TouchableOpacity>
    </View>
  );

  const holdingsSummary = useMemo(() => {
    const totalInvested = currentHoldings.reduce((sum, item) => sum + item.invested, 0);
    const totalCurrent = currentHoldings.reduce((sum, item) => sum + item.current, 0);
    const totalPnl = totalCurrent - totalInvested;
    const totalPnlPercent = totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0;
    const daysPnl = currentHoldings.reduce((sum, item) => sum + item.dayChange * item.quantity, 0);

    return { totalInvested, totalCurrent, totalPnl, totalPnlPercent, daysPnl };
  }, [currentHoldings]);

  const positionsSummary = useMemo(() => {
    const totalPnl = positions.reduce((sum, item) => sum + item.pnl, 0);
    return { totalPnl };
  }, [positions]);

  const renderHoldingsTopSummary = () => (
    <View
      style={[styles.summaryTopBar, { borderBottomColor: colors.border, backgroundColor: colors.background }]}
      testID="portfolio-holdings-summary"
    >
      <View style={[styles.summaryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.summaryCardRow}>
          <View style={styles.summaryTopItem}>
            <Text style={[styles.summaryTopLabel, Typography.sectionLabel, { color: colors.textSecondary }]}>Invested</Text>
            <Text style={[styles.summaryTopValue, Typography.bodyStrong, Typography.monoNumber, { color: colors.text }]}>{formatCurrency(holdingsSummary.totalInvested)}</Text>
          </View>
          <View style={styles.summaryTopItem}>
            <Text style={[styles.summaryTopLabel, Typography.sectionLabel, { color: colors.textSecondary, textAlign: 'right' }]}>Current</Text>
            <Text style={[styles.summaryTopValue, Typography.bodyStrong, Typography.monoNumber, { color: colors.text, textAlign: 'right' }]}>{formatCurrency(holdingsSummary.totalCurrent)}</Text>
          </View>
        </View>
        <View style={[styles.summaryTopDivider, { backgroundColor: colors.border }]} />
        <View style={styles.summaryCardRow}>
          <View style={styles.summaryTopItem}>
            <Text style={[styles.summaryTopLabel, Typography.sectionLabel, { color: colors.textSecondary }]}>Day&apos;s P&L</Text>
            <Text
              style={[styles.summaryTopValue, { color: holdingsSummary.daysPnl >= 0 ? colors.success : colors.danger }]}
              testID="portfolio-holdings-days-pnl"
            >
              {holdingsSummary.daysPnl >= 0 ? '+' : ''}{formatCurrency(holdingsSummary.daysPnl)}
            </Text>
          </View>
          <View style={styles.summaryTopItem}>
            <Text style={[styles.summaryTopLabel, Typography.sectionLabel, { color: colors.textSecondary, textAlign: 'right' }]}>Total P&L</Text>
            <Text
              style={[styles.summaryTopValue, { color: holdingsSummary.totalPnl >= 0 ? colors.success : colors.danger, textAlign: 'right' }]}
              testID="portfolio-holdings-total-pnl"
            >
              {holdingsSummary.totalPnl >= 0 ? '+' : ''}{formatCurrency(holdingsSummary.totalPnl)} ({holdingsSummary.totalPnlPercent.toFixed(2)}%)
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderPositionsTopSummary = () => (
    <View
      style={[styles.summaryTopBar, { borderBottomColor: colors.border, backgroundColor: colors.background }]}
      testID="portfolio-positions-summary"
    >
      <View style={[styles.summaryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.summaryCardRow}>
          <View style={styles.summaryTopItem}>
            <Text style={[styles.summaryTopLabel, { color: colors.textSecondary }]}>Total P&L</Text>
            <Text
              style={[styles.summaryTopValue, { fontSize: 18, color: positionsSummary.totalPnl >= 0 ? colors.success : colors.danger }]}
              testID="portfolio-positions-total-pnl"
            >
              {positionsSummary.totalPnl >= 0 ? '+' : ''}{formatCurrency(positionsSummary.totalPnl)}
            </Text>
          </View>
          <View style={styles.summaryTopItem}>
            <Text style={[styles.summaryTopLabel, { color: colors.textSecondary, textAlign: 'right' }]}>Open positions</Text>
            <Text style={[styles.summaryTopValue, { color: colors.text, textAlign: 'right' }]}>{positions.length}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderHoldingItem = ({ item }: { item: Holding }) => {
    const meta = stocks.find((s) => s.symbol === item.symbol);
    return (
      <TouchableOpacity
        style={[styles.itemContainer, { borderBottomColor: colors.border, backgroundColor: colors.background }]}
        activeOpacity={0.8}
        onPress={() => openStockSheetForHolding(item)}
        testID={`portfolio-holding-row-${item.symbol}`}
      >
        <View style={styles.itemRow}>
          <View style={{ flex: 1, paddingRight: 12 }}>
            <View style={styles.itemTitleRow}>
              <Text style={[styles.itemSymbol, Typography.bodyStrong, { color: colors.text }]}>{item.symbol}</Text>
              <View style={[styles.exchangeTag, { backgroundColor: colors.surface, borderColor: colors.border }]}
                testID={`portfolio-holding-exchange-${item.symbol}`}
              >
                <Text style={[styles.exchangeTagText, { color: colors.textSecondary }]}>{meta?.exchange ?? 'NSE'}</Text>
              </View>
            </View>

            {!!meta?.name && (
              <Text style={[styles.itemName, { color: colors.textSecondary }]} numberOfLines={1}>
                {meta.name}
              </Text>
            )}

            <Text style={[styles.itemQuantity, { color: colors.textSecondary }]}>
              {item.quantity} Qty • Avg. {item.avgPrice.toFixed(2)}
            </Text>

            <View style={styles.itemMetaRow}>
              <Text style={[styles.metaChip, { color: colors.textSecondary }]}>Inv {formatCurrency(item.invested)}</Text>
              <Text style={[styles.metaDot, { color: colors.border }]}>•</Text>
              <Text style={[styles.metaChip, { color: colors.textSecondary }]}>Cur {formatCurrency(item.current)}</Text>
            </View>
          </View>

          <View style={styles.itemRightAlign}>
            <TouchableOpacity
              style={[styles.chatButton, { borderColor: colors.border, backgroundColor: colors.surface }]}
              onPress={() => {
                console.log('[Portfolio] Chat pressed', { symbol: item.symbol });
                openPlaceholder('Chat', `Chat about ${item.symbol} (placeholder).`);
              }}
              activeOpacity={0.85}
              testID={`portfolio-holding-chat-${item.symbol}`}
            >
              <MessageCircle size={16} color={colors.textSecondary} />
            </TouchableOpacity>

            <Text
              style={[
                styles.pnlValue,
                Typography.bodyStrong,
                Typography.monoNumber,
                { color: item.pnl >= 0 ? colors.success : colors.danger, marginTop: 10 },
              ]}
            >
              {item.pnl >= 0 ? '+' : ''}{formatCurrency(item.pnl)}
            </Text>
            <Text style={[styles.pnlPercent, { color: item.pnl >= 0 ? colors.success : colors.danger }]}>
              {item.pnlPercent.toFixed(2)}%
            </Text>
          </View>
        </View>

        <View style={styles.itemRowSecondary}>
          <Text style={[styles.ltpText, Typography.body, Typography.monoNumber, { color: colors.textSecondary }]}>
            LTP {formatCurrency(item.ltp)}
          </Text>
          <Text style={[styles.dayChangeText, { color: item.dayChange >= 0 ? colors.success : colors.danger }]}>
            ({item.dayChangePercent.toFixed(2)}%)
          </Text>
        </View>

        <View style={[styles.itemDivider, { backgroundColor: colors.border }]} />

        <View style={styles.itemQuickRow}>
          <TouchableOpacity
            style={styles.itemQuickAction}
            onPress={() => {
              console.log('[Portfolio] Holding details pressed', { symbol: item.symbol });
              router.push({ pathname: '/stock-detail' as any, params: { symbol: item.symbol } });
            }}
            activeOpacity={0.8}
            testID={`portfolio-holding-details-${item.symbol}`}
          >
            <Text style={[styles.itemQuickText, { color: colors.tint }]}>Stock info</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.itemQuickAction}
            onPress={() => openStockSheetForHolding(item)}
            activeOpacity={0.8}
            testID={`portfolio-holding-actions-${item.symbol}`}
          >
            <Text style={[styles.itemQuickText, { color: colors.textSecondary }]}>Actions</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderPositionItem = ({ item }: { item: Position }) => (
    <View style={[styles.itemContainer, { borderBottomColor: colors.border, backgroundColor: colors.background }]}>
      <View style={styles.itemRow}>
        <View>
          <Text style={[styles.itemSymbol, Typography.bodyStrong, { color: colors.text }]}>{item.symbol}</Text>
          <View style={styles.tagRow}>
             <View style={[styles.tag, { backgroundColor: colors.surface }]}>
                <Text style={[styles.tagText, { color: colors.textSecondary }]}>{item.product}</Text>
             </View>
             <Text style={[styles.itemQuantity, { color: colors.textSecondary, marginLeft: 6 }]}>
               {item.quantity} Qty • Avg. {item.avgPrice.toFixed(2)}
             </Text>
          </View>
        </View>
        <View style={styles.itemRightAlign}>
          <Text style={[styles.pnlValue, Typography.bodyStrong, Typography.monoNumber, { color: item.pnl >= 0 ? colors.success : colors.danger }]}>
             {item.pnl >= 0 ? '+' : ''}{formatCurrency(item.pnl)}
          </Text>
          <Text style={[styles.ltpText, { color: colors.textSecondary, marginTop: 2, textAlign: 'right' }]}>
            LTP {formatCurrency(item.ltp)}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <View style={styles.emptyStateImageContainer}>
         {/* Placeholder for the illustration */}
         <FileText size={80} color={colors.border} />
      </View>
      <Text style={[styles.emptyStateTitle, { color: colors.text }]}>No holdings</Text>
      <Text style={[styles.emptyStateSubtitle, { color: colors.textSecondary }]}>Buy equities from your watchlist</Text>
    </View>
  );

  return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      
      {renderIndices()}

      {/* Top Tabs */}
      <View style={[styles.tabContainer, { borderBottomColor: colors.border, backgroundColor: colors.background }]}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'holdings' && { borderBottomColor: colors.tint, borderBottomWidth: 2 }]}
          onPress={() => setActiveTab('holdings')}
        >
          <Text style={[
            styles.tabText, 
            { color: activeTab === 'holdings' ? colors.tint : colors.textSecondary }
          ]}>
            Holdings
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'positions' && { borderBottomColor: colors.tint, borderBottomWidth: 2 }]}
          onPress={() => setActiveTab('positions')}
        >
          <Text style={[
            styles.tabText, 
            { color: activeTab === 'positions' ? colors.tint : colors.textSecondary }
          ]}>
            Positions
          </Text>
        </TouchableOpacity>
      </View>

      {/* Filter Bar */}
      {activeTab === 'holdings' && (
        <View style={[styles.filterBar, { borderBottomColor: colors.border, backgroundColor: colors.background }]}>
          <View style={styles.filterLeft}
            testID="portfolio-holdings-toolbar"
          >
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => {
                console.log('[Portfolio] Search pressed');
                setSearchVisible((v) => !v);
              }}
              testID="portfolio-search"
            >
              <Search size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => {
                console.log('[Portfolio] Filters pressed');
                openPlaceholder('Filters', 'Holdings filters (placeholder).');
              }}
              testID="portfolio-filters"
            >
              <SlidersHorizontal size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.chip, { backgroundColor: colors.surface }]}
              onPress={() => {
                console.log('[Portfolio] Segment chip pressed');
                openPlaceholder('Equity', 'Switch segment (placeholder).');
              }}
              testID="portfolio-segment-chip"
            >
              <Text style={[styles.chipText, { color: colors.tint }]}>Equity</Text>
              <ChevronDown size={14} color={colors.tint} style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          </View>
          <View style={styles.filterRight}>
            <TouchableOpacity
              style={styles.filterAction}
              onPress={() => {
                console.log('[Portfolio] Family pressed');
                openPlaceholder('Family', 'Family portfolio view (placeholder).');
              }}
              testID="portfolio-family"
            >
              <Users size={18} color={colors.textSecondary} />
              <Text style={[styles.filterActionText, { color: colors.textSecondary }]}>Family</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.filterAction}
              onPress={() => {
                console.log('[Portfolio] Analytics pressed');
                openPlaceholder('Analytics', 'Holdings analytics (placeholder).');
              }}
              testID="portfolio-analytics"
            >
              <PieChart size={18} color={colors.tint} />
              <Text style={[styles.filterActionText, { color: colors.tint }]}>Analytics</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {activeTab === 'holdings' && searchVisible && (
        <View style={[styles.searchBar, { backgroundColor: colors.background, borderBottomColor: colors.border }]} testID="portfolio-searchbar">
          <View style={[styles.searchField, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Search size={16} color={colors.textSecondary} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search holdings"
              placeholderTextColor={colors.textSecondary}
              style={[styles.searchInput, { color: colors.text }]}
              autoCapitalize="characters"
              autoCorrect={false}
              testID="portfolio-search-input"
            />
            <TouchableOpacity
              style={styles.searchClear}
              onPress={() => setSearchQuery('')}
              testID="portfolio-search-clear"
              disabled={!searchQuery}
            >
              <X size={16} color={searchQuery ? colors.textSecondary : colors.border} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Content */}
      {activeTab === 'holdings' ? (
        <View style={{ flex: 1 }}>
          {currentHoldings.length > 0 ? (
            <>
              {renderHoldingsTopSummary()}
              <FlatList
                data={holdingList}
                renderItem={renderHoldingItem}
                keyExtractor={(item) => item.symbol}
                contentContainerStyle={[styles.listContent, { paddingBottom: 96 }]}
                showsVerticalScrollIndicator={false}
                style={{ flex: 1 }}
                testID="portfolio-holdings-list"
              />
            </>
          ) : (
            renderEmptyState()
          )}
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          {renderPositionsTopSummary()}
          <FlatList
            data={positions}
            renderItem={renderPositionItem}
            keyExtractor={(item) => item.symbol}
            contentContainerStyle={[styles.listContent, { paddingBottom: 96 }]}
            showsVerticalScrollIndicator={false}
            style={{ flex: 1 }}
            testID="portfolio-positions-list"
          />
        </View>
      )}

      <StockQuickActionsSheet
        visible={sheetVisible}
        stock={selectedStock}
        onClose={() => {
          console.log('[Portfolio] Stock sheet closed');
          setSheetVisible(false);
          setSelectedStock(null);
        }}
      />

      {/* FAB */}
      <TouchableOpacity
        style={[
          styles.fab,
          { backgroundColor: colors.surface, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 4 },
        ]}
        onPress={() => {
          console.log('[Portfolio] FAB pressed');
          openFabMenu();
        }}
        testID="portfolio-fab"
        activeOpacity={0.85}
      >
        <TrendingUp size={24} color={colors.text} />
      </TouchableOpacity>

      <Modal
        visible={fabMenuVisible}
        transparent
        animationType="none"
        onRequestClose={closeFabMenu}
        statusBarTranslucent
      >
        <Pressable style={styles.fabOverlay} onPress={closeFabMenu} testID="portfolio-fabmenu-backdrop">
          <Animated.View style={[styles.fabBackdrop, { opacity: fabBackdrop }]} />
        </Pressable>

        <Animated.View
          style={[
            styles.fabMenu,
            {
              backgroundColor: colors.background,
              borderColor: colors.border,
              transform: [{ translateY: fabTranslate }],
            },
          ]}
          testID="portfolio-fabmenu"
        >
          <Text style={[styles.fabMenuTitle, { color: colors.textSecondary }]} testID="portfolio-fabmenu-title">
            Quick actions
          </Text>

          <View style={styles.fabMenuGrid}>
            <FabMenuItem
              icon={<Search size={18} color={colors.text} />}
              label="Search"
              onPress={() => {
                console.log('[Portfolio] FAB Search pressed');
                closeFabMenu();
                setSearchVisible(true);
              }}
              colors={colors}
              testID="portfolio-fabmenu-search"
            />
            <FabMenuItem
              icon={<Settings size={18} color={colors.text} />}
              label="Settings"
              onPress={() => {
                console.log('[Portfolio] FAB Settings pressed');
                closeFabMenu();
                router.push('/(tabs)/profile/settings' as any);
              }}
              colors={colors}
              testID="portfolio-fabmenu-settings"
            />
            <FabMenuItem
              icon={<BadgeIndianRupee size={18} color={colors.text} />}
              label="Equity"
              onPress={() => {
                console.log('[Portfolio] FAB Equity pressed');
                closeFabMenu();
                openPlaceholder('Equity', 'Equity quick actions (placeholder).');
              }}
              colors={colors}
              testID="portfolio-fabmenu-equity"
            />
            <FabMenuItem
              icon={<Users size={18} color={colors.text} />}
              label="Family"
              onPress={() => {
                console.log('[Portfolio] FAB Family pressed');
                closeFabMenu();
                openPlaceholder('Family', 'Family holdings (placeholder).');
              }}
              colors={colors}
              testID="portfolio-fabmenu-family"
            />
            <FabMenuItem
              icon={<PieChart size={18} color={colors.text} />}
              label="Analytics"
              onPress={() => {
                console.log('[Portfolio] FAB Analytics pressed');
                closeFabMenu();
                openPlaceholder('Analytics', 'Portfolio analytics (placeholder).');
              }}
              colors={colors}
              testID="portfolio-fabmenu-analytics"
            />
            <FabMenuItem
              icon={<BarChart3 size={18} color={colors.text} />}
              label="Market"
              onPress={() => {
                console.log('[Portfolio] FAB Market pressed');
                closeFabMenu();
                openPlaceholder('Market', 'Market overview (placeholder).');
              }}
              colors={colors}
              testID="portfolio-fabmenu-market"
            />
          </View>

          <TouchableOpacity
            style={[styles.fabMenuClose, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={closeFabMenu}
            activeOpacity={0.8}
            testID="portfolio-fabmenu-close"
          >
            <Text style={[styles.fabMenuCloseText, { color: colors.text }]}>Close</Text>
          </TouchableOpacity>
        </Animated.View>
      </Modal>
    </SafeAreaView>
  );
}

function FabMenuItem({
  icon,
  label,
  onPress,
  colors,
  testID,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  colors: (typeof Colors)['light'];
  testID: string;
}) {
  return (
    <TouchableOpacity
      style={[styles.fabMenuItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.85}
      testID={testID}
    >
      <View style={styles.fabMenuIcon}>{icon}</View>
      <Text style={[styles.fabMenuLabel, { color: colors.textSecondary }]} numberOfLines={1}>
        {label}
      </Text>
    </TouchableOpacity>
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
  indicesExpand: {
    justifyContent: 'center',
    paddingHorizontal: 8,
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
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  searchBar: {
    paddingHorizontal: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  searchField: {
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
  },
  searchClear: {
    width: 28,
    height: 28,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  filterRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconButton: {
    padding: 4,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  filterAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  filterActionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -40, // Adjust visual center due to footer space
  },
  emptyStateImageContainer: {
    marginBottom: 24,
    opacity: 0.5,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    zIndex: 100,
  },
  fabOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  fabBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
    opacity: 0.3,
  },
  fabMenu: {
    position: 'absolute',
    right: 16,
    bottom: 92,
    width: 280,
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
  },
  fabMenuTitle: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  fabMenuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  fabMenuItem: {
    width: '48%',
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  fabMenuIcon: {
    width: 22,
    alignItems: 'center',
  },
  fabMenuLabel: {
    flex: 1,
    fontSize: 13,
    fontWeight: '800',
  },
  fabMenuClose: {
    marginTop: 12,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabMenuCloseText: {
    fontSize: 14,
    fontWeight: '900',
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 20,
  },
  summaryTopBar: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  summaryCard: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  summaryCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  summaryTopItem: {
    flex: 1,
  },
  summaryTopDivider: {
    height: 1,
    marginVertical: 10,
  },
  summaryTopLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  summaryTopValue: {
    marginTop: 3,
    fontSize: 16,
    fontWeight: '700',
  },
  itemContainer: {
    padding: 16,
    borderBottomWidth: 1,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  itemTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  exchangeTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  exchangeTagText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  itemName: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: '600',
  },
  itemMetaRow: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaChip: {
    fontSize: 11,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  metaDot: {
    marginHorizontal: 6,
    fontSize: 11,
    fontWeight: '900',
  },
  chatButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemDivider: {
    height: 1,
    marginTop: 12,
  },
  itemQuickRow: {
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemQuickAction: {
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  itemQuickText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  itemRowSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  itemSymbol: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 2,
  },
  itemQuantity: {
    fontSize: 12,
  },
  itemRightAlign: {
    alignItems: 'flex-end',
  },
  pnlValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  pnlPercent: {
    fontSize: 11,
    marginTop: 2,
  },
  ltpText: {
    fontSize: 12,
  },
  dayChangeText: {
    fontSize: 12,
    marginLeft: 4,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  tag: {
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 3,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '600',
  },

});
