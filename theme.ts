// theme.ts
import {
    MD3LightTheme as DefaultTheme,
    type MD3Theme,
  } from 'react-native-paper';
  
  export const theme: MD3Theme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: '#1976d2',
      secondary: '#dc004e',
    },
    fonts: {
      // mantieni tutte le varianti che non tocchi
      ...DefaultTheme.fonts,
  
      // per ogni variante che vuoi personalizzare:
      displayLarge: {
        // eredito dimensioni, interlinea, spaziatura
        ...DefaultTheme.fonts.displayLarge,
        fontFamily: 'Roboto_400Regular',
        fontWeight: '400',
      },
      headlineMedium: {
        ...DefaultTheme.fonts.headlineMedium,
        fontFamily: 'Roboto_500Medium',
        fontWeight: '500',
      },
      bodyMedium: {
        ...DefaultTheme.fonts.bodyMedium,
        fontFamily: 'Roboto_400Regular',
        fontWeight: '400',
      },
      labelLarge: {
        ...DefaultTheme.fonts.labelLarge,
        fontFamily: 'Roboto_500Medium',
        fontWeight: '500',
      },
      // aggiungi altre varianti se serve...
    },
  };
  