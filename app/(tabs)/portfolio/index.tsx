import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, useColorScheme, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Holding, Position } from '@/mocks/stocks';
import { Search, SlidersHorizontal, ChevronDown, Users, PieChart, TrendingUp, FileText } from 'lucide-react-native';
import { useMarket } from '@/context/MarketContext';

export default function PortfolioScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [activeTab, setActiveTab] = useState<'holdings' | 'positions'>('holdings');
  const { holdings, positions, indices } = useMarket();

  // Use context data
  const currentHoldings = holdings; 

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

  const renderHoldingItem = ({ item }: { item: Holding }) => (
    <View style={[styles.itemContainer, { borderBottomColor: colors.border, backgroundColor: colors.background }]}>
      <View style={styles.itemRow}>
        <View>
          <Text style={[styles.itemSymbol, Typography.bodyStrong, { color: colors.text }]}>{item.symbol}</Text>
          <Text style={[styles.itemQuantity, { color: colors.textSecondary }]}>
            {item.quantity} Qty • Avg. {item.avgPrice.toFixed(2)}
          </Text>
        </View>
        <View style={styles.itemRightAlign}>
          <Text style={[styles.pnlValue, Typography.bodyStrong, Typography.monoNumber, { color: item.pnl >= 0 ? colors.success : colors.danger }]}>
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
    </View>
  );

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
           <View style={styles.filterLeft}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => {
                  console.log('[Portfolio] Search pressed');
                }}
                testID="portfolio-search"
              >
                 <Search size={20} color={colors.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => {
                  console.log('[Portfolio] Filters pressed');
                }}
                testID="portfolio-filters"
              >
                 <SlidersHorizontal size={20} color={colors.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.chip, { backgroundColor: colors.surface }]}
                onPress={() => {
                  console.log('[Portfolio] Segment chip pressed');
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
                }}
                testID="portfolio-analytics"
              >
                 <PieChart size={18} color={colors.tint} />
                 <Text style={[styles.filterActionText, { color: colors.tint }]}>Analytics</Text>
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
                data={currentHoldings}
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

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.surface, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 4, elevation: 4 }]}
        onPress={() => {
          console.log('[Portfolio] FAB pressed');
        }}
        testID="portfolio-fab"
        activeOpacity={0.85}
      >
         <TrendingUp size={24} color={colors.text} />
      </TouchableOpacity>
    </SafeAreaView>
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
    marginBottom: 4,
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
