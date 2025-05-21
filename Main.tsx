// Main.tsx
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, Text, Card } from 'react-native-paper';

import { useBridge } from '@webview-bridge/react-native';
import { appBridge } from './AppBridge';
import IdentityWebView, {postMessage} from './IdentityWebView';

export default function Main() {

  const [did, setDid] = useState('');
  const [result, setResult] = useState<string>('');
  const initialized = useBridge(appBridge, (state) => state.initialized);
  const resolvedDID = useBridge(appBridge, (state) => state.resolvedDID);

  useEffect(() => {
    if (!resolvedDID) return;
    setResult(resolvedDID);
  }, [resolvedDID]);

  const handleResolve = async () => {
    setResult('Resolving…'); // messaggio di attesa
    try {
      postMessage("resolve", did)
    } catch (e: any) {
      setResult(`Error: ${e.message ?? e.toString()}`);
    }
  };

  return (
    <>
      <IdentityWebView/>
      <ScrollView contentContainerStyle={styles.container}>
        <Text variant="headlineMedium" style={styles.heading}>
          Distributed Identifier (DID)
        </Text>

        <TextInput
          label="DID:"
          value={did}
          onChangeText={setDid}
          style={styles.input}
          mode="outlined"
          placeholder="0x…"
        />

        <Button
          mode="contained"
          onPress={handleResolve}
          loading={!initialized}
          disabled={did.trim() === ''}
          style={styles.button}
        >
          Resolve
        </Button>

        <Card style={styles.resultCard}>
          <Card.Title title="Result" />
          <Card.Content>
            <TextInput
              value={result}
              multiline
              editable={false}
              style={styles.resultInput}
              mode="outlined"
            />
          </Card.Content>
        </Card>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    justifyContent: 'flex-start',
  },
  heading: {
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginBottom: 24,
    alignSelf: 'center',
    width: '50%',
  },
  resultCard: {
    marginTop: 16,
  },
  resultInput: {
    minHeight: 100,
  },
});
