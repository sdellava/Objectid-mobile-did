// Main.tsx
import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, Text, Card } from 'react-native-paper';

export default function Main() {
  const [did, setDid] = useState('');
  const [result, setResult] = useState<string>('');
  const network = 'testnet';
  const identityPackageID = '0x2227…cc555';

  const handleResolve = async () => {
    setResult('Resolving…'); // messaggio di attesa
    try {
      const { init, IdentityClientReadOnly, IotaDID } =
        await import('@iota/identity-wasm/web');
      const wasmUrl = require('@iota/identity-wasm/web/identity_wasm_bg.wasm');
      await init(wasmUrl);

      const { getFullnodeUrl, IotaClient } = await import('@iota/iota-sdk/client');
      const client = new IotaClient({ url: getFullnodeUrl(network) });

      const identityClientReadOnly =
        await IdentityClientReadOnly.createWithPkgId(client, identityPackageID);
      const iotaDid = IotaDID.fromAliasId(did, network);
      const didDocument = await identityClientReadOnly.resolveDid(iotaDid);

      // Serializziamo in stringa formattata
      setResult(JSON.stringify(didDocument, null, 2));
    } catch (e: any) {
      setResult(`Error: ${e.message ?? e.toString()}`);
    }
  };

  return (
    <ScrollView
    contentContainerStyle={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    }}
  >
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
