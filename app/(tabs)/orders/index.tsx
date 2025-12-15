import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, useColorScheme, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import Colors from '@/constants/colors';
import { ORDERS_DATA, Order } from '@/mocks/stocks';
import { Clock, CheckCircle2, XCircle, AlertCircle, ChevronDown } from 'lucide-react-native';
import { useMarket } from '@/context/MarketContext';

export default function OrdersScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [activeTab, setActiveTab] = useState<'open' | 'executed' | 'gtt'>('open');
  const { indices } = useMarket();

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
          console.log('[Orders] Indices expand pressed');
        }}
        testID="orders-indices-expand"
      >
        <ChevronDown size={20} color={colors.textSecondary} />
      </TouchableOpacity>
    </View>
  );
  const getFilteredOrders = () => {
    switch (activeTab) {
      case 'open':
        return ORDERS_DATA.filter(order => order.status === 'OPEN');
      case 'executed':
        return ORDERS_DATA.filter(order => ['EXECUTED', 'REJECTED', 'CANCELLED'].includes(order.status));
      case 'gtt':
        return []; // No GTT data yet
      default:
        return [];
    }
  };

  const filteredOrders = getFilteredOrders();

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'EXECUTED': return colors.success;
      case 'REJECTED': return colors.danger;
      case 'CANCELLED': return colors.textSecondary;
      case 'OPEN': return colors.secondary;
      default: return colors.textSecondary;
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'EXECUTED': return <CheckCircle2 size={14} color={colors.success} />;
      case 'REJECTED': return <AlertCircle size={14} color={colors.danger} />;
      case 'CANCELLED': return <XCircle size={14} color={colors.textSecondary} />;
      case 'OPEN': return <Clock size={14} color={colors.secondary} />;
      default: return null;
    }
  };

  const renderOrderItem = ({ item }: { item: Order }) => (
    <TouchableOpacity
      style={[styles.orderItem, { borderBottomColor: colors.border, backgroundColor: colors.background }]}
      onPress={() =>
        router.push({
          pathname: '/placeholder' as any,
          params: { title: `Order ${item.id}`, subtitle: `${item.symbol} • ${item.status} (placeholder)` },
        })
      }
      activeOpacity={0.85}
      testID={`orders-row-${item.id}`}
    >
      <View style={styles.orderHeader}>
         <View style={[
           styles.tag, 
           { backgroundColor: item.type === 'BUY' ? colors.buy + '20' : colors.sell + '20' }
         ]}>
           <Text style={[
             styles.tagText, 
             { color: item.type === 'BUY' ? colors.buy : colors.sell }
           ]}>
             {item.type}
           </Text>
         </View>
         <View style={[styles.tag, { backgroundColor: colors.surface, marginLeft: 8 }]}>
            <Text style={[styles.tagText, { color: colors.textSecondary }]}>{item.product}</Text>
         </View>
         <View style={[styles.tag, { backgroundColor: colors.surface, marginLeft: 8 }]}>
            <Text style={[styles.tagText, { color: colors.textSecondary }]}>{item.exchange}</Text>
         </View>
         <Text style={[styles.timestamp, { color: colors.textSecondary }]}>{item.time}</Text>
      </View>
      
      <View style={styles.mainInfo}>
        <Text style={[styles.symbol, { color: colors.text }]}>{item.symbol}</Text>
        <Text style={[styles.price, { color: colors.text }]}>
          {item.status === 'EXECUTED' 
            ? `${item.quantity} / ${item.totalQuantity} at ${formatCurrency(item.price)}` 
            : `${item.totalQuantity} at ${formatCurrency(item.price)}`}
        </Text>
      </View>

      <View style={styles.statusRow}>
        <View style={styles.statusBadge}>
           {getStatusIcon(item.status)}
           <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
             {item.status}
           </Text>
        </View>
        {item.message && (
          <Text style={[styles.messageText, { color: colors.textSecondary }]}>
            {item.message}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
      
      {renderIndices()}

      {/* Search Bar Placeholder (Optional, similar to Watchlist) */}
      <View style={[styles.searchContainer, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
         <TouchableOpacity
           style={[styles.searchBar, { backgroundColor: colors.surface }]}
           onPress={() =>
             router.push({
               pathname: '/placeholder' as any,
               params: { title: 'Search orders', subtitle: 'Search and filter your orders (placeholder).' },
             })
           }
           testID="orders-search"
           activeOpacity={0.85}
         >
           <Text style={{ color: colors.textSecondary }}>Search orders</Text>
         </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={[styles.tabContainer, { borderBottomColor: colors.border }]}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'open' && { borderBottomColor: colors.tint, borderBottomWidth: 2 }]}
          onPress={() => setActiveTab('open')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'open' ? colors.tint : colors.textSecondary }]}>Open</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'executed' && { borderBottomColor: colors.tint, borderBottomWidth: 2 }]}
          onPress={() => setActiveTab('executed')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'executed' ? colors.tint : colors.textSecondary }]}>Executed</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'gtt' && { borderBottomColor: colors.tint, borderBottomWidth: 2 }]}
          onPress={() => setActiveTab('gtt')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'gtt' ? colors.tint : colors.textSecondary }]}>GTT</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <FlatList
        data={filteredOrders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No orders found</Text>
          </View>
        }
      />
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
  searchContainer: {
    padding: 12,
    borderBottomWidth: 1,
  },
  searchBar: {
    padding: 10,
    borderRadius: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
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
  orderItem: {
    padding: 16,
    borderBottomWidth: 1,
  },
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '700',
  },
  timestamp: {
    fontSize: 10,
    marginLeft: 'auto',
  },
  mainInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  symbol: {
    fontSize: 15,
    fontWeight: '500',
  },
  price: {
    fontSize: 14,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '500',
  },
  messageText: {
    fontSize: 12,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
  },
});
