import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Appbar, Button, Text } from 'react-native-paper';

export default function Main() {
  return (
    <>
      <Appbar.Header>
        <Appbar.Content title="Expo + Paper" />
      </Appbar.Header>
      <View style={styles.container}>
        <Text variant="headlineMedium" style={{ marginBottom: 16 }}>
          Ciao React Native Paper!
        </Text>
        <Button mode="contained" onPress={() => {}}>
          Cliccami
        </Button>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
});
