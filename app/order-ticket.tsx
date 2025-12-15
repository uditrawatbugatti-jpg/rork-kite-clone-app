import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronDown, ChevronLeft, CheckCircle2 } from 'lucide-react-native';
import Colors from '@/constants/colors';

type OrderSide = 'BUY' | 'SELL';

type OrderTicketParams = {
  symbol?: string;
  side?: OrderSide;
};

type OrderType = 'MARKET' | 'LIMIT';

export default function OrderTicketScreen() {
  const router = useRouter();
  const { symbol, side } = useLocalSearchParams<OrderTicketParams>();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const resolvedSymbol = useMemo(() => {
    if (typeof symbol === 'string' && symbol.trim().length > 0) return symbol.toUpperCase();
    return 'RELIANCE';
  }, [symbol]);

  const resolvedSide: OrderSide = side === 'SELL' ? 'SELL' : 'BUY';

  const [orderType, setOrderType] = useState<OrderType>('MARKET');
  const [qty, setQty] = useState<string>('1');
  const [limitPrice, setLimitPrice] = useState<string>('');

  const sideColor = resolvedSide === 'BUY' ? colors.buy : colors.sell;

  const canSubmit = useMemo(() => {
    const q = Number(qty);
    if (!Number.isFinite(q) || q <= 0) return false;
    if (orderType === 'LIMIT') {
      const p = Number(limitPrice);
      if (!Number.isFinite(p) || p <= 0) return false;
    }
    return true;
  }, [limitPrice, orderType, qty]);

  const submit = () => {
    if (!canSubmit) {
      Alert.alert('Invalid order', 'Please check quantity and price.');
      return;
    }

    const payload = {
      symbol: resolvedSymbol,
      side: resolvedSide,
      type: orderType,
      qty: Number(qty),
      limitPrice: orderType === 'LIMIT' ? Number(limitPrice) : undefined,
      createdAt: new Date().toISOString(),
    };

    console.log('[OrderTicket] Submit order', payload);

    Alert.alert('Order placed (mock)', `${resolvedSide} ${resolvedSymbol} • Qty ${payload.qty}${orderType === 'LIMIT' ? ` @ ₹${payload.limitPrice}` : ''}`);
    router.back();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            testID="order-ticket-back"
          >
            <ChevronLeft size={22} color={colors.text} />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>{resolvedSide} {resolvedSymbol}</Text>
            <View style={[styles.sidePill, { backgroundColor: sideColor + '20', borderColor: sideColor }]}
            >
              <Text style={[styles.sidePillText, { color: sideColor }]}>{resolvedSide}</Text>
            </View>
          </View>

          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Order</Text>

            <View style={styles.row}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Type</Text>
              <TouchableOpacity
                onPress={() => setOrderType((t) => (t === 'MARKET' ? 'LIMIT' : 'MARKET'))}
                activeOpacity={0.85}
                style={[styles.picker, { borderColor: colors.border, backgroundColor: colors.background }]}
                testID="order-ticket-type"
              >
                <Text style={[styles.pickerText, { color: colors.text }]}>{orderType}</Text>
                <ChevronDown size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.row}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Quantity</Text>
              <TextInput
                value={qty}
                onChangeText={setQty}
                keyboardType="numeric"
                placeholder="1"
                placeholderTextColor={colors.textSecondary}
                style={[styles.input, { borderColor: colors.border, backgroundColor: colors.background, color: colors.text }]}
                testID="order-ticket-qty"
              />
            </View>

            {orderType === 'LIMIT' && (
              <View style={styles.row}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Limit price</Text>
                <TextInput
                  value={limitPrice}
                  onChangeText={setLimitPrice}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={colors.textSecondary}
                  style={[styles.input, { borderColor: colors.border, backgroundColor: colors.background, color: colors.text }]}
                  testID="order-ticket-limit"
                />
              </View>
            )}

            <Text style={[styles.note, { color: colors.textSecondary }]}
            >This is a working ticket UI. To connect to a real broker, we need authenticated order APIs.</Text>
          </View>

          <TouchableOpacity
            style={[styles.submit, { backgroundColor: canSubmit ? sideColor : colors.border }]}
            onPress={submit}
            disabled={!canSubmit}
            activeOpacity={0.85}
            testID="order-ticket-submit"
          >
            <CheckCircle2 size={18} color="#fff" />
            <Text style={styles.submitText}>Place order</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    letterSpacing: 0.2,
  },
  sidePill: {
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
  },
  sidePillText: {
    fontSize: 11,
    fontWeight: '800' as const,
    letterSpacing: 0.3,
  },
  content: {
    padding: 16,
    paddingBottom: 28,
  },
  section: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    marginBottom: 12,
  },
  row: {
    marginTop: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: '600' as const,
    marginBottom: 6,
  },
  picker: {
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pickerText: {
    fontSize: 14,
    fontWeight: '700' as const,
  },
  input: {
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 14,
    fontWeight: '600' as const,
  },
  note: {
    marginTop: 12,
    fontSize: 12,
    lineHeight: 16,
  },
  submit: {
    marginTop: 14,
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  submitText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800' as const,
    letterSpacing: 0.2,
  },
});
