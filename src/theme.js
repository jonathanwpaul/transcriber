import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#FFFF00',
      light: '#FFFF55',
      dark: '#FFFF55',
    },
    secondary: {
      main: '#00FFFF',
      light: '#55FFFF',
      dark: '#00CCCC',
    },
    error: {
      main: '#FF0000',
      light: '#FF5555',
      dark: '#CC0000',
    },
    warning: {
      main: '#FFA500',
      light: '#FFB355',
      dark: '#CC8000',
    },
    info: {
      main: '#2196F3',
      light: '#64B5F6',
      dark: '#1976D2',
    },
    success: {
      main: '#4CAF50',
      light: '#81C784',
      dark: '#388E80',
    },
    background: {
      default: '#000000',
      paper: '#121212',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#EEEEEE',
      disabled: '#AAAAAA',
    },
    divider: '#333333',
    action: {
      active: '#FFFFFF',
      hover: '#AAAAAA',
      selected: '#AAAAAA',
      disabled: '#AAAAAA',
      disabledBackground: '#222222',
    },
    grey: {
      50: '#FAFAFA',
      100: '#EEEEEE',
      200: '#DDDDDD',
      300: '#CCCCCC',
      400: '#BBBBBB',
      500: '#AAAAAA',
      600: '#999999',
      700: '#888888',
      800: '#777777',
      900: '#666666',
    },
  },
  typography: {
    fontFamily: 'Metrophobic, sans-serif',
    h1: {
      fontWeight: 700,
    },
    button: {
      textTransform: 'uppercase',
    },
  },
  spacing: 8,
  shape: {
    borderRadius: 4,
  },
  transitions: {
    duration: {
      standard: 300,
    },
  },
})
