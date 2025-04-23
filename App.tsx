// App.tsx
import React, { useCallback, useEffect, useState } from 'react';
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

// Evita che lo splash scompaia automaticamente
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded] = useFonts({
    Roboto_100Thin,
    Roboto_300Light,
    Roboto_400Regular,
    Roboto_500Medium,
  });
  const [isReady, setIsReady] = useState(false);

  // Quando i font sono pronti, nascondi lo splash
  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync().then(() => setIsReady(true));
    }
  }, [fontsLoaded]);

  // Finché non siamo pronti non renderizzo nulla (rimane lo splash)
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
