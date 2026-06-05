import React, { useState, useEffect } from "react";
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
  MenuItem,
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
      { name: "zonalCode", label: "Zonal Code", options: "zonals" },
      { name: "branchCode", label: "Branch Code", type: "text", inputMode: "numeric" },
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
      { name: "zonalCode", label: "Zonal Code", options: "zonals" },
      { name: "branchCode", label: "Branch Code", options: "branches" },
      { name: "thanaCode", label: "Thana Code", type: "text", inputMode: "numeric" },
    ],
  },
];

function UnifiedCreateUser() {
  const [activeTab, setActiveTab] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const [zonals, setZonals] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedZonal, setSelectedZonal] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");

  const config = TABS_CONFIG[activeTab];
  const authHeaders = {
    Authorization: "Bearer " + window.localStorage.getItem("gsmToken"),
  };

  // Fetch zonals on mount
  useEffect(() => {
    fetch(`${BASE_URL}/zonal-users`, { headers: authHeaders })
      .then((res) => res.json())
      .then((data) => setZonals(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  // Fetch branches when selectedZonal changes (for Thana tab)
  useEffect(() => {
    if (!selectedZonal) {
      setBranches([]);
      return;
    }
    fetch(`${BASE_URL}/get-branch-users-by-zonal/${selectedZonal}`, { headers: authHeaders })
      .then((res) => res.json())
      .then((data) => setBranches(Array.isArray(data.branch) ? data.branch : []))
      .catch(() => setBranches([]));
  }, [selectedZonal]);

  // Reset dropdown state when switching tabs
  useEffect(() => {
    setSelectedZonal("");
    setSelectedBranch("");
    setBranches([]);
  }, [activeTab]);

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  function submitHandler(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const body = Object.fromEntries(formData.entries());

    fetch(`${BASE_URL}${config.endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders },
      body: JSON.stringify(body),
    })
      .then(async (res) => {
        let data = await res.json();
        return { status: res.status, data };
      })
      .then((res) => {
        const message =
          typeof res.data === "string"
            ? res.data
            : res.data?.error || res.data?.message || "Creation failed";

        if (res.status === 200) {
          setSnackbar({ open: true, message, severity: "success" });
          e.target.reset();
          setSelectedZonal("");
          setSelectedBranch("");
        } else {
          setSnackbar({ open: true, message, severity: "error" });
        }
      })
      .catch((err) => {
        setSnackbar({ open: true, message: err.message, severity: "error" });
      });
  }

  function handleDropdownChange(field, value) {
    if (field.name === "zonalCode") {
      setSelectedZonal(value);
      setSelectedBranch("");
    } else if (field.name === "branchCode") {
      setSelectedBranch(value);
    }
  }

  function getDropdownOptions(field) {
    if (field.options === "zonals") return zonals;
    if (field.options === "branches") return branches;
    return [];
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
            {config.fields.map((field) => {
              const isDropdown = !!field.options;
              const options = getDropdownOptions(field);
              const dropdownValue =
                field.name === "zonalCode"
                  ? selectedZonal
                  : field.name === "branchCode"
                  ? selectedBranch
                  : "";

              if (isDropdown) {
                return (
                  <TextField
                    key={field.name}
                    fullWidth
                    select
                    name={field.name}
                    label={field.label}
                    required
                    size="small"
                    sx={{ mb: 2 }}
                    value={dropdownValue}
                    onChange={(e) => handleDropdownChange(field, e.target.value)}
                    disabled={field.options === "branches" && !selectedZonal}
                  >
                    <MenuItem value="">
                      <em>Select {field.label}</em>
                    </MenuItem>
                    {options.map((opt) => (
                      <MenuItem
                        key={opt._id || opt.zonalCode || opt.branchCode}
                        value={field.options === "zonals" ? String(opt.zonalCode) : String(opt.branchCode)}
                      >
                        {field.options === "zonals"
                          ? `${opt.zonalCode} — ${opt.userName}`
                          : `${opt.branchCode} — ${opt.userName}`}
                      </MenuItem>
                    ))}
                  </TextField>
                );
              }

              return (
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
              );
            })}
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
