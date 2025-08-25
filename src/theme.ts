import { createTheme } from '@mui/material/styles';

// App theme colors from the login gradient and style:
// Primary: #b66aed (rgba(182,106,237,1))
// Secondary/Accent: #ffae49 (rgba(255,174,73,1))
// Gradient hover: #ac60e3 (rgba(172,96,227,1)), #f5a43f (rgba(245,164,63,1))

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#b66aed', // Main purple
      light: '#cfa5f2', // Lighter purple
      dark: '#ac60e3',  // Darker purple (from hover)
      contrastText: '#fff',
    },
    secondary: {
      main: '#ffae49', // Main orange
      light: '#ffd59c', // Lighter orange
      dark: '#f5a43f',  // Darker orange (from hover)
      contrastText: '#fff',
    },
    background: {
      default: '#f8f9fa',
      paper: '#fff',
    },
    text: {
      primary: '#2c3e50',
      secondary: '#546e7a',
    },
    success: {
      main: '#2ecc71',
      light: '#4cd787',
      dark: '#1b7943',
      contrastText: '#fff',
    },
    error: {
      main: '#e74c3c',
      light: '#ff7961',
      dark: '#ba000d',
      contrastText: '#fff',
    },
    warning: {
      main: '#ffae49',
      light: '#ffd59c',
      dark: '#f5a43f',
      contrastText: '#fff',
    },
    info: {
      main: '#b66aed',
      light: '#cfa5f2',
      dark: '#ac60e3',
      contrastText: '#fff',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.43,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiTextField: {
      defaultProps: {
        size: 'small',
      },
    },
    MuiFormControl: {
      defaultProps: {
        size: 'small',
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
          padding: '8px 16px',
        },
        contained: {
          boxShadow: 'none',
          background: 'linear-gradient(90deg, #b66aed 0%, #ffae49 100%)',
          color: '#fff',
          '&:hover': {
            background: 'linear-gradient(90deg, #ac60e3 0%, #f5a43f 100%)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          border: '1px solid rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: 'none',
          boxShadow: '4px 0 12px rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#fff',
          color: '#2c3e50',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: '4px 8px',
          '&.Mui-selected': {
            backgroundColor: 'rgba(182, 106, 237, 0.08)',
            '&:hover': {
              backgroundColor: 'rgba(182, 106, 237, 0.12)',
            },
          },
        },
      },
    },
  },
});