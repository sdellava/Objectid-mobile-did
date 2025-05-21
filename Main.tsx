// Main.tsx
import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { TextInput, Button, Text, Card } from "react-native-paper";

import { useBridge } from "@webview-bridge/react-native";
import { appBridge } from "./AppBridge";
import IdentityWebView, { postMessage } from "./IdentityWebView";

export default function Main() {
  const [did, setDid] = useState("0x12d98414a107efcc099e8954b12573a5f4d70701f5881cebbf543b59261ceecb");
  const [result, setResult] = useState<string>("");
  const [seed, setSeed] = useState("ed04973a11d27c4956c13849c6f1b2de48c33381aef58999aae2f5b87b5bfdda");

  const initialized = useBridge(appBridge, (state) => state.initialized);
  const resolvedDID = useBridge(appBridge, (state) => state.resolvedDID);
  const createdDID = useBridge(appBridge, (state) => state.createdDID);

  const network = "testnet";

  useEffect(() => {
    if (resolvedDID !== "") {
      console.log("resolvedDID updated:", resolvedDID);
      setResult(`DID Document:\n${resolvedDID}`);
    }
  }, [resolvedDID]);

  const handleResolve = async () => {
    console.log("Resolving DID:", did);
    setResult("Resolving…");
    try {
      postMessage("resolve", did);
    } catch (e: any) {
      setResult(`Error: ${e.message ?? e.toString()}`);
    }
  };

  useEffect(() => {
    if (!createdDID) return;
    setResult(`DID created successfully: ${createdDID.toString()}`);
  }, [createdDID]);

  const handleCreate = async () => {
    setResult("Creating…");
    try {
      postMessage("create", {
        seed,
        network,
      });
    } catch (e: any) {
      setResult(`Error: ${e.message ?? e.toString()}`);
    }
  };

  return (
    <>
      <IdentityWebView />
      <ScrollView contentContainerStyle={styles.container}>
        <Text variant="headlineMedium" style={styles.heading}>
          Distributed Identifier (DID)
        </Text>

        <TextInput
          label="SEED:"
          value={seed}
          onChangeText={setSeed}
          style={styles.input}
          mode="outlined"
          placeholder="...."
        />

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
          onPress={handleCreate}
          loading={!initialized}
          disabled={seed.trim() === ""}
          style={styles.button}
        >
          Create DID
        </Button>

        <Button
          mode="contained"
          onPress={handleResolve}
          loading={!initialized}
          disabled={did.trim() === ""}
          style={styles.button}
        >
          Resolve
        </Button>

        <Card style={styles.resultCard}>
          <Card.Title title="Result" />
          <Card.Content>
            <TextInput value={result} multiline editable={false} style={styles.resultInput} mode="outlined" />
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
    justifyContent: "flex-start",
  },
  heading: {
    textAlign: "center",
    marginBottom: 24,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginBottom: 24,
    alignSelf: "center",
    width: "50%",
  },
  resultCard: {
    marginTop: 16,
  },
  resultInput: {
    minHeight: 100,
  },
});
