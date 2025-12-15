import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  TextInput,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowDownLeft, ArrowUpRight, ChevronLeft, CreditCard, IndianRupee, QrCode, ShieldCheck } from 'lucide-react-native';
import Colors from '@/constants/colors';

type TransactionType = 'ADD' | 'WITHDRAW';

type FundsTransaction = {
  id: string;
  type: TransactionType;
  title: string;
  subtitle: string;
  amount: number;
  createdAt: string;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
};

function formatCurrencyINR(value: number): string {
  return value.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function FundsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [upiId, setUpiId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [selectedPreset, setSelectedPreset] = useState<number | null>(5000);

  const [transactions, setTransactions] = useState<FundsTransaction[]>([
    {
      id: 't1',
      type: 'ADD',
      title: 'UPI deposit',
      subtitle: 'Google Pay • UPI',
      amount: 10000,
      createdAt: 'Today • 11:24',
      status: 'SUCCESS',
    },
    {
      id: 't2',
      type: 'WITHDRAW',
      title: 'Withdrawal',
      subtitle: 'To bank account',
      amount: 2500,
      createdAt: 'Yesterday • 16:10',
      status: 'PENDING',
    },
  ]);

  const available = 18420.55;
  const used = 6120.2;
  const collateral = 0;

  const parsedAmount = useMemo(() => {
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) return null;
    return value;
  }, [amount]);

  const resolvedAmount = useMemo(() => {
    if (parsedAmount !== null) return parsedAmount;
    if (selectedPreset !== null) return selectedPreset;
    return null;
  }, [parsedAmount, selectedPreset]);

  const validateUpiId = useCallback((value: string): boolean => {
    const v = value.trim();
    if (!v) return false;
    return /^[a-zA-Z0-9._-]{2,}@[a-zA-Z]{2,}$/.test(v);
  }, []);

  const onSelectPreset = useCallback((value: number) => {
    setSelectedPreset(value);
    setAmount('');
  }, []);

  const onChangeAmount = useCallback((value: string) => {
    const clean = value.replace(/[^0-9.]/g, '');
    setAmount(clean);
    setSelectedPreset(null);
  }, []);

  const createTransaction = useCallback((type: TransactionType, amt: number) => {
    const now = new Date();
    const createdAt = `${now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} • ${now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;

    const tx: FundsTransaction = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      type,
      title: type === 'ADD' ? 'UPI deposit' : 'Withdrawal',
      subtitle: type === 'ADD' ? 'UPI • Funds' : 'To bank account',
      amount: amt,
      createdAt,
      status: 'PENDING',
    };

    setTransactions((prev) => [tx, ...prev]);
  }, []);

  const handleAddFunds = useCallback(() => {
    const amt = resolvedAmount;
    if (amt === null) {
      Alert.alert('Enter amount', 'Please enter a valid amount to add.');
      return;
    }

    if (!validateUpiId(upiId)) {
      Alert.alert('Invalid UPI ID', 'Please enter a valid UPI ID (example: name@bank).');
      return;
    }

    console.log('[Funds] Add funds', { upiId, amt });
    createTransaction('ADD', amt);
    Alert.alert('Request sent', `UPI collect request sent to ${upiId} for ₹${formatCurrencyINR(amt)}.`);
  }, [createTransaction, resolvedAmount, upiId, validateUpiId]);

  const handleWithdraw = useCallback(() => {
    const amt = resolvedAmount;
    if (amt === null) {
      Alert.alert('Enter amount', 'Please enter a valid amount to withdraw.');
      return;
    }

    console.log('[Funds] Withdraw', { amt });
    createTransaction('WITHDRAW', amt);
    Alert.alert('Withdrawal requested', `Your withdrawal of ₹${formatCurrencyINR(amt)} has been queued.`);
  }, [createTransaction, resolvedAmount]);

  const statusPill = useCallback(
    (status: FundsTransaction['status']) => {
      const meta =
        status === 'SUCCESS'
          ? { bg: `${colors.success}20`, fg: colors.success, label: 'Success' }
          : status === 'FAILED'
            ? { bg: `${colors.danger}20`, fg: colors.danger, label: 'Failed' }
            : { bg: `${colors.tint}20`, fg: colors.tint, label: 'Pending' };

      return (
        <View style={[styles.statusPill, { backgroundColor: meta.bg }]}>
          <Text style={[styles.statusPillText, { color: meta.fg }]}>{meta.label}</Text>
        </View>
      );
    },
    [colors.danger, colors.success, colors.tint]
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'Funds',
          headerShown: true,
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ paddingHorizontal: 8, paddingVertical: 6 }}
              testID="funds-back"
            >
              <ChevronLeft size={22} color={colors.text} />
            </TouchableOpacity>
          ),
        }}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} testID="funds-scroll">
          <View style={[styles.summaryCard, { backgroundColor: colors.surface, borderColor: colors.border }]} testID="funds-summary">
            <View style={styles.summaryHeaderRow}>
              <View style={styles.summaryHeaderLeft}>
                <View style={[styles.summaryIcon, { backgroundColor: `${colors.tint}14` }]}> 
                  <IndianRupee size={18} color={colors.tint} />
                </View>
                <View>
                  <Text style={[styles.summaryTitle, { color: colors.text }]}>Available margin</Text>
                  <Text style={[styles.summaryValue, { color: colors.text }]}>₹{formatCurrencyINR(available)}</Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => {
                  console.log('[Funds] Margin breakdown pressed');
                  router.push({
                    pathname: '/placeholder' as any,
                    params: { title: 'Margin breakdown', subtitle: 'Detailed margin breakdown (placeholder).' },
                  });
                }}
                activeOpacity={0.85}
                style={[styles.breakdownBtn, { borderColor: colors.border }]}
                testID="funds-breakdown"
              >
                <Text style={[styles.breakdownBtnText, { color: colors.textSecondary }]}>Breakdown</Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />

            <View style={styles.summaryGrid}>
              <View style={styles.summaryCell}>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Used</Text>
                <Text style={[styles.summaryCellValue, { color: colors.text }]}>₹{formatCurrencyINR(used)}</Text>
              </View>
              <View style={[styles.summaryCell, styles.summaryCellBorder, { borderLeftColor: colors.border }]}>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Collateral</Text>
                <Text style={[styles.summaryCellValue, { color: colors.text }]}>₹{formatCurrencyINR(collateral)}</Text>
              </View>
            </View>

            <View style={[styles.securityRow, { backgroundColor: `${colors.success}10`, borderColor: `${colors.success}30` }]}>
              <ShieldCheck size={16} color={colors.success} />
              <Text style={[styles.securityText, { color: colors.textSecondary }]}>
                Payments are verified before crediting funds.
              </Text>
            </View>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Add funds (UPI)</Text>
            <TouchableOpacity
              onPress={() => {
                console.log('[Funds] Show UPI QR pressed');
                Alert.alert('UPI QR', 'UPI QR screen not implemented yet.');
              }}
              activeOpacity={0.85}
              style={[styles.qrBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
              testID="funds-upi-qr"
            >
              <QrCode size={18} color={colors.textSecondary} />
              <Text style={[styles.qrBtnText, { color: colors.textSecondary }]}>QR</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]} testID="funds-upi-card">
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>UPI ID</Text>
            <TextInput
              value={upiId}
              onChangeText={setUpiId}
              placeholder="name@bank"
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="none"
              autoCorrect={false}
              style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.background }]}
              testID="funds-upi-input"
            />

            <View style={{ height: 14 }} />

            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Amount</Text>
            <View style={styles.amountRow}>
              <View style={[styles.amountPrefix, { borderColor: colors.border, backgroundColor: colors.background }]}
              >
                <Text style={[styles.amountPrefixText, { color: colors.textSecondary }]}>₹</Text>
              </View>
              <TextInput
                value={amount}
                onChangeText={onChangeAmount}
                placeholder={selectedPreset ? String(selectedPreset) : '0'}
                placeholderTextColor={colors.textSecondary}
                keyboardType={Platform.OS === 'web' ? 'default' : 'numeric'}
                style={[styles.amountInput, { borderColor: colors.border, color: colors.text, backgroundColor: colors.background }]}
                testID="funds-amount-input"
              />
            </View>

            <View style={styles.presetRow}>
              {[500, 1000, 2000, 5000].map((v) => {
                const isActive = selectedPreset === v && amount.length === 0;
                return (
                  <TouchableOpacity
                    key={v}
                    style={[
                      styles.presetChip,
                      {
                        backgroundColor: isActive ? `${colors.tint}14` : colors.background,
                        borderColor: isActive ? `${colors.tint}55` : colors.border,
                      },
                    ]}
                    onPress={() => onSelectPreset(v)}
                    activeOpacity={0.85}
                    testID={`funds-preset-${v}`}
                  >
                    <Text style={[styles.presetChipText, { color: isActive ? colors.tint : colors.textSecondary }]}>₹{v}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[styles.primaryAction, { backgroundColor: colors.tint }]}
                onPress={handleAddFunds}
                activeOpacity={0.9}
                testID="funds-add"
              >
                <ArrowDownLeft size={18} color="#fff" />
                <Text style={styles.primaryActionText}>Add</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.secondaryAction, { borderColor: colors.border }]}
                onPress={handleWithdraw}
                activeOpacity={0.9}
                testID="funds-withdraw"
              >
                <ArrowUpRight size={18} color={colors.textSecondary} />
                <Text style={[styles.secondaryActionText, { color: colors.textSecondary }]}>Withdraw</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.bankRow, { borderTopColor: colors.border }]}
              onPress={() => {
                console.log('[Funds] Manage bank accounts pressed');
                router.push({
                  pathname: '/placeholder' as any,
                  params: { title: 'Bank accounts', subtitle: 'Add/edit bank accounts (placeholder).' },
                });
              }}
              activeOpacity={0.85}
              testID="funds-bank-accounts"
            >
              <View style={styles.bankRowLeft}>
                <View style={[styles.bankIcon, { backgroundColor: `${colors.tint}12` }]}
                >
                  <CreditCard size={18} color={colors.tint} />
                </View>
                <View>
                  <Text style={[styles.bankTitle, { color: colors.text }]}>Bank account</Text>
                  <Text style={[styles.bankSubtitle, { color: colors.textSecondary }]}>Manage withdrawal bank</Text>
                </View>
              </View>
              <Text style={[styles.bankCta, { color: colors.tint }]}>Manage</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent</Text>
            <TouchableOpacity
              onPress={() => {
                console.log('[Funds] View all pressed');
                router.push({
                  pathname: '/placeholder' as any,
                  params: { title: 'All transactions', subtitle: 'Full funds ledger (placeholder).' },
                });
              }}
              activeOpacity={0.85}
              testID="funds-view-all"
            >
              <Text style={[styles.viewAll, { color: colors.tint }]}>View all</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]} testID="funds-recent-card">
            {transactions.map((t, idx) => {
              const iconBg = t.type === 'ADD' ? `${colors.success}14` : `${colors.danger}14`;
              const iconFg = t.type === 'ADD' ? colors.success : colors.danger;
              const sign = t.type === 'ADD' ? '+' : '-';

              return (
                <View
                  key={t.id}
                  style={[
                    styles.txRow,
                    idx === 0 ? undefined : { borderTopWidth: 1, borderTopColor: colors.border },
                  ]}
                  testID={`funds-tx-${t.id}`}
                >
                  <View style={styles.txLeft}>
                    <View style={[styles.txIcon, { backgroundColor: iconBg }]}>
                      {t.type === 'ADD' ? (
                        <ArrowDownLeft size={18} color={iconFg} />
                      ) : (
                        <ArrowUpRight size={18} color={iconFg} />
                      )}
                    </View>
                    <View>
                      <Text style={[styles.txTitle, { color: colors.text }]}>{t.title}</Text>
                      <Text style={[styles.txSubtitle, { color: colors.textSecondary }]}>{t.subtitle} • {t.createdAt}</Text>
                    </View>
                  </View>

                  <View style={styles.txRight}>
                    {statusPill(t.status)}
                    <Text style={[styles.txAmount, { color: colors.text }]}>{sign}₹{formatCurrencyINR(t.amount)}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 28,
    gap: 14,
  },
  summaryCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
  },
  summaryHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  summaryHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  summaryIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryTitle: {
    fontSize: 12,
    fontWeight: '700' as const,
    letterSpacing: 0.2,
  },
  summaryValue: {
    marginTop: 4,
    fontSize: 22,
    fontWeight: '800' as const,
  },
  breakdownBtn: {
    height: 34,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  breakdownBtnText: {
    fontSize: 12,
    fontWeight: '700' as const,
  },
  summaryDivider: {
    height: 1,
    marginTop: 12,
    marginBottom: 12,
  },
  summaryGrid: {
    flexDirection: 'row',
  },
  summaryCell: {
    flex: 1,
  },
  summaryCellBorder: {
    paddingLeft: 14,
    borderLeftWidth: 1,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '700' as const,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  summaryCellValue: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: '800' as const,
  },
  securityRow: {
    marginTop: 12,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  securityText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600' as const,
    lineHeight: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800' as const,
  },
  viewAll: {
    fontSize: 13,
    fontWeight: '800' as const,
  },
  qrBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    height: 34,
    borderRadius: 12,
    borderWidth: 1,
  },
  qrBtnText: {
    fontSize: 12,
    fontWeight: '800' as const,
  },
  card: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700' as const,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 46,
    fontSize: 14,
    fontWeight: '700' as const,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  amountPrefix: {
    width: 46,
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  amountPrefixText: {
    fontSize: 16,
    fontWeight: '900' as const,
  },
  amountInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 46,
    fontSize: 16,
    fontWeight: '900' as const,
  },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 12,
  },
  presetChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  presetChipText: {
    fontSize: 12,
    fontWeight: '800' as const,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 14,
  },
  primaryAction: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  primaryActionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '900' as const,
  },
  secondaryAction: {
    width: 140,
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  secondaryActionText: {
    fontSize: 13,
    fontWeight: '900' as const,
  },
  bankRow: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bankRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bankIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bankTitle: {
    fontSize: 13,
    fontWeight: '900' as const,
  },
  bankSubtitle: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: '600' as const,
  },
  bankCta: {
    fontSize: 13,
    fontWeight: '900' as const,
  },
  txRow: {
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  txLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  txIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txTitle: {
    fontSize: 13,
    fontWeight: '900' as const,
  },
  txSubtitle: {
    marginTop: 3,
    fontSize: 11,
    fontWeight: '600' as const,
  },
  txRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  txAmount: {
    fontSize: 13,
    fontWeight: '900' as const,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '900' as const,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
});
