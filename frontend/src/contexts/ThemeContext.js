import React, { createContext, useContext, useState, useEffect } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const CustomThemeProvider = ({ children }) => {
  // Get theme from localStorage or default to 'dark'
  const [mode, setMode] = useState(() => {
    const savedMode = localStorage.getItem('themeMode');
    return savedMode || 'dark';
  });

  // Save theme to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('themeMode', mode);
  }, [mode]);

  const toggleColorMode = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const theme = createTheme({
    palette: {
      mode,
      ...(mode === 'light'
        ? {
            // Light mode colors
            primary: {
              main: '#667eea',
              light: '#8a9ff5',
              dark: '#4c63d2',
            },
            secondary: {
              main: '#764ba2',
              light: '#9c7bc7',
              dark: '#5a3a7e',
            },
            background: {
              default: '#f5f5f5',
              paper: '#ffffff',
            },
            text: {
              primary: '#333333',
              secondary: '#666666',
            },
          }
        : {
            // Dark mode colors
            primary: {
              main: '#667eea',
              light: '#8a9ff5',
              dark: '#4c63d2',
            },
            secondary: {
              main: '#764ba2',
              light: '#9c7bc7',
              dark: '#5a3a7e',
            },
            background: {
              default: '#0a0a0a',
              paper: '#1a1a1a',
            },
            text: {
              primary: '#ffffff',
              secondary: '#b3b3b3',
            },
          }),
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontWeight: 700,
        letterSpacing: '-0.01562em',
      },
      h2: {
        fontWeight: 600,
        letterSpacing: '-0.00833em',
      },
      h3: {
        fontWeight: 600,
        letterSpacing: '0em',
      },
      h4: {
        fontWeight: 600,
        letterSpacing: '0.00735em',
      },
      h5: {
        fontWeight: 600,
        letterSpacing: '0em',
      },
      h6: {
        fontWeight: 600,
        letterSpacing: '0.0075em',
      },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: 12,
            fontWeight: 600,
            padding: '12px 24px',
          },
          contained: {
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
            '&:hover': {
              boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
              transform: 'translateY(-1px)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            boxShadow: mode === 'dark' 
              ? '0 8px 32px rgba(0, 0, 0, 0.3)' 
              : '0 8px 32px rgba(0, 0, 0, 0.1)',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            backgroundImage: 'none',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 12,
            },
          },
        },
      },
    },
  });

  const contextValue = {
    mode,
    toggleColorMode,
    theme,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};
