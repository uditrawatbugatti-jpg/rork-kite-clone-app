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

  const [filterModalVisible, setFilterModalVisible] = useState<boolean>(false);
  const [equityDropdownVisible, setEquityDropdownVisible] = useState<boolean>(false);
  const [familyModalVisible, setFamilyModalVisible] = useState<boolean>(false);
  const [analyticsModalVisible, setAnalyticsModalVisible] = useState<boolean>(false);

  const [selectedEquityType, setSelectedEquityType] = useState<'all' | 'equity' | 'mutualfunds'>('all');
  const [selectedFilter, setSelectedFilter] = useState<'kite' | 'smallcase' | null>(null);
  const [selectedSort, setSelectedSort] = useState<'alphabetically' | 'change' | 'ltp' | 'pnl_abs' | 'pnl_pct' | 'invested'>('alphabetically');
  const [familyTab, setFamilyTab] = useState<'personal' | 'family'>('personal');
  const [analyticsTab, setAnalyticsTab] = useState<'personal' | 'family'>('personal');

  // Use context data
  const currentHoldings = holdings;

  const holdingList = useMemo<Holding[]>(() => {
    let filtered = currentHoldings;

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      filtered = filtered.filter((h) => {
        const meta = stocks.find((s) => s.symbol.toLowerCase() === h.symbol.toLowerCase());
        const name = meta?.name ?? '';
        return h.symbol.toLowerCase().includes(q) || name.toLowerCase().includes(q);
      });
    }

    const sorted = [...filtered].sort((a, b) => {
      switch (selectedSort) {
        case 'alphabetically':
          return a.symbol.localeCompare(b.symbol);
        case 'change':
          return b.dayChangePercent - a.dayChangePercent;
        case 'ltp':
          return b.ltp - a.ltp;
        case 'pnl_abs':
          return b.pnl - a.pnl;
        case 'pnl_pct':
          return b.pnlPercent - a.pnlPercent;
        case 'invested':
          return b.invested - a.invested;
        default:
          return 0;
      }
    });

    return sorted;
  }, [currentHoldings, searchQuery, stocks, selectedSort]);

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
                setFilterModalVisible(true);
              }}
              testID="portfolio-filters"
            >
              <SlidersHorizontal size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.chip, { backgroundColor: colors.surface }]}
              onPress={() => {
                console.log('[Portfolio] Segment chip pressed');
                setEquityDropdownVisible(true);
              }}
              testID="portfolio-segment-chip"
            >
              <Text style={[styles.chipText, { color: colors.tint }]}>
                {selectedEquityType === 'all' ? 'All' : selectedEquityType === 'equity' ? 'Equity' : 'Mutual Funds'}
              </Text>
              <ChevronDown size={14} color={colors.tint} style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          </View>
          <View style={styles.filterRight}>
            <TouchableOpacity
              style={styles.filterAction}
              onPress={() => {
                console.log('[Portfolio] Family pressed');
                setFamilyModalVisible(true);
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
                setAnalyticsModalVisible(true);
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
                setFamilyModalVisible(true);
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
                setAnalyticsModalVisible(true);
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

      {/* Filter Modal */}
      <Modal
        visible={filterModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setFilterModalVisible(false)}>
          <View style={styles.modalOverlayBackdrop} />
        </Pressable>
        <View style={[styles.filterModal, { backgroundColor: colors.background }]}>
          <View style={[styles.filterModalHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.filterModalTitle, { color: colors.text }]}>Filter</Text>
            <TouchableOpacity
              onPress={() => {
                setSelectedFilter(null);
                setSelectedSort('alphabetically');
              }}
            >
              <Text style={[styles.clearText, { color: colors.tint }]}>CLEAR</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.filterModalContent}>
            <View style={styles.filterRow}>
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  { borderColor: colors.border, backgroundColor: selectedFilter === 'kite' ? colors.tint : colors.background },
                ]}
                onPress={() => setSelectedFilter(selectedFilter === 'kite' ? null : 'kite')}
              >
                <Text style={[styles.filterChipText, { color: selectedFilter === 'kite' ? '#fff' : colors.text }]}>KITE</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  { borderColor: colors.border, backgroundColor: selectedFilter === 'smallcase' ? colors.tint : colors.background },
                ]}
                onPress={() => setSelectedFilter(selectedFilter === 'smallcase' ? null : 'smallcase')}
              >
                <Text style={[styles.filterChipText, { color: selectedFilter === 'smallcase' ? '#fff' : colors.text }]}>SMALLCASE</Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.filterSectionTitle, { color: colors.text }]}>Sort</Text>

            <TouchableOpacity
              style={[styles.sortOption, { borderBottomColor: colors.border }]}
              onPress={() => {
                setSelectedSort('alphabetically');
                setFilterModalVisible(false);
              }}
            >
              <Text style={[styles.sortOptionLabel, { color: colors.textSecondary }]}>A-Z</Text>
              <Text style={[styles.sortOptionText, { color: colors.text }]}>Alphabetically</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.sortOption, { borderBottomColor: colors.border }]}
              onPress={() => {
                setSelectedSort('change');
                setFilterModalVisible(false);
              }}
            >
              <Text style={[styles.sortOptionLabel, { color: colors.textSecondary }]}>%</Text>
              <Text style={[styles.sortOptionText, { color: colors.text }]}>Change</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.sortOption, { borderBottomColor: colors.border }]}
              onPress={() => {
                setSelectedSort('ltp');
                setFilterModalVisible(false);
              }}
            >
              <Text style={[styles.sortOptionLabel, { color: colors.textSecondary }]}>LTP</Text>
              <Text style={[styles.sortOptionText, { color: colors.text }]}>Last Traded Price</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.sortOption, { borderBottomColor: colors.border }]}
              onPress={() => {
                setSelectedSort('pnl_abs');
                setFilterModalVisible(false);
              }}
            >
              <Text style={[styles.sortOptionLabel, { color: colors.textSecondary }]}>P&L</Text>
              <Text style={[styles.sortOptionText, { color: colors.text }]}>Profit & Loss <Text style={{ color: colors.textSecondary }}>Absolute</Text></Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.sortOption, { borderBottomColor: colors.border }]}
              onPress={() => {
                setSelectedSort('pnl_pct');
                setFilterModalVisible(false);
              }}
            >
              <Text style={[styles.sortOptionLabel, { color: colors.textSecondary }]}>%</Text>
              <Text style={[styles.sortOptionText, { color: colors.text }]}>Profit & Loss <Text style={{ color: colors.textSecondary }}>Percent</Text></Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.sortOption]}
              onPress={() => {
                setSelectedSort('invested');
                setFilterModalVisible(false);
              }}
            >
              <Text style={[styles.sortOptionLabel, { color: colors.textSecondary }]}>₹</Text>
              <Text style={[styles.sortOptionText, { color: colors.text }]}>Invested</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Equity Dropdown Modal */}
      <Modal
        visible={equityDropdownVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setEquityDropdownVisible(false)}
      >
        <Pressable style={styles.dropdownOverlay} onPress={() => setEquityDropdownVisible(false)}>
          <View style={[styles.equityDropdown, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <TouchableOpacity
              style={[
                styles.equityOption,
                selectedEquityType === 'all' && { backgroundColor: colors.surface },
                { borderBottomColor: colors.border },
              ]}
              onPress={() => {
                setSelectedEquityType('all');
                setEquityDropdownVisible(false);
              }}
            >
              <Text style={[styles.equityOptionText, { color: colors.text }]}>All</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.equityOption,
                selectedEquityType === 'equity' && { backgroundColor: colors.surface },
                { borderBottomColor: colors.border },
              ]}
              onPress={() => {
                setSelectedEquityType('equity');
                setEquityDropdownVisible(false);
              }}
            >
              <Text style={[styles.equityOptionText, { color: colors.text }]}>Equity</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.equityOption,
                selectedEquityType === 'mutualfunds' && { backgroundColor: colors.surface },
              ]}
              onPress={() => {
                setSelectedEquityType('mutualfunds');
                setEquityDropdownVisible(false);
              }}
            >
              <Text style={[styles.equityOptionText, { color: colors.text }]}>Mutual Funds</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* Family Modal */}
      <Modal
        visible={familyModalVisible}
        animationType="slide"
        onRequestClose={() => setFamilyModalVisible(false)}
      >
        <SafeAreaView style={[styles.fullModal, { backgroundColor: colors.background }]} edges={['top']}>
          <View style={[styles.fullModalHeader, { borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={() => setFamilyModalVisible(false)} style={styles.modalCloseButton}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.fullModalTitle, { color: colors.text }]}>Family</Text>
            <View style={styles.modalHeaderRight}>
              <View style={[styles.familyIcon, { backgroundColor: colors.tint }]}>
                <Users size={18} color="#fff" />
              </View>
            </View>
          </View>

          <View style={[styles.familyHeaderCard, { backgroundColor: colors.background }]}>
            <View style={[styles.familyIconLarge, { backgroundColor: colors.tint }]}>
              <Users size={20} color="#fff" />
            </View>
            <Text style={[styles.familyHeaderTitle, { color: colors.text }]}>
              {familyTab === 'family' ? 'Family holdings' : 'Holdings'}
            </Text>
          </View>

          <View style={[styles.familyDateChip, { backgroundColor: colors.surface }]}>
            <Text style={[styles.familyDateText, { color: colors.textSecondary }]}>2025-12-15</Text>
          </View>

          <View style={styles.familyTagsRow}>
            <View style={[styles.familyTag, { backgroundColor: '#E8D4FF' }]}>
              <Text style={[styles.familyTagText, { color: '#7C3AED' }]}>Equity</Text>
            </View>
            <View style={[styles.familyTag, { backgroundColor: '#E8D4FF' }]}>
              <Text style={[styles.familyTagText, { color: '#7C3AED' }]}>Debt</Text>
            </View>
            <View style={[styles.familyTag, { backgroundColor: '#E8D4FF' }]}>
              <Text style={[styles.familyTagText, { color: '#7C3AED' }]}>Equity (MF)</Text>
            </View>
            <View style={[styles.familyTag, { backgroundColor: colors.surface }]}>
              <Text style={[styles.familyTagText, { color: colors.tint }]}>+ 3 tags</Text>
            </View>
          </View>

          <View style={[styles.familyTabs, { borderBottomColor: colors.border }]}>
            <TouchableOpacity
              style={[styles.familyTab, familyTab === 'personal' && { borderBottomColor: colors.tint, borderBottomWidth: 2 }]}
              onPress={() => setFamilyTab('personal')}
            >
              <Text style={[styles.familyTabText, { color: familyTab === 'personal' ? colors.tint : colors.textSecondary }]}>Personal</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.familyTab, familyTab === 'family' && { borderBottomColor: colors.tint, borderBottomWidth: 2 }]}
              onPress={() => setFamilyTab('family')}
            >
              <Text style={[styles.familyTabText, { color: familyTab === 'family' ? colors.tint : colors.textSecondary }]}>Family</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.familyContent}>
            {familyTab === 'family' ? (
              <View style={styles.familyEmptyState}>
                <View style={styles.familyEmptyIllustration}>
                  <View style={styles.familyAccountsBox}>
                    <View style={styles.familyAccountAvatar1}>
                      <Users size={20} color="#fff" />
                    </View>
                    <View style={styles.familyWaveLine1} />
                    <View style={styles.familyAccountAvatar2}>
                      <Users size={16} color="#fff" />
                    </View>
                    <View style={styles.familyWaveLine2} />
                  </View>
                  <View style={styles.familyAnalyticsPreview}>
                    <PieChart size={48} color={colors.tint} />
                    <Text style={[styles.analyticsLabel, { color: colors.textSecondary, marginTop: 8 }]}>Analytics</Text>
                  </View>
                  <BarChart3 size={60} color={colors.tint} style={{ marginTop: 16, opacity: 0.5 }} />
                </View>
                <Text style={[styles.familyEmptyText, { color: colors.text }]}>
                  You don&apos;t have sub-accounts added to your family.
                </Text>
                <TouchableOpacity>
                  <Text style={[styles.familyEmptyLink, { color: colors.tint }]}>Learn more.</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.familyLinkButton, { backgroundColor: colors.tint }]}>
                  <Text style={styles.familyLinkButtonText}>Link a sub-account</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.familyEmptyState}>
                <View style={styles.familyReportEmpty}>
                  <View style={[styles.reportCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <View style={[styles.reportIcon, { backgroundColor: colors.tint }]}>
                      <PieChart size={32} color="#fff" />
                    </View>
                    <View style={styles.reportLines}>
                      <View style={[styles.reportLine, { backgroundColor: colors.tint }]} />
                      <View style={[styles.reportLine, { backgroundColor: colors.border, width: '60%' }]} />
                    </View>
                    <View style={styles.reportDots}>
                      {[0, 1, 2, 3, 4, 5].map((i) => (
                        <View key={i} style={[styles.reportDot, { backgroundColor: colors.border }]} />
                      ))}
                    </View>
                  </View>
                  <View style={styles.reportChart}>
                    <View style={[styles.chartWave, { backgroundColor: '#F59E0B' }]} />
                  </View>
                </View>
                <Text style={[styles.familyEmptyTitle, { color: colors.text }]}>Report&apos;s empty</Text>
                <Text style={[styles.familyEmptySubtitle, { color: colors.textSecondary }]}>
                  Buy stocks & ETFs on Kite or transfer your holdings from any broker to Zerodha and easily add your purchase value.{' '}
                  <Text style={{ color: colors.tint }}>Learn more.</Text>
                </Text>
              </View>
            )}
          </View>
        </SafeAreaView>
      </Modal>

      {/* Analytics Modal */}
      <Modal
        visible={analyticsModalVisible}
        animationType="slide"
        onRequestClose={() => setAnalyticsModalVisible(false)}
      >
        <SafeAreaView style={[styles.fullModal, { backgroundColor: colors.background }]} edges={['top']}>
          <View style={[styles.fullModalHeader, { borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={() => setAnalyticsModalVisible(false)} style={styles.modalCloseButton}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.fullModalTitle, { color: colors.text }]}>Analytics</Text>
            <View style={styles.modalHeaderRight}>
              <View style={[styles.familyIcon, { backgroundColor: colors.tint }]}>
                <PieChart size={18} color="#fff" />
              </View>
            </View>
          </View>

          <View style={[styles.familyHeaderCard, { backgroundColor: colors.background }]}>
            <View style={[styles.familyIconLarge, { backgroundColor: colors.tint }]}>
              <PieChart size={20} color="#fff" />
            </View>
            <Text style={[styles.familyHeaderTitle, { color: colors.text }]}>Holdings</Text>
          </View>

          <View style={[styles.familyDateChip, { backgroundColor: colors.surface }]}>
            <Text style={[styles.familyDateText, { color: colors.textSecondary }]}>2025-12-15</Text>
          </View>

          <View style={styles.familyTagsRow}>
            <View style={[styles.familyTag, { backgroundColor: '#E8D4FF' }]}>
              <Text style={[styles.familyTagText, { color: '#7C3AED' }]}>Equity</Text>
            </View>
            <View style={[styles.familyTag, { backgroundColor: '#E8D4FF' }]}>
              <Text style={[styles.familyTagText, { color: '#7C3AED' }]}>Debt</Text>
            </View>
            <View style={[styles.familyTag, { backgroundColor: '#E8D4FF' }]}>
              <Text style={[styles.familyTagText, { color: '#7C3AED' }]}>Equity (MF)</Text>
            </View>
            <View style={[styles.familyTag, { backgroundColor: colors.surface }]}>
              <Text style={[styles.familyTagText, { color: colors.tint }]}>+ 3 tags</Text>
            </View>
          </View>

          <View style={[styles.familyTabs, { borderBottomColor: colors.border }]}>
            <TouchableOpacity
              style={[styles.familyTab, analyticsTab === 'personal' && { borderBottomColor: colors.tint, borderBottomWidth: 2 }]}
              onPress={() => setAnalyticsTab('personal')}
            >
              <Text style={[styles.familyTabText, { color: analyticsTab === 'personal' ? colors.tint : colors.textSecondary }]}>Personal</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.familyTab, analyticsTab === 'family' && { borderBottomColor: colors.tint, borderBottomWidth: 2 }]}
              onPress={() => setAnalyticsTab('family')}
            >
              <Text style={[styles.familyTabText, { color: analyticsTab === 'family' ? colors.tint : colors.textSecondary }]}>Family</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.familyContent}>
            <View style={styles.familyEmptyState}>
              <View style={styles.familyReportEmpty}>
                <View style={[styles.reportCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <View style={[styles.reportIcon, { backgroundColor: colors.tint }]}>
                    <PieChart size={32} color="#fff" />
                  </View>
                  <View style={styles.reportLines}>
                    <View style={[styles.reportLine, { backgroundColor: colors.tint }]} />
                    <View style={[styles.reportLine, { backgroundColor: colors.border, width: '60%' }]} />
                  </View>
                  <View style={styles.reportDots}>
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                      <View key={i} style={[styles.reportDot, { backgroundColor: colors.border }]} />
                    ))}
                  </View>
                </View>
                <View style={styles.reportChart}>
                  <View style={[styles.chartWave, { backgroundColor: '#F59E0B' }]} />
                </View>
              </View>
              <Text style={[styles.familyEmptyTitle, { color: colors.text }]}>Report&apos;s empty</Text>
              <Text style={[styles.familyEmptySubtitle, { color: colors.textSecondary }]}>
                Buy stocks & ETFs on Kite or transfer your holdings from any broker to Zerodha and easily add your purchase value.{' '}
                <Text style={{ color: colors.tint }}>Learn more.</Text>
              </Text>
            </View>
          </View>
        </SafeAreaView>
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
  modalOverlay: {
    flex: 1,
  },
  modalOverlayBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  filterModal: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34,
  },
  filterModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  filterModalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  clearText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  filterModalContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  filterChip: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  filterSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    gap: 12,
  },
  sortOptionLabel: {
    fontSize: 14,
    fontWeight: '700',
    width: 40,
  },
  sortOptionText: {
    fontSize: 15,
    fontWeight: '500',
  },
  dropdownOverlay: {
    flex: 1,
  },
  equityDropdown: {
    position: 'absolute',
    top: 180,
    left: 20,
    width: 200,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  equityOption: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  equityOptionText: {
    fontSize: 15,
    fontWeight: '500',
  },
  fullModal: {
    flex: 1,
  },
  fullModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  modalCloseButton: {
    padding: 4,
  },
  fullModalTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  modalHeaderRight: {
    width: 32,
    alignItems: 'flex-end',
  },
  familyIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  familyHeaderCard: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  familyIconLarge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  familyHeaderTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  familyDateChip: {
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
  },
  familyDateText: {
    fontSize: 13,
    fontWeight: '500',
  },
  familyTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  familyTag: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  familyTagText: {
    fontSize: 13,
    fontWeight: '600',
  },
  familyTabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  familyTab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  familyTabText: {
    fontSize: 15,
    fontWeight: '600',
  },
  familyContent: {
    flex: 1,
  },
  familyEmptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  familyEmptyIllustration: {
    alignItems: 'center',
    marginBottom: 24,
  },
  familyAccountsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  familyAccountAvatar1: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  familyWaveLine1: {
    width: 60,
    height: 2,
    backgroundColor: '#F59E0B',
    marginHorizontal: 8,
  },
  familyAccountAvatar2: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  familyWaveLine2: {
    width: 50,
    height: 2,
    backgroundColor: '#8B5CF6',
    marginLeft: 8,
  },
  familyAnalyticsPreview: {
    alignItems: 'center',
  },
  analyticsLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  familyEmptyText: {
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 8,
  },
  familyEmptyLink: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 24,
  },
  familyLinkButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 8,
  },
  familyLinkButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  familyReportEmpty: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 16,
  },
  reportCard: {
    width: 140,
    height: 100,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  reportIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportLines: {
    gap: 4,
  },
  reportLine: {
    height: 6,
    borderRadius: 3,
  },
  reportDots: {
    flexDirection: 'row',
    gap: 4,
  },
  reportDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  reportChart: {
    width: 100,
    height: 80,
    justifyContent: 'flex-end',
  },
  chartWave: {
    height: 40,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  familyEmptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  familyEmptySubtitle: {
    fontSize: 14,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 20,
  },
});
