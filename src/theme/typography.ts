// Prison Ready Typography
import { TextStyle } from 'react-native';

type FontWeightLiteral = 'bold' | 'normal';

export const typography: {
  headline: TextStyle & { fontWeight: FontWeightLiteral };
  subhead: TextStyle & { fontWeight: FontWeightLiteral };
  body: TextStyle & { fontWeight: FontWeightLiteral };
  button: TextStyle & { fontWeight: FontWeightLiteral };
  monoLabel: TextStyle & { fontWeight: FontWeightLiteral };
  caption: TextStyle & { fontWeight: FontWeightLiteral };
} = {
  headline: {
    fontSize: 30,
    fontWeight: 'bold',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  subhead: {
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  body: {
    fontSize: 16,
    fontWeight: 'normal',
    letterSpacing: 0.1,
  },
  button: {
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  monoLabel: {
    fontSize: 13,
    fontWeight: 'normal',
    fontFamily: 'monospace',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  caption: {
    fontSize: 13,
    fontWeight: 'normal',
    letterSpacing: 0.5,
    color: '#888888',
  },
};