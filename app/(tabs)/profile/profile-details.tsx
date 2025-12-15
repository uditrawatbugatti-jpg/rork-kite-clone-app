import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useColorScheme, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { useRouter } from 'expo-router';
import {
  BadgeCheck,
  Building2,
  ChevronRight,
  Copy,
  CreditCard,
  FileText,
  Fingerprint,
  Landmark,
  Shield,
  User,
} from 'lucide-react-native';

type InfoRow = {
  label: string;
  value: string;
  sensitive?: boolean;
  testID: string;
};

type InfoSection = {
  title: string;
  subtitle?: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  rows: InfoRow[];
  cta?: {
    label: string;
    onPress: () => void;
    testID: string;
  };
};

function maskValue(value: string, keepEnd: number) {
  if (value.length <= keepEnd) return value;
  const masked = '•'.repeat(Math.max(0, value.length - keepEnd));
  return `${masked}${value.slice(-keepEnd)}`;
}

export default function ProfileDetailsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [showSensitive, setShowSensitive] = useState<boolean>(false);

  const sections: InfoSection[] = useMemo(() => {
    const goKyc = () => {
      console.log('[ProfileDetails] Update KYC pressed');
      router.push({
        pathname: '/placeholder' as any,
        params: {
          title: 'Update KYC',
          subtitle: 'KYC update flow (placeholder).',
        },
      });
    };

    const goBank = () => {
      console.log('[ProfileDetails] Bank details pressed');
      router.push({
        pathname: '/placeholder' as any,
        params: {
          title: 'Bank details',
          subtitle: 'Add / change bank account (placeholder).',
        },
      });
    };

    const goNominee = () => {
      console.log('[ProfileDetails] Nominee pressed');
      router.push({
        pathname: '/placeholder' as any,
        params: {
          title: 'Nominee',
          subtitle: 'Nominee management (placeholder).',
        },
      });
    };

    return [
      {
        title: 'Personal & KYC',
        subtitle: 'As per PAN / KYC records',
        icon: User,
        rows: [
          { label: 'Client ID', value: 'DR2598', testID: 'profile-details-client-id' },
          { label: 'Name', value: 'Devki Rawat', testID: 'profile-details-name' },
          { label: 'PAN', value: 'ABCDE1234F', sensitive: true, testID: 'profile-details-pan' },
          { label: 'KYC status', value: 'Verified', testID: 'profile-details-kyc-status' },
        ],
        cta: { label: 'Update KYC', onPress: goKyc, testID: 'profile-details-cta-kyc' },
      },
      {
        title: 'Contact',
        subtitle: 'Used for OTPs & statements',
        icon: Shield,
        rows: [
          { label: 'Email', value: 'devki.rawat@gmail.com', testID: 'profile-details-email' },
          { label: 'Mobile', value: '+91 98XXXXXX10', sensitive: true, testID: 'profile-details-mobile' },
          { label: 'Address', value: 'New Delhi, IN', testID: 'profile-details-address' },
        ],
      },
      {
        title: 'Bank account',
        subtitle: 'For payouts & IPO refunds',
        icon: Landmark,
        rows: [
          { label: 'Account holder', value: 'Devki Rawat', testID: 'profile-details-bank-holder' },
          { label: 'Account number', value: 'XXXXXXXX9012', sensitive: true, testID: 'profile-details-bank-account' },
          { label: 'IFSC', value: 'HDFC0001234', sensitive: true, testID: 'profile-details-bank-ifsc' },
          { label: 'UPI', value: 'devki@upi', testID: 'profile-details-upi' },
        ],
        cta: { label: 'Manage bank', onPress: goBank, testID: 'profile-details-cta-bank' },
      },
      {
        title: 'Depository (Demat)',
        subtitle: 'Holding & pledge information',
        icon: Building2,
        rows: [
          { label: 'DP', value: 'CDSL', testID: 'profile-details-dp' },
          { label: 'BO ID', value: '12XXXXXXXX9012', sensitive: true, testID: 'profile-details-boid' },
          { label: 'POA / DDPI', value: 'Enabled', testID: 'profile-details-ddpi' },
        ],
      },
      {
        title: 'Segments & permissions',
        subtitle: 'Trading enabled segments',
        icon: FileText,
        rows: [
          { label: 'Equity (Cash)', value: 'Active', testID: 'profile-details-seg-eq' },
          { label: 'F&O', value: 'Active', testID: 'profile-details-seg-fo' },
          { label: 'Currency', value: 'Inactive', testID: 'profile-details-seg-curr' },
          { label: 'Commodity', value: 'Inactive', testID: 'profile-details-seg-comm' },
        ],
      },
      {
        title: 'Nominee',
        subtitle: 'Mandatory for compliant accounts',
        icon: BadgeCheck,
        rows: [
          { label: 'Nominee status', value: 'Added', testID: 'profile-details-nominee-status' },
          { label: 'Nominee name', value: 'A. Rawat', testID: 'profile-details-nominee-name' },
        ],
        cta: { label: 'View / update', onPress: goNominee, testID: 'profile-details-cta-nominee' },
      },
      {
        title: 'Security',
        subtitle: 'Protect your account',
        icon: Fingerprint,
        rows: [
          { label: 'App lock', value: 'Enabled', testID: 'profile-details-security-applock' },
          { label: '2FA', value: 'Enabled', testID: 'profile-details-security-2fa' },
          { label: 'Last login', value: 'Today, 10:42 AM', testID: 'profile-details-last-login' },
        ],
      },
    ];
  }, [router]);

  const headerSubtitle = 'Your details are shown as per broker/KYC records.';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.surface }]} edges={['top']}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />

      <View style={[styles.topBar, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <View style={styles.topBarLeft}>
          <Text style={[styles.title, { color: colors.text }]}>Profile details</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{headerSubtitle}</Text>
        </View>

        <TouchableOpacity
          onPress={() => {
            console.log('[ProfileDetails] Toggle sensitive pressed', { next: !showSensitive });
            setShowSensitive((v) => !v);
          }}
          activeOpacity={0.9}
          style={[styles.toggleButton, { backgroundColor: showSensitive ? 'rgba(65, 132, 243, 0.12)' : 'rgba(17, 24, 39, 0.06)' }]}
          testID="profile-details-toggle-sensitive"
        >
          <View style={[styles.toggleDot, { backgroundColor: showSensitive ? colors.tint : colors.textSecondary }]} />
          <Text style={[styles.toggleText, { color: colors.text }]}>{showSensitive ? 'Show' : 'Hide'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} testID="profile-details-scroll">
        <View style={[styles.heroCard, { backgroundColor: colors.background, borderColor: colors.border }]}
          testID="profile-details-hero"
        >
          <View style={styles.heroRow}>
            <View style={[styles.heroIcon, { backgroundColor: 'rgba(65, 132, 243, 0.12)' }]}>
              <CreditCard size={18} color={colors.tint} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.heroTitle, { color: colors.text }]}>Account snapshot</Text>
              <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>Quick view of IDs and verification</Text>
            </View>
          </View>

          <View style={styles.heroGrid}>
            <View style={[styles.pill, { backgroundColor: 'rgba(22, 163, 74, 0.10)' }]}>
              <Text style={[styles.pillLabel, { color: colors.success }]}>KYC</Text>
              <Text style={[styles.pillValue, { color: colors.text }]}>Verified</Text>
            </View>
            <View style={[styles.pill, { backgroundColor: 'rgba(14, 165, 233, 0.10)' }]}>
              <Text style={[styles.pillLabel, { color: colors.secondary }]}>DP</Text>
              <Text style={[styles.pillValue, { color: colors.text }]}>CDSL</Text>
            </View>
            <View style={[styles.pill, { backgroundColor: 'rgba(17, 24, 39, 0.06)' }]}>
              <Text style={[styles.pillLabel, { color: colors.textSecondary }]}>Client</Text>
              <Text style={[styles.pillValue, { color: colors.text }]}>DR2598</Text>
            </View>
          </View>
        </View>

        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <View key={section.title} style={[styles.sectionCard, { backgroundColor: colors.background, borderColor: colors.border }]} testID={`profile-details-section-${section.title}`}
            >
              <View style={styles.sectionHeader}>
                <View style={styles.sectionHeaderLeft}>
                  <View style={[styles.sectionIcon, { backgroundColor: 'rgba(17, 24, 39, 0.06)' }]}>
                    <Icon size={18} color={colors.textSecondary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>{section.title}</Text>
                    {!!section.subtitle && (
                      <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>{section.subtitle}</Text>
                    )}
                  </View>
                </View>

                {!!section.cta && (
                  <TouchableOpacity
                    onPress={section.cta.onPress}
                    activeOpacity={0.9}
                    style={[styles.sectionCta, { borderColor: colors.border }]}
                    testID={section.cta.testID}
                  >
                    <Text style={[styles.sectionCtaText, { color: colors.text }]}>{section.cta.label}</Text>
                    <ChevronRight size={18} color={colors.textSecondary} />
                  </TouchableOpacity>
                )}
              </View>

              <View style={[styles.sectionDivider, { backgroundColor: colors.border }]} />

              {section.rows.map((row, idx) => {
                const displayValue = row.sensitive && !showSensitive ? maskValue(row.value, 4) : row.value;
                const showCopy = row.value.length > 0;

                return (
                  <View
                    key={row.testID}
                    style={[styles.row, idx === section.rows.length - 1 ? styles.rowLast : undefined]}
                    testID={row.testID}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>{row.label}</Text>
                      <Text style={[styles.rowValue, { color: colors.text }]} numberOfLines={1}>
                        {displayValue}
                      </Text>
                    </View>

                    {showCopy && (
                      <TouchableOpacity
                        onPress={() => {
                          console.log('[ProfileDetails] Copy pressed', { label: row.label });
                          router.push({
                            pathname: '/placeholder' as any,
                            params: {
                              title: 'Copy',
                              subtitle: `Copy ${row.label} (placeholder).`,
                            },
                          });
                        }}
                        activeOpacity={0.85}
                        style={[styles.copyButton, { backgroundColor: 'rgba(17, 24, 39, 0.06)' }]}
                        testID={`${row.testID}-copy`}
                      >
                        <Copy size={16} color={colors.textSecondary} />
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })}
            </View>
          );
        })}

        <TouchableOpacity
          onPress={() => {
            console.log('[ProfileDetails] View documents pressed');
            router.push({
              pathname: '/placeholder' as any,
              params: { title: 'Documents', subtitle: 'Account documents (placeholder).' },
            });
          }}
          activeOpacity={0.9}
          style={[styles.bottomCta, { backgroundColor: colors.tint }]}
          testID="profile-details-docs"
        >
          <FileText size={18} color="#fff" />
          <Text style={styles.bottomCtaText}>View documents</Text>
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  topBarLeft: { flex: 1 },
  title: {
    ...Typography.title,
    fontSize: 20,
    fontWeight: '700',
  },
  subtitle: {
    ...Typography.body,
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  toggleDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
  },
  toggleText: {
    ...Typography.body,
    fontSize: 12,
    fontWeight: '700',
  },
  content: {
    padding: 16,
    paddingBottom: 28,
    gap: 14,
  },
  heroCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  heroIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    ...Typography.bodyStrong,
    fontSize: 15,
  },
  heroSubtitle: {
    ...Typography.body,
    fontSize: 12,
    marginTop: 2,
  },
  heroGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  pill: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  pillLabel: {
    ...Typography.sectionLabel,
    fontSize: 11,
    marginBottom: 6,
  },
  pillValue: {
    ...Typography.bodyStrong,
    fontSize: 13,
  },
  sectionCard: {
    borderWidth: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 12,
    gap: 10,
  },
  sectionHeaderLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    ...Typography.bodyStrong,
    fontSize: 14,
  },
  sectionSubtitle: {
    ...Typography.body,
    fontSize: 12,
    marginTop: 2,
  },
  sectionCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  sectionCtaText: {
    ...Typography.bodyStrong,
    fontSize: 12,
  },
  sectionDivider: {
    height: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  rowLast: {
    paddingBottom: 14,
  },
  rowLabel: {
    ...Typography.sectionLabel,
    fontSize: 11,
    marginBottom: 4,
  },
  rowValue: {
    ...Typography.bodyStrong,
    fontSize: 13,
  },
  copyButton: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  bottomCta: {
    marginTop: 6,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  bottomCtaText: {
    color: '#fff',
    ...Typography.bodyStrong,
    fontSize: 14,
  },
  bottomSpacer: {
    height: 12,
  },
});
