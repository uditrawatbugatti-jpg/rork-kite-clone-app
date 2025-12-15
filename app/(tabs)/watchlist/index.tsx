import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar, useColorScheme, ScrollView, Pressable } from 'react-native';
import { Search, ChevronDown, ChevronUp, SlidersHorizontal, Info } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Stock } from '@/mocks/stocks';
import { useMarket } from '@/context/MarketContext';
import StockQuickActionsSheet from '@/components/StockQuickActionsSheet';

export default function WatchlistScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [selectedWatchlist, setSelectedWatchlist] = useState<number>(1);
  const { stocks, indices } = useMarket();

  const [selectedStockSymbol, setSelectedStockSymbol] = useState<string | null>(null);
  const [isSheetVisible, setIsSheetVisible] = useState<boolean>(false);

  const selectedStock = useMemo<Stock | null>(() => {
    if (!selectedStockSymbol) return null;
    return stocks.find((s) => s.symbol === selectedStockSymbol) ?? null;
  }, [selectedStockSymbol, stocks]);

  const openSheet = useCallback((symbol: string) => {
    console.log('[Watchlist] openSheet', symbol);
    setSelectedStockSymbol(symbol);
    setIsSheetVisible(true);
  }, []);

  const closeSheet = useCallback(() => {
    console.log('[Watchlist] closeSheet');
    setIsSheetVisible(false);
  }, []);

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
            <Text style={[styles.indexName, Typography.sectionLabel, { color: colors.textSecondary }]}>{index.name}</Text>
            <Text style={[styles.indexPrice, Typography.bodyStrong, Typography.monoNumber, { color: index.isUp ? colors.success : colors.danger }]}>
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

  const renderStockItem = ({ item }: { item: Stock }) => (
    <Pressable
      style={[styles.stockItem, { borderBottomColor: colors.border, backgroundColor: colors.background }]}
      onPress={() => openSheet(item.symbol)}
      android_ripple={{ color: colors.border }}
      testID={`watchlist-stock-${item.symbol}`}
    >
      <View style={styles.stockInfo}>
        <Text style={[styles.stockSymbol, Typography.bodyStrong, { color: colors.text }]}>{item.symbol}</Text>
        <Text style={[styles.stockExchange, { color: colors.textSecondary }]}>{item.exchange}</Text>
      </View>

      <View style={styles.stockRight}>
        <View style={styles.stockPriceInfo}>
          <Text style={[styles.stockPrice, Typography.bodyStrong, Typography.monoNumber, { color: item.isUp ? colors.success : colors.danger }]}>
            {formatCurrency(item.price)}
          </Text>
          <View style={styles.stockChangeContainer}>
            {item.isUp ? <ChevronUp size={12} color={colors.textSecondary} /> : <ChevronDown size={12} color={colors.textSecondary} />}
            <Text style={[styles.stockChange, Typography.body, Typography.monoNumber, { color: colors.textSecondary }]}>
              {item.change.toFixed(2)} ({item.changePercent.toFixed(2)}%)
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.infoBtn}
          onPress={() => openSheet(item.symbol)}
          activeOpacity={0.8}
          testID={`watchlist-stock-info-${item.symbol}`}
        >
          <Info size={18} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />

      {renderIndices()}

      <View style={[styles.watchlistTabsContainer, { backgroundColor: colors.background }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.watchlistTabsContent}>
          {[1, 2, 3, 4, 5, 6, 7].map((num) => (
            <TouchableOpacity
              key={num}
              style={[styles.watchlistTab, selectedWatchlist === num && { borderBottomColor: colors.tint, borderBottomWidth: 2 }]}
              onPress={() => setSelectedWatchlist(num)}
              testID={`watchlist-tab-${num}`}
            >
              <Text
                style={[
                  styles.watchlistTabText,
                  { color: selectedWatchlist === num ? colors.tint : colors.textSecondary },
                ]}
              >
                Watchlist {num}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={styles.watchlistSettingsTab}
            onPress={() =>
              router.push({
                pathname: '/placeholder' as any,
                params: { title: 'Watchlist settings', subtitle: 'Edit watchlists, columns and sorting (placeholder).' },
              })
            }
            testID="watchlist-settings"
          >
            <SlidersHorizontal size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        </ScrollView>
      </View>

      <View style={[styles.searchContainer, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.searchBar, { backgroundColor: colors.surface }]}
          onPress={() =>
            router.push({
              pathname: '/placeholder' as any,
              params: { title: 'Search & add', subtitle: 'Search and add instruments to this watchlist (placeholder).' },
            })
          }
          activeOpacity={0.8}
          testID="watchlist-search"
        >
          <Search size={20} color={colors.textSecondary} />
          <Text style={[styles.searchText, { color: colors.textSecondary }]}>Search & add</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterIcon, { borderLeftColor: colors.border }]}
          onPress={() =>
            router.push({
              pathname: '/placeholder' as any,
              params: { title: 'Filters & sort', subtitle: 'Filter, sort and group instruments (placeholder).' },
            })
          }
          testID="watchlist-filter"
          activeOpacity={0.8}
        >
          <Text style={{ color: colors.textSecondary, fontSize: 14 }}>{stocks.length}/100</Text>
          <View style={{ marginLeft: 8 }}>
            <SlidersHorizontal size={20} color={colors.text} />
          </View>
        </TouchableOpacity>
      </View>

      <FlatList
        data={stocks}
        renderItem={renderStockItem}
        keyExtractor={(item) => item.symbol}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <StockQuickActionsSheet visible={isSheetVisible} stock={selectedStock} onClose={closeSheet} />
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
  searchContainer: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  searchText: {
    marginLeft: 8,
    fontSize: 14,
  },
  filterIcon: {
    paddingLeft: 12,
    borderLeftWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingBottom: 20,
  },
  watchlistTabsContainer: {
    borderBottomWidth: 0,
    elevation: 0,
    shadowOpacity: 0,
  },
  watchlistTabsContent: {
    paddingHorizontal: 8,
  },
  watchlistTab: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginHorizontal: 4,
  },
  watchlistSettingsTab: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  watchlistTabText: {
    fontSize: 13,
    fontWeight: '600',
  },
  stockItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  stockInfo: {
    justifyContent: 'center',
  },
  stockSymbol: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 4,
  },
  stockExchange: {
    fontSize: 11,
  },
  stockRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stockPriceInfo: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  stockPrice: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  stockChangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stockChange: {
    fontSize: 11,
    marginLeft: 2,
  },
  infoBtn: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
});
