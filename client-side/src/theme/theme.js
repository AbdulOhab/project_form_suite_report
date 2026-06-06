import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#2e7d32",
      light: "#4caf50",
      dark: "#1b5e20",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#f5f5f5",
      light: "#ffffff",
      dark: "#e0e0e0",
      contrastText: "#333333",
    },
    background: {
      default: "#f5f5f5",
      paper: "#ffffff",
    },
    error: {
      main: "#d32f2f",
    },
    success: {
      main: "#2e7d32",
    },
    text: {
      primary: "#212121",
      secondary: "#757575",
    },
  },
  typography: {
    fontFamily: '"SolaimanLipi", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontSize: "2.5rem", fontWeight: 700 },
    h2: { fontSize: "2rem", fontWeight: 700 },
    h3: { fontSize: "1.75rem", fontWeight: 600 },
    h4: { fontSize: "1.5rem", fontWeight: 600 },
    h5: { fontSize: "1.25rem", fontWeight: 500 },
    h6: { fontSize: "1rem", fontWeight: 500 },
    body1: { fontSize: "0.95rem" },
    body2: { fontSize: "0.85rem" },
    button: { textTransform: "none" },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: "8px 20px",
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: "outlined",
        size: "small",
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiTable: {
      defaultProps: {
        size: "small",
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: "1px solid #e0e0e0",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          borderRadius: "0 !important",
          boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
        },
      },
    },
  },
});

export default theme;
