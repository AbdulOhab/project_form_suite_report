import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Snackbar,
  Alert,
  Tabs,
  Tab,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import BASE_URL from "../../../auth/dbUrl";

const TABS_CONFIG = [
  {
    key: "admin",
    label: "Admin",
    endpoint: "/create-admin-users",
    header: "Create Admin",
    fields: [
      { name: "userId", label: "User ID", type: "text", inputMode: "numeric" },
      { name: "password", label: "Password", type: "password" },
      { name: "userName", label: "User Name", type: "text" },
      { name: "email", label: "Email", type: "email" },
    ],
  },
  {
    key: "zonal",
    label: "Zonal",
    endpoint: "/create-zonal-users",
    header: "Create Zonal",
    fields: [
      { name: "userId", label: "User ID", type: "text", inputMode: "numeric" },
      { name: "password", label: "Password", type: "password" },
      { name: "userName", label: "User Name", type: "text" },
      { name: "zonalCode", label: "Zonal Code", type: "text", inputMode: "numeric" },
    ],
  },
  {
    key: "branch",
    label: "Branch",
    endpoint: "/create-branch-users",
    header: "Create Branch",
    fields: [
      { name: "userId", label: "User ID", type: "text", inputMode: "numeric" },
      { name: "password", label: "Password", type: "password" },
      { name: "userName", label: "User Name", type: "text" },
      { name: "branchCode", label: "Branch Code", type: "text", inputMode: "numeric" },
      { name: "zonalCode", label: "Zonal Code", type: "text", inputMode: "numeric" },
    ],
  },
  {
    key: "thana",
    label: "Thana",
    endpoint: "/create-thana-users",
    header: "Create Thana",
    fields: [
      { name: "userId", label: "User ID", type: "text", inputMode: "numeric" },
      { name: "password", label: "Password", type: "password" },
      { name: "userName", label: "User Name", type: "text" },
      { name: "thanaCode", label: "Thana Code", type: "text", inputMode: "numeric" },
      { name: "branchCode", label: "Branch Code", type: "text", inputMode: "numeric" },
      { name: "zonalCode", label: "Zonal Code", type: "text", inputMode: "numeric" },
    ],
  },
];

function UnifiedCreateUser() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const config = TABS_CONFIG[activeTab];

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  function submitHandler(e) {
    e.preventDefault();
    const formData = new FormData(e.target);

    fetch(`${BASE_URL}${config.endpoint}`, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + window.localStorage.getItem("gsmToken"),
      },
      body: formData,
    })
      .then(async (res) => {
        let data = await res.json();
        return { status: res.status, data };
      })
      .then((res) => {
        if (res.status === 200) {
          setSnackbar({
            open: true,
            message: typeof res.data === "string" ? res.data : "Created successfully",
            severity: "success",
          });
          e.target.reset();
          setTimeout(() => navigate("/dashboard/users-list"), 1200);
        } else {
          setSnackbar({
            open: true,
            message: typeof res.data === "string" ? res.data : "Creation failed",
            severity: "error",
          });
        }
      })
      .catch((err) => {
        setSnackbar({
          open: true,
          message: err.message,
          severity: "error",
        });
      });
  }

  return (
    <Box sx={{ maxWidth: 500, mx: "auto", my: 3 }}>
      <Paper elevation={3} sx={{ borderRadius: 2, overflow: "hidden" }}>
        <Box sx={{ bgcolor: "primary.main", px: 2, pt: 1 }}>
          <Tabs
            value={activeTab}
            onChange={(_, val) => setActiveTab(val)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              "& .MuiTab-root": { color: "rgba(255,255,255,0.5)", minHeight: 36, fontWeight: 400 },
              "& .Mui-selected": { color: "#fff !important", fontWeight: 700, bgcolor: "rgba(255,255,255,0.15)", borderRadius: 1 },
              "& .MuiTabs-indicator": { bgcolor: "#fff", height: 3 },
            }}
          >
            {TABS_CONFIG.map((tab) => (
              <Tab key={tab.key} label={tab.label} sx={{ px: 3 }} />
            ))}
          </Tabs>
        </Box>

        <Box sx={{ p: 3 }}>
          <Typography
            variant="h6"
            sx={{ textAlign: "center", fontWeight: "bold", color: "primary.main", mb: 2 }}
          >
            {config.header}
          </Typography>

          <form onSubmit={submitHandler}>
            {config.fields.map((field) => (
              <TextField
                key={field.name}
                fullWidth
                type={field.name === "password" && showPassword ? "text" : field.type}
                inputMode={field.inputMode}
                name={field.name}
                label={field.label}
                placeholder={field.label}
                required
                size="small"
                sx={{ mb: 2 }}
                InputProps={
                  field.name === "password"
                    ? {
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowPassword((p) => !p)} edge="end" size="small">
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }
                    : undefined
                }
              />
            ))}
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
              <Button type="submit" variant="contained">
                Create {config.label}
              </Button>
            </Box>
          </form>
        </Box>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default UnifiedCreateUser;
