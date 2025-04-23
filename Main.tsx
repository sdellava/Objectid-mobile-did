import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator, Vibration } from 'react-native';
import { Text, TextInput, Button, Appbar, Dialog, Card } from 'react-native-paper';
import * as SecureStore from 'expo-secure-store';
import { CameraView, useCameraPermissions } from 'expo-camera';

const PIN_KEY = 'user_pin';
const SEED_KEY = 'user_seed';

export default function Main() {
  const [isLoading, setIsLoading] = useState(true);
  const [storedPin, setStoredPin] = useState<string | null>(null);
  const [storedSeed, setStoredSeed] = useState<string | null>(null);
  const [pinInput, setPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isSettings, setIsSettings] = useState(false);

  const [seedInput, setSeedInput] = useState('');
  const [displaySeedUI, setDisplaySeedUI] = useState(false);
  const [openScanner, setOpenScanner] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const isScanning = useRef(false);
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    async function init() {
      try {
        const [pin, seed] = await Promise.all([
          SecureStore.getItemAsync(PIN_KEY),
          SecureStore.getItemAsync(SEED_KEY),
        ]);
        setStoredPin(pin);
        setStoredSeed(seed);
      } catch (e) {
        console.error('Initialization error', e);
      } finally {
        setIsLoading(false);
      }
    }
    init();
  }, []);

  useEffect(() => {
    if (openScanner && permission && !permission.granted) {
      requestPermission().catch(console.error);
    }
  }, [openScanner]);

  const handleSavePin = async () => {
    if (pinInput.length < 4) {
      Alert.alert('Error', 'PIN must be at least 4 digits.');
      return;
    }
    if (pinInput !== confirmPinInput) {
      Alert.alert('Error', 'PINs do not match.');
      return;
    }
    try {
      await SecureStore.setItemAsync(PIN_KEY, pinInput);
      setStoredPin(pinInput);
      setPinInput('');
      setConfirmPinInput('');
      Alert.alert('Success', 'PIN saved!');
    } catch (e) {
      console.error('Failed to save PIN', e);
      Alert.alert('Error', 'Unable to save PIN.');
    }
  };

  const handleUnlock = () => {
    if (pinInput === storedPin) {
      setIsUnlocked(true);
      setPinInput('');
    } else {
      Alert.alert('Error', 'Incorrect PIN.');
    }
  };

  const handleSeedScanned = async ({ data }: { data: string }) => {
    if (isScanning.current) return;
    isScanning.current = true;
    try {
      if (/^[0-9a-fA-F]{64}$/.test(data)) {
        await SecureStore.setItemAsync(SEED_KEY, data);
        setStoredSeed(data);
        setOpenScanner(false);
        setDisplaySeedUI(true);
        Vibration.vibrate(100);
        Alert.alert('Success', 'Seed saved!');
      } else {
        Alert.alert('Error', 'Invalid seed format.');
        isScanning.current = false;
        cameraRef.current?.pausePreview();
      }
    } catch (e) {
      console.error('Error scanning seed:', e);
      isScanning.current = false;
      cameraRef.current?.pausePreview();
    }
  };

  const handleSaveSeedManually = async () => {
    if (!/^[0-9a-fA-F]{64}$/.test(seedInput)) {
      Alert.alert('Error', 'Seed must be a 64-character hexadecimal string.');
      return;
    }
    try {
      await SecureStore.setItemAsync(SEED_KEY, seedInput);
      setStoredSeed(seedInput);
      setSeedInput('');
      setDisplaySeedUI(true);
      Alert.alert('Success', 'Seed saved!');
    } catch (e) {
      console.error('Failed to save seed', e);
      Alert.alert('Error', 'Unable to save seed.');
    }
  };

  const handleChangePin = async () => {
    await SecureStore.deleteItemAsync(PIN_KEY);
    setStoredPin(null);
    setIsUnlocked(false);
    setIsSettings(false);
  };

  const handleChangeSeed = async () => {
    await SecureStore.deleteItemAsync(SEED_KEY);
    setStoredSeed(null);
    setDisplaySeedUI(false);
    setIsSettings(false);
  };

  if (isLoading) return <ActivityIndicator style={styles.container} />;

  // Settings page
  if (isUnlocked && isSettings) return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.heading}>Settings</Text>
      <Button mode="outlined" onPress={handleChangePin} style={styles.button}>Change PIN</Button>
      <Button mode="outlined" onPress={handleChangeSeed} style={styles.button}>Change Seed</Button>
      <Button mode="text" onPress={() => setIsSettings(false)}>Cancel</Button>
    </View>
  );

  // PIN setup
  if (!storedPin) return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.heading}>Set a PIN</Text>
      <TextInput label="New PIN" value={pinInput} onChangeText={setPinInput} secureTextEntry keyboardType="numeric" maxLength={6} style={styles.input} />
      <TextInput label="Confirm PIN" value={confirmPinInput} onChangeText={setConfirmPinInput} secureTextEntry keyboardType="numeric" maxLength={6} style={[styles.input, { marginBottom: 16 }]} />
      <Button mode="contained" onPress={handleSavePin}>Save PIN</Button>
    </View>
  );

  // Unlock
  if (!isUnlocked) return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.heading}>Enter PIN</Text>
      <TextInput label="PIN" value={pinInput} onChangeText={setPinInput} secureTextEntry keyboardType="numeric" maxLength={6} style={[styles.input, { marginBottom: 16 }]} />
      <Button mode="contained" onPress={handleUnlock}>Unlock</Button>
    </View>
  );

  // Seed setup UI
    if (!storedSeed || !displaySeedUI) return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.heading}>Configure Your Seed</Text>
      <Button mode="contained" onPress={() => setOpenScanner(true)} style={styles.button}>Scan Seed QR</Button>
      <TextInput
        label="Hex Seed (64 chars)"
        value={seedInput}
        onChangeText={setSeedInput}
        autoCapitalize="none"
        style={[styles.input, { marginBottom: 16 }]}
      />
      <Button mode="contained" onPress={handleSaveSeedManually}>Save Manually</Button>
      <Dialog visible={openScanner} onDismiss={() => setOpenScanner(false)}>
        <Dialog.Title>QR Code Scanner</Dialog.Title>
        <Dialog.Content>
          {permission && permission.granted ? (
            <CameraView
              style={{ width: 300, height: 300 }}
              onBarcodeScanned={handleSeedScanned}
              ref={cameraRef}
              barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            />
          ) : (
            <Text>Camera permission required</Text>
          )}
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setOpenScanner(false)}>Close</Button>
        </Dialog.Actions>
      </Dialog>
    </View>
  );

  // App fully setup and unlocked
  return (
    <>
      <Appbar.Header>
        <Appbar.Content title="Home" />
        <Appbar.Action icon="cog" onPress={() => setIsSettings(true)} />
      </Appbar.Header>
      <View style={styles.container}>
        <Text variant="headlineMedium">Welcome!</Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  heading: { marginBottom: 16 },
  input: { width: '100%', marginBottom: 8 },
  button: { width: '100%', marginBottom: 8 },
});