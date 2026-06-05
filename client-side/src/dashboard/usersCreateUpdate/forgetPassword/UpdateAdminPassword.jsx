import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Snackbar,
  Alert,
} from "@mui/material";
import BASE_URL from "../../../auth/dbUrl";

function UpdateAdminPassword() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  function updateHandler(e) {
    e.preventDefault();

    const password1 = e.target.password1.value;
    const password2 = e.target.password2.value;

    if (password1 !== password2) {
      setSnackbar({ open: true, message: "Passwords do not match", severity: "error" });
      return;
    }

    fetch(`${BASE_URL}/update-admin-password/${id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + window.localStorage.getItem("gsmToken"),
      },
      body: JSON.stringify({ password1, password2 }),
    })
      .then(async (res) => {
        let data = await res.json();
        return { status: res.status, data };
      })
      .then((res) => {
        if (res.status === 200) {
          setSnackbar({
            open: true,
            message: typeof res.data === "string" ? res.data : "Password updated successfully",
            severity: "success",
          });
          setTimeout(() => navigate("/dashboard/users-list"), 1200);
        } else {
          setSnackbar({
            open: true,
            message: typeof res.data === "string" ? res.data : "Update failed",
            severity: "error",
          });
        }
      });
  }

  return (
    <Box sx={{ maxWidth: 500, mx: "auto", my: 5 }}>
      <Paper elevation={3} sx={{ borderRadius: 2, overflow: "hidden" }}>
        <Box sx={{ bgcolor: "primary.main", p: 2 }}>
          <Typography
            variant="h5"
            sx={{ textAlign: "center", color: "#fff", fontWeight: "bold" }}
          >
            Reset Admin Password
          </Typography>
        </Box>
        <Box sx={{ p: 3 }}>
          <form onSubmit={updateHandler}>
            <TextField
              fullWidth
              type="password"
              name="password1"
              label="New Password"
              placeholder="Enter new password"
              required
              size="small"
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              type="password"
              name="password2"
              label="Confirm Password"
              placeholder="Confirm new password"
              required
              size="small"
              sx={{ mb: 3 }}
            />
            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Button type="submit" variant="contained">
                Update Password
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

export default UpdateAdminPassword;
