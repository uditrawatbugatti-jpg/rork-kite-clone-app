import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Bell,
  BookText,
  ChartNoAxesCombined,
  ClipboardList,
  LineChart,
  Newspaper,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Zap,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import type { Stock } from '@/mocks/stocks';

type StockQuickActionsSheetProps = {
  visible: boolean;
  stock: Stock | null;
  onClose: () => void;
};

type DerivedStockInfo = {
  low: number;
  high: number;
  open: number;
  prevClose: number;
  volume: number;
  avgTradePrice: number;
  lastTradedQty: number;
  lastTradedAtISO: string;
  lowerCircuit: number;
  upperCircuit: number;
};

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

const seededNumber01 = (seed: string): number => {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return (hash % 10000) / 10000;
};

const formatCurrency = (value: number) =>
  value.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const formatInt = (value: number) => value.toLocaleString('en-IN');

export default function StockQuickActionsSheet({ visible, stock, onClose }: StockQuickActionsSheetProps) {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const translateY = useRef(new Animated.Value(420)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  const derived = useMemo<DerivedStockInfo | null>(() => {
    if (!stock) return null;

    const base = Math.max(1, stock.price);
    const r1 = seededNumber01(`${stock.symbol}-1`);
    const r2 = seededNumber01(`${stock.symbol}-2`);
    const r3 = seededNumber01(`${stock.symbol}-3`);
    const r4 = seededNumber01(`${stock.symbol}-4`);

    const dayRangePct = clamp(0.012 + r1 * 0.035, 0.01, 0.06);
    const high = Math.round(base * (1 + dayRangePct) * 100) / 100;
    const low = Math.round(base * (1 - dayRangePct) * 100) / 100;

    const prevClose = Math.round((base - stock.change) * 100) / 100;
    const openBias = (r2 - 0.5) * dayRangePct;
    const open = Math.round(base * (1 + openBias) * 100) / 100;

    const volume = Math.floor(120_000 + r3 * 2_800_000);
    const avgTradePrice = Math.round((base * (0.993 + r4 * 0.014)) * 100) / 100;
    const lastTradedQty = Math.max(1, Math.floor(1 + seededNumber01(`${stock.symbol}-q`) * 200));

    const now = new Date();
    const lastTradedAtISO = new Date(now.getTime() - Math.floor(seededNumber01(`${stock.symbol}-t`) * 120) * 60_000).toISOString();

    const lowerCircuit = Math.round(prevClose * 0.87 * 100) / 100;
    const upperCircuit = Math.round(prevClose * 1.13 * 100) / 100;

    return {
      low,
      high,
      open,
      prevClose,
      volume,
      avgTradePrice,
      lastTradedQty,
      lastTradedAtISO,
      lowerCircuit,
      upperCircuit,
    };
  }, [stock]);

  useEffect(() => {
    if (!visible) return;

    translateY.setValue(420);
    backdropOpacity.setValue(0);

    Animated.parallel([
      Animated.timing(backdropOpacity, { toValue: 1, duration: 180, useNativeDriver: true }),
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true, damping: 22, stiffness: 220, mass: 0.9 }),
    ]).start();
  }, [backdropOpacity, translateY, visible]);

  const close = useCallback(() => {
    Animated.parallel([
      Animated.timing(backdropOpacity, { toValue: 0, duration: 160, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 420, duration: 160, useNativeDriver: true }),
    ]).start(({ finished }) => {
      if (finished) onClose();
    });
  }, [backdropOpacity, onClose, translateY]);

  const handleBuy = useCallback(() => {
    if (!stock) return;
    close();
    router.push({ pathname: '/order-ticket' as any, params: { symbol: stock.symbol, side: 'BUY' } });
  }, [close, router, stock]);

  const handleSell = useCallback(() => {
    if (!stock) return;
    close();
    router.push({ pathname: '/order-ticket' as any, params: { symbol: stock.symbol, side: 'SELL' } });
  }, [close, router, stock]);

  const handleViewDetails = useCallback(() => {
    if (!stock) return;
    close();
    router.push({ pathname: '/stock-detail' as any, params: { symbol: stock.symbol } });
  }, [close, router, stock]);

  const openPlaceholder = useCallback(
    (title: string, subtitle: string) => {
      close();
      router.push({ pathname: '/placeholder' as any, params: { title, subtitle } });
    },
    [close, router],
  );

  if (!visible || !stock || !derived) return null;

  const changeColor = stock.isUp ? colors.success : colors.danger;

  const dayMin = Math.min(derived.low, derived.high);
  const dayMax = Math.max(derived.low, derived.high);
  const sliderPct = dayMax > dayMin ? clamp((stock.price - dayMin) / (dayMax - dayMin), 0, 1) : 0.5;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={close}
      statusBarTranslucent
      testID="stock-sheet-modal"
    >
      <Pressable style={styles.overlay} onPress={close} testID="stock-sheet-backdrop">
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]} />
      </Pressable>

      <Animated.View
        style={[
          styles.sheet,
          {
            backgroundColor: colors.background,
            borderColor: colors.border,
            transform: [{ translateY }],
          },
        ]}
        testID="stock-sheet"
      >
        <View style={styles.grabberRow}>
          <View style={[styles.grabber, { backgroundColor: colors.border }]} />
        </View>

        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Text style={[styles.symbol, { color: colors.text }]} testID="stock-sheet-symbol">
              {stock.symbol}
            </Text>
            <Text style={[styles.exchange, { color: colors.textSecondary }]} testID="stock-sheet-exchange">
              {stock.exchange}
            </Text>
          </View>

          <View style={styles.headerRight}>
            <Text style={[styles.price, { color: changeColor }]} testID="stock-sheet-price">
              {formatCurrency(stock.price)}
            </Text>
            <Text style={[styles.change, { color: colors.textSecondary }]} testID="stock-sheet-change">
              {stock.change > 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
            </Text>
          </View>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.buy }]}
            onPress={handleBuy}
            activeOpacity={0.9}
            testID="stock-sheet-buy"
          >
            <Text style={styles.actionButtonText}>BUY</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.sell }]}
            onPress={handleSell}
            activeOpacity={0.9}
            testID="stock-sheet-sell"
          >
            <Text style={styles.actionButtonText}>SELL</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.quickRow, { borderTopColor: colors.border, borderBottomColor: colors.border }]}>
          <TouchableOpacity
            style={styles.quickItem}
            onPress={handleViewDetails}
            activeOpacity={0.8}
            testID="stock-sheet-view-details"
          >
            <LineChart size={18} color={colors.textSecondary} />
            <Text style={[styles.quickText, { color: colors.textSecondary }]}>View chart</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickItem}
            onPress={() => openPlaceholder('Option chain', `${stock.symbol} option chain (placeholder).`)}
            activeOpacity={0.8}
            testID="stock-sheet-option-chain"
          >
            <ChartNoAxesCombined size={18} color={colors.textSecondary} />
            <Text style={[styles.quickText, { color: colors.textSecondary }]}>Option chain</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoBlock}>
          <View style={styles.lowHighRow}>
            <View style={styles.lowHighCell}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Low</Text>
              <Text style={[styles.infoValue, { color: colors.text }]} testID="stock-sheet-low">
                {formatCurrency(derived.low)}
              </Text>
            </View>

            <View style={styles.lowHighCell}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary, textAlign: 'right' }]}>High</Text>
              <Text style={[styles.infoValue, { color: colors.text, textAlign: 'right' }]} testID="stock-sheet-high">
                {formatCurrency(derived.high)}
              </Text>
            </View>
          </View>

          <View style={[styles.sliderTrack, { backgroundColor: colors.border }]}>
            <View
              style={[
                styles.sliderFill,
                {
                  backgroundColor: stock.isUp ? colors.success : colors.danger,
                  width: `${Math.round(sliderPct * 100)}%`,
                },
              ]}
            />
            <View
              style={[
                styles.sliderThumb,
                {
                  left: `${Math.round(sliderPct * 100)}%`,
                  borderColor: colors.background,
                  backgroundColor: colors.text,
                },
              ]}
            />
          </View>

          <View style={[styles.kvGrid, { borderTopColor: colors.border }]}>
            <KV label="Open" value={formatCurrency(derived.open)} colors={colors} testID="stock-sheet-open" />
            <KV label="Prev. close" value={formatCurrency(derived.prevClose)} colors={colors} testID="stock-sheet-prev-close" />
            <KV label="Volume" value={formatInt(derived.volume)} colors={colors} testID="stock-sheet-volume" />
            <KV label="Avg. trade price" value={formatCurrency(derived.avgTradePrice)} colors={colors} testID="stock-sheet-avg" />
            <KV label="Last traded quantity" value={formatInt(derived.lastTradedQty)} colors={colors} testID="stock-sheet-ltq" />
            <KV
              label="Last traded at"
              value={new Date(derived.lastTradedAtISO).toLocaleString('en-IN')}
              colors={colors}
              testID="stock-sheet-lta"
            />
            <KV label="Lower circuit" value={formatCurrency(derived.lowerCircuit)} colors={colors} testID="stock-sheet-lower" />
            <KV label="Upper circuit" value={formatCurrency(derived.upperCircuit)} colors={colors} testID="stock-sheet-upper" />
          </View>
        </View>

        <View style={[styles.appsBlock, { borderTopColor: colors.border }]}>
          <Text style={[styles.appsTitle, { color: colors.textSecondary }]}>Apps</Text>

          <AppRow
            icon={<ShieldCheck size={18} color={colors.textSecondary} />}
            title="Fundamentals"
            onPress={() => openPlaceholder('Fundamentals', `${stock.symbol} fundamentals (placeholder).`)}
            colors={colors}
            testID="stock-sheet-fundamentals"
          />
          <AppRow
            icon={<Zap size={18} color={colors.textSecondary} />}
            title="Technicals"
            onPress={() => openPlaceholder('Technicals', `${stock.symbol} technicals (placeholder).`)}
            colors={colors}
            testID="stock-sheet-technicals"
          />
          <AppRow
            icon={<TrendingUp size={18} color={colors.textSecondary} />}
            title="News"
            onPress={() => openPlaceholder('News', `${stock.symbol} news (placeholder).`)}
            colors={colors}
            testID="stock-sheet-news"
          />
        </View>

        <View style={[styles.toolsRow, { borderTopColor: colors.border }]}>
          <ToolPill
            icon={<Bell size={16} color={colors.textSecondary} />}
            label="Set alert"
            onPress={() => openPlaceholder('Set alert', `Create price alerts for ${stock.symbol} (placeholder).`)}
            colors={colors}
            testID="stock-sheet-alert"
          />
          <ToolPill
            icon={<BookText size={16} color={colors.textSecondary} />}
            label="Add notes"
            onPress={() => openPlaceholder('Notes', `Add notes for ${stock.symbol} (placeholder).`)}
            colors={colors}
            testID="stock-sheet-notes"
          />
          <ToolPill
            icon={<ClipboardList size={16} color={colors.textSecondary} />}
            label="Create GTT"
            onPress={() => openPlaceholder('Create GTT', `Good-till-triggered order for ${stock.symbol} (placeholder).`)}
            colors={colors}
            testID="stock-sheet-gtt"
          />
          <ToolPill
            icon={<Sparkles size={16} color={colors.textSecondary} />}
            label="Pin"
            onPress={() => openPlaceholder('Pin to overview', `${stock.symbol} pinned to overview (placeholder).`)}
            colors={colors}
            testID="stock-sheet-pin"
          />
        </View>

        <View style={styles.bottomPad} />

        {Platform.OS === 'web' && (
          <View style={styles.webHint}>
            <Text style={[styles.webHintText, { color: colors.textSecondary }]}>Tap outside to close</Text>
          </View>
        )}
      </Animated.View>
    </Modal>
  );
}

function KV({
  label,
  value,
  colors,
  testID,
}: {
  label: string;
  value: string;
  colors: (typeof Colors)['light'];
  testID: string;
}) {
  return (
    <View style={styles.kvCell} testID={testID}>
      <Text style={[styles.kvLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.kvValue, { color: colors.text }]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function AppRow({
  icon,
  title,
  onPress,
  colors,
  testID,
}: {
  icon: React.ReactNode;
  title: string;
  onPress: () => void;
  colors: (typeof Colors)['light'];
  testID: string;
}) {
  return (
    <TouchableOpacity
      style={[styles.appRow, { borderTopColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.8}
      testID={testID}
    >
      <View style={styles.appRowLeft}>
        {icon}
        <Text style={[styles.appRowTitle, { color: colors.text }]}>{title}</Text>
      </View>
      <Newspaper size={18} color={colors.textSecondary} style={{ opacity: 0 }} />
    </TouchableOpacity>
  );
}

function ToolPill({
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
      style={[styles.toolPill, { borderColor: colors.border, backgroundColor: colors.surface }]}
      onPress={onPress}
      activeOpacity={0.85}
      testID={testID}
    >
      <View style={styles.toolPillIcon}>{icon}</View>
      <Text style={[styles.toolPillText, { color: colors.textSecondary }]} numberOfLines={1}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
    opacity: 0.35,
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderTopWidth: 1,
    paddingBottom: 10,
    maxHeight: '92%',
  },
  grabberRow: {
    paddingTop: 10,
    alignItems: 'center',
  },
  grabber: {
    width: 40,
    height: 4,
    borderRadius: 3,
  },
  headerRow: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 10,
    flex: 1,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  symbol: {
    fontSize: 18,
    fontWeight: '800' as const,
    letterSpacing: 0.2,
  },
  exchange: {
    fontSize: 12,
    fontWeight: '700' as const,
  },
  price: {
    fontSize: 16,
    fontWeight: '800' as const,
    fontVariant: ['tabular-nums'],
  },
  change: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: '600' as const,
    fontVariant: ['tabular-nums'],
  },
  actionsRow: {
    paddingHorizontal: 16,
    paddingTop: 10,
    flexDirection: 'row',
    gap: 14,
  },
  actionButton: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: '900' as const,
    letterSpacing: 0.25,
    fontSize: 16,
  },
  quickRow: {
    marginTop: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 10,
    flexDirection: 'row',
  },
  quickItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 6,
  },
  quickText: {
    fontSize: 13,
    fontWeight: '700' as const,
  },
  infoBlock: {
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  lowHighRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lowHighCell: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  infoValue: {
    marginTop: 4,
    fontSize: 16,
    fontWeight: '800' as const,
    fontVariant: ['tabular-nums'],
  },
  sliderTrack: {
    height: 6,
    borderRadius: 999,
    marginTop: 10,
    overflow: 'hidden',
  },
  sliderFill: {
    height: 6,
    borderRadius: 999,
  },
  sliderThumb: {
    position: 'absolute',
    top: -5,
    width: 14,
    height: 14,
    borderRadius: 7,
    marginLeft: -7,
    borderWidth: 2,
  },
  kvGrid: {
    marginTop: 14,
    borderTopWidth: 1,
    paddingTop: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  kvCell: {
    width: '50%',
    paddingVertical: 10,
    paddingRight: 12,
  },
  kvLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  kvValue: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: '800' as const,
    fontVariant: ['tabular-nums'],
  },
  appsBlock: {
    marginTop: 6,
    borderTopWidth: 1,
    paddingTop: 10,
  },
  appsTitle: {
    paddingHorizontal: 16,
    fontSize: 12,
    fontWeight: '800' as const,
    letterSpacing: 0.4,
    marginBottom: 6,
  },
  appRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
  },
  appRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  appRowTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
  },
  toolsRow: {
    marginTop: 8,
    borderTopWidth: 1,
    paddingHorizontal: 14,
    paddingTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  toolPill: {
    width: '48%',
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  toolPillIcon: {
    width: 20,
    alignItems: 'center',
  },
  toolPillText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700' as const,
  },
  bottomPad: {
    height: 10,
  },
  webHint: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 12,
  },
  webHintText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
});
