import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert, useColorScheme, KeyboardAvoidingView, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { useMarket } from '@/context/MarketContext';
import { usePaytmMoneyConfig } from '@/context/PaytmMoneyConfigContext';
import { fetchPaytmMoneyQuotes } from '@/services/paytmMoneyService';
import { Trash2, Plus, Edit2, X } from 'lucide-react-native';
import { Holding, Position } from '@/mocks/stocks';

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { holdings, positions, updateHolding, addHolding, deleteHolding, updatePosition, addPosition, deletePosition } = useMarket();
  const { config: paytmConfig, setConfig: setPaytmConfig, clearConfig: clearPaytmConfig } = usePaytmMoneyConfig();

  const [holdingModalVisible, setHoldingModalVisible] = useState(false);
  const [positionModalVisible, setPositionModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<Holding | Position | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form State
  const [symbol, setSymbol] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [product, setProduct] = useState('MIS'); // For positions

  const [pmBaseUrl, setPmBaseUrl] = useState<string>(paytmConfig.baseUrl ?? '');
  const [pmAccessToken, setPmAccessToken] = useState<string>(paytmConfig.accessToken ?? '');
  const [pmApiKey, setPmApiKey] = useState<string>(paytmConfig.apiKey ?? '');
  const [pmApiSecret, setPmApiSecret] = useState<string>(paytmConfig.apiSecret ?? '');

  const resetForm = () => {
    setSymbol('');
    setQuantity('');
    setPrice('');
    setProduct('MIS');
    setEditingItem(null);
    setIsEditing(false);
  };

  const handleSavePaytmConfig = () => {
    setPaytmConfig({
      baseUrl: pmBaseUrl.trim() || undefined,
      accessToken: pmAccessToken.trim() || undefined,
      apiKey: pmApiKey.trim() || undefined,
      apiSecret: pmApiSecret.trim() || undefined,
    });
    Alert.alert('Saved', 'Paytm Money configuration saved. Pull to refresh to see live prices.');
  };

  const handleClearPaytmConfig = () => {
    Alert.alert('Clear config', 'Remove Paytm Money configuration from this device?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: () => {
          clearPaytmConfig();
          setPmBaseUrl('');
          setPmAccessToken('');
          setPmApiKey('');
          setPmApiSecret('');
        },
      },
    ]);
  };

  const handleTestPaytm = async () => {
    try {
      const config = {
        baseUrl: pmBaseUrl.trim() || undefined,
        accessToken: pmAccessToken.trim() || undefined,
        apiKey: pmApiKey.trim() || undefined,
        apiSecret: pmApiSecret.trim() || undefined,
      };

      const res = await fetchPaytmMoneyQuotes({ symbols: ['RELIANCE'], segment: 'NSE', config });
      const q = res['RELIANCE'];
      if (!q) {
        Alert.alert('Test failed', 'No quote returned. Check Base URL and Access Token.');
        return;
      }
      Alert.alert('Connected', `RELIANCE LTP: ₹${q.ltp}`);
    } catch {
      Alert.alert('Test failed', 'Could not fetch quote.');
    }
  };

  const handleEditHolding = (holding: Holding) => {
    setEditingItem(holding);
    setIsEditing(true);
    setSymbol(holding.symbol);
    setQuantity(holding.quantity.toString());
    setPrice(holding.avgPrice.toString());
    setHoldingModalVisible(true);
  };

  const handleAddHolding = () => {
    resetForm();
    setIsEditing(false);
    setHoldingModalVisible(true);
  };

  const handleSaveHolding = () => {
    if (!symbol || !quantity || !price) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    const qty = parseInt(quantity);
    const avgPrice = parseFloat(price);

    if (isNaN(qty) || isNaN(avgPrice)) {
      Alert.alert('Error', 'Invalid numbers');
      return;
    }

    if (isEditing && editingItem) {
      updateHolding(editingItem.symbol, { quantity: qty, avgPrice: avgPrice, invested: qty * avgPrice });
    } else {
      const newHolding: Holding = {
        symbol: symbol.toUpperCase(),
        quantity: qty,
        avgPrice: avgPrice,
        ltp: avgPrice, // Initial assumption
        pnl: 0,
        pnlPercent: 0,
        dayChange: 0,
        dayChangePercent: 0,
        invested: qty * avgPrice,
        current: qty * avgPrice,
      };
      addHolding(newHolding);
    }
    setHoldingModalVisible(false);
    resetForm();
  };

  const handleDeleteHolding = (symbol: string) => {
    Alert.alert('Delete', `Are you sure you want to delete ${symbol}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteHolding(symbol) }
    ]);
  };

  // Position Handlers
  const handleEditPosition = (position: Position) => {
    setEditingItem(position);
    setIsEditing(true);
    setSymbol(position.symbol);
    setQuantity(position.quantity.toString());
    setPrice(position.avgPrice.toString());
    setProduct(position.product);
    setPositionModalVisible(true);
  };

  const handleAddPosition = () => {
    resetForm();
    setIsEditing(false);
    setPositionModalVisible(true);
  };

  const handleSavePosition = () => {
    if (!symbol || !quantity || !price) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    const qty = parseInt(quantity);
    const avgPrice = parseFloat(price);

    if (isNaN(qty) || isNaN(avgPrice)) {
      Alert.alert('Error', 'Invalid numbers');
      return;
    }

    if (isEditing && editingItem) {
      updatePosition(editingItem.symbol, { quantity: qty, avgPrice: avgPrice, product: product as any });
    } else {
      const newPosition: Position = {
        symbol: symbol.toUpperCase(),
        quantity: qty,
        avgPrice: avgPrice,
        ltp: avgPrice,
        pnl: 0,
        type: 'BUY',
        product: product as any,
      };
      addPosition(newPosition);
    }
    setPositionModalVisible(false);
    resetForm();
  };

  const handleDeletePosition = (symbol: string) => {
    Alert.alert('Delete', `Are you sure you want to delete ${symbol}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deletePosition(symbol) }
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <Stack.Screen options={{ title: 'Settings', headerBackTitle: 'Profile' }} />
      
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Paytm Money Live Data</Text>
          </View>

          <View style={[styles.itemCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Base URL</Text>
              <TextInput
                value={pmBaseUrl}
                onChangeText={setPmBaseUrl}
                placeholder="https://api.paytmmoney.com"
                placeholderTextColor={colors.textSecondary}
                style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
                autoCapitalize="none"
                testID="paytm-baseUrl"
              />

              <Text style={[styles.label, { color: colors.textSecondary, marginTop: 12 }]}>Access Token</Text>
              <TextInput
                value={pmAccessToken}
                onChangeText={setPmAccessToken}
                placeholder="Paste access token here"
                placeholderTextColor={colors.textSecondary}
                style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
                autoCapitalize="none"
                secureTextEntry
                testID="paytm-accessToken"
              />

              <Text style={[styles.label, { color: colors.textSecondary, marginTop: 12 }]}>API Key (optional)</Text>
              <TextInput
                value={pmApiKey}
                onChangeText={setPmApiKey}
                placeholder="7a..."
                placeholderTextColor={colors.textSecondary}
                style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
                autoCapitalize="none"
                testID="paytm-apiKey"
              />

              <Text style={[styles.label, { color: colors.textSecondary, marginTop: 12 }]}>API Secret (optional)</Text>
              <TextInput
                value={pmApiSecret}
                onChangeText={setPmApiSecret}
                placeholder="7e..."
                placeholderTextColor={colors.textSecondary}
                style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
                autoCapitalize="none"
                secureTextEntry
                testID="paytm-apiSecret"
              />

              <View style={{ flexDirection: 'row', gap: 12, marginTop: 14 }}>
                <TouchableOpacity
                  onPress={handleTestPaytm}
                  style={[styles.addButton, { backgroundColor: colors.tint, alignSelf: 'flex-start' }]}
                  testID="paytm-test"
                >
                  <Text style={styles.addButtonText}>Test</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSavePaytmConfig}
                  style={[styles.addButton, { backgroundColor: colors.tint, alignSelf: 'flex-start' }]}
                  testID="paytm-save"
                >
                  <Text style={styles.addButtonText}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleClearPaytmConfig}
                  style={[styles.addButton, { backgroundColor: colors.danger, alignSelf: 'flex-start' }]}
                  testID="paytm-clear"
                >
                  <Text style={styles.addButtonText}>Clear</Text>
                </TouchableOpacity>
              </View>

              <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 10, lineHeight: 16 }}>
                Note: This app uses an access token for live quotes. If you only have API Key/Secret, generate an access token from Paytm Money and paste it here.
              </Text>
            </View>
          </View>
        </View>

        {/* Holdings Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Manage Holdings</Text>
            <TouchableOpacity onPress={handleAddHolding} style={[styles.addButton, { backgroundColor: colors.tint }]}>
              <Plus size={16} color="#fff" />
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
          
          {holdings.map((item) => (
            <View key={item.symbol} style={[styles.itemCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.itemInfo}>
                <Text style={[styles.itemSymbol, { color: colors.text }]}>{item.symbol}</Text>
                <Text style={[styles.itemDetail, { color: colors.textSecondary }]}>
                  {item.quantity} Qty @ {item.avgPrice.toFixed(2)}
                </Text>
              </View>
              <View style={styles.itemActions}>
                <TouchableOpacity onPress={() => handleEditHolding(item)} style={styles.actionButton}>
                  <Edit2 size={18} color={colors.textSecondary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteHolding(item.symbol)} style={styles.actionButton}>
                  <Trash2 size={18} color={colors.danger} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
          {holdings.length === 0 && <Text style={{ color: colors.textSecondary, fontStyle: 'italic' }}>No holdings added</Text>}
        </View>

        {/* Positions Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Manage Positions</Text>
            <TouchableOpacity onPress={handleAddPosition} style={[styles.addButton, { backgroundColor: colors.tint }]}>
              <Plus size={16} color="#fff" />
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
          
          {positions.map((item) => (
            <View key={item.symbol} style={[styles.itemCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.itemInfo}>
                <Text style={[styles.itemSymbol, { color: colors.text }]}>{item.symbol}</Text>
                <Text style={[styles.itemDetail, { color: colors.textSecondary }]}>
                  {item.quantity} Qty @ {item.avgPrice.toFixed(2)} ({item.product})
                </Text>
              </View>
              <View style={styles.itemActions}>
                <TouchableOpacity onPress={() => handleEditPosition(item)} style={styles.actionButton}>
                  <Edit2 size={18} color={colors.textSecondary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeletePosition(item.symbol)} style={styles.actionButton}>
                  <Trash2 size={18} color={colors.danger} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
          {positions.length === 0 && <Text style={{ color: colors.textSecondary, fontStyle: 'italic' }}>No positions added</Text>}
        </View>

      </ScrollView>

      {/* Holding Modal */}
      <Modal visible={holdingModalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>{isEditing ? 'Edit Holding' : 'Add Holding'}</Text>
              <TouchableOpacity onPress={() => setHoldingModalVisible(false)}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Symbol</Text>
              <TextInput 
                style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
                value={symbol}
                onChangeText={setSymbol}
                placeholder="e.g. RELIANCE"
                placeholderTextColor={colors.textSecondary}
                editable={!isEditing}
                autoCapitalize="characters"
              />
            </View>
            
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Quantity</Text>
                <TextInput 
                  style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
                  value={quantity}
                  onChangeText={setQuantity}
                  placeholder="0"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Avg Price</Text>
                <TextInput 
                  style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
                  value={price}
                  onChangeText={setPrice}
                  placeholder="0.00"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <TouchableOpacity onPress={handleSaveHolding} style={[styles.saveButton, { backgroundColor: colors.tint }]}>
              <Text style={styles.saveButtonText}>Save Holding</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Position Modal */}
      <Modal visible={positionModalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>{isEditing ? 'Edit Position' : 'Add Position'}</Text>
              <TouchableOpacity onPress={() => setPositionModalVisible(false)}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Symbol</Text>
              <TextInput 
                style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
                value={symbol}
                onChangeText={setSymbol}
                placeholder="e.g. NIFTY 25APR 22500 CE"
                placeholderTextColor={colors.textSecondary}
                editable={!isEditing}
                autoCapitalize="characters"
              />
            </View>
            
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Quantity</Text>
                <TextInput 
                  style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
                  value={quantity}
                  onChangeText={setQuantity}
                  placeholder="0"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Avg Price</Text>
                <TextInput 
                  style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
                  value={price}
                  onChangeText={setPrice}
                  placeholder="0.00"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Product (MIS/NRML/CNC)</Text>
              <TextInput 
                style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
                value={product}
                onChangeText={setProduct}
                placeholder="MIS"
                placeholderTextColor={colors.textSecondary}
                autoCapitalize="characters"
              />
            </View>

            <TouchableOpacity onPress={handleSavePosition} style={[styles.saveButton, { backgroundColor: colors.tint }]}>
              <Text style={styles.saveButtonText}>Save Position</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600' as const,
    fontSize: 12,
    marginLeft: 4,
  },
  itemCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  itemInfo: {
    flex: 1,
  },
  itemSymbol: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  itemDetail: {
    fontSize: 12,
  },
  itemActions: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    padding: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
    minHeight: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    marginBottom: 6,
    fontWeight: '500' as const,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
  },
  saveButton: {
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600' as const,
  },
});
