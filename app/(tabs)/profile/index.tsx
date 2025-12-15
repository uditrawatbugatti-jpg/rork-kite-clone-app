import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useColorScheme, StatusBar, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { useRouter } from 'expo-router';
import { useMarket } from '@/context/MarketContext';
import { useAuth } from '@/context/AuthContext';
import { 
  User, 
  Settings, 
  LogOut, 
  ChevronRight, 
  Lock,
  IndianRupee,
  Bell,
  Box,
  ChevronDown
} from 'lucide-react-native';

export default function ProfileScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [privacyMode, setPrivacyMode] = useState(false);
  const { indices } = useMarket();
  const { lock } = useAuth();

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
          console.log('[Profile] Indices expand pressed');
        }}
        testID="profile-indices-expand"
      >
        <ChevronDown size={20} color={colors.textSecondary} />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.surface }]} edges={['top']}>
       <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
       
       {renderIndices()}

       <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingBottom: 40 }}>
          {/* Header Title */}
          <View style={[styles.headerTitleContainer, { backgroundColor: colors.background }]}>
             <Text style={[styles.headerTitle, { color: colors.text }]}>Devki Rawat</Text>
             <TouchableOpacity
               onPress={() =>
                 router.push({
                   pathname: '/placeholder' as any,
                   params: { title: 'Notifications', subtitle: 'Notifications settings (placeholder).' },
                 })
               }
               testID="profile-notifications"
               activeOpacity={0.85}
             >
               <Bell size={24} color={colors.text} />
             </TouchableOpacity>
          </View>

          {/* User Card */}
          <View style={[styles.userCard, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
             <View style={styles.userDetails}>
                <View>
                   <Text style={[styles.userId, { color: colors.text }]}>DR2598</Text>
                   <Text style={[styles.userEmail, { color: colors.textSecondary }]}>devki.rawat@gmail.com</Text>
                </View>
                <View style={[styles.avatar, { backgroundColor: '#E3F2FD' }]}>
                   <Text style={[styles.avatarText, { color: '#2196F3' }]}>DR</Text>
                </View>
             </View>
             
             <View style={[styles.separator, { backgroundColor: colors.border }]} />
             
             <View style={styles.privacyRow}>
                <Text style={[styles.privacyText, { color: colors.text }]}>Privacy mode</Text>
                <Switch 
                   value={privacyMode} 
                   onValueChange={setPrivacyMode}
                   trackColor={{ false: "#e0e0e0", true: colors.tint }}
                   thumbColor={"#fff"}
                />
             </View>
          </View>

          {/* Menu Items */}
          <View style={[styles.menuContainer, { backgroundColor: colors.background }]}>
             {/* Account Header */}
             <View style={styles.sectionHeader}>
                <Text style={[styles.sectionHeaderText, { color: colors.text }]}>Account</Text>
             </View>

             <TouchableOpacity
               style={[styles.menuItem, { borderBottomColor: colors.border }]}
               onPress={() => router.push('/(tabs)/profile/funds' as any)}
               testID="profile-funds"
             >
                 <View style={styles.menuIconContainer}>
                   <IndianRupee size={22} color={colors.textSecondary} />
                 </View>
                 <Text style={[styles.menuLabel, { color: colors.text }]}>Funds</Text>
                 <ChevronRight size={20} color={colors.textSecondary} />
             </TouchableOpacity>

             <TouchableOpacity
               style={[styles.menuItem, { borderBottomColor: colors.border }]}
               onPress={() =>
                 router.push('/(tabs)/profile/app-code' as any)
               }
               testID="profile-app-code"
             >
                 <View style={styles.menuIconContainer}>
                   <Lock size={22} color={colors.textSecondary} />
                 </View>
                 <Text style={[styles.menuLabel, { color: colors.text }]}>App Code</Text>
                 <Lock size={20} color={colors.textSecondary} style={{ marginRight: 8 }} />
             </TouchableOpacity>

             <TouchableOpacity
               style={[styles.menuItem, { borderBottomColor: colors.border }]}
               onPress={() =>
                 router.push({
                   pathname: '/placeholder' as any,
                   params: { title: 'Profile', subtitle: 'Personal details & KYC (placeholder).' },
                 })
               }
               testID="profile-profile"
             >
                 <View style={styles.menuIconContainer}>
                   <User size={22} color={colors.textSecondary} />
                 </View>
                 <Text style={[styles.menuLabel, { color: colors.text }]}>Profile</Text>
                 <User size={20} color={colors.textSecondary} style={{ marginRight: 8 }} />
             </TouchableOpacity>

             <TouchableOpacity 
               style={[styles.menuItem, { borderBottomColor: colors.border }]}
               onPress={() => router.push('/(tabs)/profile/settings' as any)}
             >
                 <View style={styles.menuIconContainer}>
                   <Settings size={22} color={colors.textSecondary} />
                 </View>
                 <Text style={[styles.menuLabel, { color: colors.text }]}>Settings</Text>
                 <Settings size={20} color={colors.textSecondary} style={{ marginRight: 8 }} />
             </TouchableOpacity>

             <TouchableOpacity
               style={[styles.menuItem, { borderBottomColor: colors.border }]}
               onPress={() =>
                 router.push({
                   pathname: '/placeholder' as any,
                   params: { title: 'Connected apps', subtitle: 'Manage integrations (placeholder).' },
                 })
               }
               testID="profile-connected-apps"
             >
                 <View style={styles.menuIconContainer}>
                   <Box size={22} color={colors.textSecondary} />
                 </View>
                 <Text style={[styles.menuLabel, { color: colors.text }]}>Connected apps</Text>
                 <ChevronRight size={20} color={colors.textSecondary} />
             </TouchableOpacity>

             <TouchableOpacity
               style={[styles.menuItem, { borderBottomColor: colors.border, marginTop: 20 }]}
               onPress={() => {
                 console.log('[Profile] Logout pressed');
                 lock();
               }}
               testID="profile-logout"
             >
                 <View style={{ flex: 1 }}>
                   <Text style={[styles.menuLabel, { color: colors.text }]}>Logout</Text>
                 </View>
                 <LogOut size={20} color={colors.textSecondary} />
             </TouchableOpacity>
          </View>

       </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
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
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '400',
  },
  userCard: {
    padding: 20,
    borderBottomWidth: 1,
    marginBottom: 20,
  },
  userDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  userId: {
    fontSize: 24,
    fontWeight: '500',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '500',
  },
  separator: {
    height: 1,
    marginBottom: 16,
  },
  privacyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  privacyText: {
    fontSize: 16,
    fontWeight: '500',
  },
  menuContainer: {
    paddingBottom: 20,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionHeaderText: {
    fontSize: 16,
    fontWeight: '600',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  menuIconContainer: {
    width: 40,
    alignItems: 'flex-start',
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '400',
  },
});
