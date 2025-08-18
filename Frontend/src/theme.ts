import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  colorSchemes: {
    light: {
      palette: {
        primary: {
          main: '#1F7507',
          light: '#79C940',
          dark: '#0F3E00',
          contrastText: '#ffffff'
        },
        secondary: {
          main: '#1C8208',
          light: '#5B9E08',
          dark: '#1C5404',
          contrastText: '#ffffff'
        },
        background: {
          default: '#F4F7FB',
          paper: '#FFFFFF'
        },
        text: {
          primary: '#0F172A',
          secondary: '#8A94A6'
        },
        grey: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827'
        },
        divider: '#E5E9F2'
      }
    },
    dark: {
      palette: {
        primary: {
          main: '#79C940',
          light: '#8DD946',
          dark: '#1F7507',
          contrastText: '#000000'
        },
        secondary: {
          main: '#5B9E08',
          light: '#79C940',
          dark: '#1C8208',
          contrastText: '#000000'
        },
        background: {
          default: '#0F172A',
          paper: '#1E293B'
        },
        text: {
          primary: '#F1F5F9',
          secondary: '#94A3B8'
        },
        grey: {
          50: '#1E293B',
          100: '#334155',
          200: '#475569',
          300: '#64748B',
          400: '#94A3B8',
          500: '#CBD5E1',
          600: '#E2E8F0',
          700: '#F1F5F9',
          800: '#F8FAFC',
          900: '#FFFFFF'
        },
        divider: '#334155'
      }
    }
  },
  typography: {
    fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial, sans-serif',
    fontSize: 14,
    fontWeightLight: 400,
    fontWeightRegular: 500,
    fontWeightMedium: 600,
    fontWeightBold: 700,
    h1: {
      fontSize: '2.125rem',
      fontWeight: 800,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '1.875rem',
      fontWeight: 700,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    }
  },
  shape: {
    borderRadius: 12
  },
  spacing: 8,
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '12px',
          fontWeight: 600,
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '12px',
          }
        }
      }
    }
  }
});

export default theme;