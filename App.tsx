// App.tsx
import React, { useEffect, useState } from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  Roboto_100Thin,
  Roboto_300Light,
  Roboto_400Regular,
  Roboto_500Medium,
} from '@expo-google-fonts/roboto';
import { theme } from './theme';
import Main from './Main';

import { init } from "@iota/identity-wasm/web";

import wasmUrl from "@iota/identity-wasm/web/identity_wasm_bg.wasm?url";

init(wasmUrl).then(() => {
  console.log("init");
});


SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded] = useFonts({
    Roboto_100Thin,
    Roboto_300Light,
    Roboto_400Regular,
    Roboto_500Medium,
  });
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync().then(() => setIsReady(true));
    }
  }, [fontsLoaded]);

  if (!isReady) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <Main />
      </PaperProvider>
    </SafeAreaProvider>
  );
}