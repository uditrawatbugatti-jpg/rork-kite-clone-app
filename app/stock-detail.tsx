import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, useColorScheme, Platform } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { ChevronLeft, TrendingUp, TrendingDown, Clock } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useMarket } from '@/context/MarketContext';

export default function StockDetail() {
  const { symbol } = useLocalSearchParams<{ symbol: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { stocks } = useMarket();

  // Find stock data
  const stock = stocks.find(s => s.symbol === symbol) || {
    symbol: symbol || 'UNKNOWN',
    name: 'Unknown Company',
    price: 0,
    change: 0,
    changePercent: 0,
    exchange: 'NSE',
    isUp: true,
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen 
        options={{
          headerShown: true,
          headerTitle: '',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: Platform.OS === 'ios' ? 0 : 10 }}>
               <ChevronLeft size={24} color={colors.text} />
            </TouchableOpacity>
          ),
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerShadowVisible: false,
          headerRight: () => (
             <View style={{ marginRight: 10 }}>
                <Clock size={20} color={colors.textSecondary} />
             </View>
          )
        }} 
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <Text style={[styles.symbol, { color: colors.text }]}>{stock.symbol}</Text>
          <Text style={[styles.price, { color: stock.isUp ? colors.success : colors.danger }]}>
            {formatCurrency(stock.price)}
          </Text>
          <Text style={[styles.change, { color: colors.textSecondary }]}>
             {stock.change > 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
          </Text>
          <Text style={[styles.exchange, { color: colors.textSecondary }]}>{stock.exchange}</Text>
        </View>

        {/* Chart Placeholder */}
        <View style={[styles.chartContainer, { borderColor: colors.border }]}>
          <View style={styles.chartPlaceholder}>
             {stock.isUp ? (
               <TrendingUp size={64} color={colors.success} />
             ) : (
               <TrendingDown size={64} color={colors.danger} />
             )}
             <Text style={[styles.chartText, { color: colors.textSecondary }]}>Chart Unavailable</Text>
          </View>
          
          <View style={styles.timeframes}>
            {['1D', '1W', '1M', '1Y', '5Y'].map((tf, index) => (
              <TouchableOpacity 
                key={tf} 
                style={[
                  styles.timeframeButton, 
                  index === 0 && { backgroundColor: colors.tint + '20' }
                ]}
                onPress={() => {
                  console.log('[StockDetail] timeframe pressed', tf, symbol);
                }}
                testID={`stock-timeframe-${tf}`}
              >
                <Text style={[
                  styles.timeframeText, 
                  { color: index === 0 ? colors.tint : colors.textSecondary }
                ]}>{tf}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Market Depth Placeholder */}
        <View style={styles.depthContainer}>
           <Text style={[styles.sectionTitle, { color: colors.text }]}>Market Depth (Bids / Offers)</Text>
           <View style={styles.depthTable}>
              <View style={styles.depthHeader}>
                <Text style={[styles.depthHeaderText, { color: colors.textSecondary }]}>Bid</Text>
                <Text style={[styles.depthHeaderText, { color: colors.textSecondary }]}>Orders</Text>
                <Text style={[styles.depthHeaderText, { color: colors.textSecondary }]}>Qty</Text>
                <Text style={[styles.depthHeaderText, { color: colors.textSecondary }]}>Offer</Text>
                <Text style={[styles.depthHeaderText, { color: colors.textSecondary }]}>Orders</Text>
                <Text style={[styles.depthHeaderText, { color: colors.textSecondary }]}>Qty</Text>
              </View>
              {/* Mock Depth Rows */}
              {[1, 2, 3, 4, 5].map((row) => (
                <View key={row} style={styles.depthRow}>
                   <Text style={[styles.depthValue, { color: colors.success }]}>{formatCurrency(stock.price - row * 0.05)}</Text>
                   <Text style={[styles.depthValue, { color: colors.textSecondary }]}>{Math.floor(Math.random() * 10)}</Text>
                   <Text style={[styles.depthValue, { color: colors.textSecondary }]}>{Math.floor(Math.random() * 1000)}</Text>
                   <Text style={[styles.depthValue, { color: colors.danger }]}>{formatCurrency(stock.price + row * 0.05)}</Text>
                   <Text style={[styles.depthValue, { color: colors.textSecondary }]}>{Math.floor(Math.random() * 10)}</Text>
                   <Text style={[styles.depthValue, { color: colors.textSecondary }]}>{Math.floor(Math.random() * 1000)}</Text>
                </View>
              ))}
           </View>
        </View>
        
        {/* Fundamentals Section */}
        <View style={styles.fundamentalsContainer}>
           <Text style={[styles.sectionTitle, { color: colors.text }]}>Fundamentals</Text>
           <View style={styles.fundamentalsGrid}>
              <View style={styles.fundamentalItem}>
                <Text style={[styles.fundamentalLabel, { color: colors.textSecondary }]}>Open</Text>
                <Text style={[styles.fundamentalValue, { color: colors.text }]}>{formatCurrency(stock.price - 10)}</Text>
              </View>
              <View style={styles.fundamentalItem}>
                <Text style={[styles.fundamentalLabel, { color: colors.textSecondary }]}>High</Text>
                <Text style={[styles.fundamentalValue, { color: colors.text }]}>{formatCurrency(stock.price + 15)}</Text>
              </View>
              <View style={styles.fundamentalItem}>
                <Text style={[styles.fundamentalLabel, { color: colors.textSecondary }]}>Low</Text>
                <Text style={[styles.fundamentalValue, { color: colors.text }]}>{formatCurrency(stock.price - 12)}</Text>
              </View>
              <View style={styles.fundamentalItem}>
                <Text style={[styles.fundamentalLabel, { color: colors.textSecondary }]}>Prev. Close</Text>
                <Text style={[styles.fundamentalValue, { color: colors.text }]}>{formatCurrency(stock.price - stock.change)}</Text>
              </View>
           </View>
        </View>

      </ScrollView>

      {/* Footer Buttons */}
      <View style={[styles.footer, { borderTopColor: colors.border, backgroundColor: colors.background }]}>
         <TouchableOpacity
           style={[styles.actionButton, { backgroundColor: colors.buy }]}
           onPress={() =>
             router.push({
               pathname: '/order-ticket' as any,
               params: { symbol: stock.symbol, side: 'BUY' },
             })
           }
           testID="stock-buy"
           activeOpacity={0.85}
         >
            <Text style={styles.actionButtonText}>BUY</Text>
         </TouchableOpacity>
         <TouchableOpacity
           style={[styles.actionButton, { backgroundColor: colors.sell }]}
           onPress={() =>
             router.push({
               pathname: '/order-ticket' as any,
               params: { symbol: stock.symbol, side: 'SELL' },
             })
           }
           testID="stock-sell"
           activeOpacity={0.85}
         >
            <Text style={styles.actionButtonText}>SELL</Text>
         </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  headerSection: {
    padding: 20,
    alignItems: 'center',
  },
  symbol: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  price: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 4,
  },
  change: {
    fontSize: 14,
    marginBottom: 4,
  },
  exchange: {
    fontSize: 12,
    fontWeight: '600',
  },
  chartContainer: {
    height: 300,
    margin: 20,
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  chartPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartText: {
    marginTop: 10,
    fontSize: 14,
  },
  timeframes: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: '#E0E0E0',
  },
  timeframeButton: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  timeframeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  depthContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  depthTable: {
    
  },
  depthHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  depthHeaderText: {
    flex: 1,
    fontSize: 10,
    textAlign: 'right',
  },
  depthRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  depthValue: {
    flex: 1,
    fontSize: 12,
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },
  fundamentalsContainer: {
    padding: 20,
  },
  fundamentalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  fundamentalItem: {
    width: '50%',
    marginBottom: 16,
  },
  fundamentalLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  fundamentalValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    gap: 16,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
});
