// src/theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      light: '#4da6ff', 
      main: '#0073e6',  
      dark: '#0059b3',  
      contrastText: '#fff',
    },
    secondary: {
      light: '#b3daff', 
      main: '#80c0ff',  
      dark: '#1a8cff',  
      contrastText: '#000',
    },
    background: {
      default: '#f7f7f7', 
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
      fontWeight: 600,
    },
    h2: {
      fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
      fontWeight: 600,
    },
    h3: {
      fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
      fontWeight: 600,
    },
    h4: {
      fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
      fontWeight: 600,
    },
    h5: {
      fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
      fontWeight: 600,
    },
    h6: {
      fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
      fontWeight: 600,
    },
    button: {
      textTransform: 'none', 
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '6px',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
        },
      },
    },
  },
});

export default theme;