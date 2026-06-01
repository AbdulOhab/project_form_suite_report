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

function UpdateThanaPassword() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [password1, setPassword1] = useState("");
  const [password2, setPassword2] = useState("");

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // update handler function
  function updateHandler(e) {
    e.preventDefault();
    fetch(`${BASE_URL}/update-thana-password/${id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + window.localStorage.getItem("gsmToken"),
      },
      body: JSON.stringify({
        password1: password1,
        password2: password2,
      }),
    })
      .then(async (res) => {
        let data = await res.json();
        return {
          status: res.status,
          data,
        };
      })
      .then((res) => {
        if (res.status === 200) {
          setSnackbar({
            open: true,
            message: "Password updated Successfully",
            severity: "success",
          });
          setTimeout(() => navigate("/dashboard"), 1500);
        } else {
          setSnackbar({
            open: true,
            message: "Password does not match!",
            severity: "error",
          });
        }
      });
  }

  return (
    <Box sx={{ maxWidth: 500, mx: "auto", my: 5 }}>
      <Paper elevation={3} sx={{ borderRadius: 2, overflow: "hidden" }}>
        <Box sx={{ bgcolor: "#2e7d32", p: 2 }}>
          <Typography
            variant="h5"
            sx={{ textAlign: "center", color: "#fff", fontWeight: "bold" }}
          >
            Update Thana Password
          </Typography>
        </Box>
        <Box sx={{ p: 3, bgcolor: "grey.50" }}>
          <form onSubmit={updateHandler}>
            <TextField
              fullWidth
              type="password"
              name="password1"
              label="New Password"
              placeholder="New Password"
              required
              value={password1}
              onChange={(e) => setPassword1(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              type="password"
              name="password2"
              label="Confirm New Password"
              placeholder="New Password"
              required
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
              <Button type="submit" variant="contained" color="primary">
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
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default UpdateThanaPassword;
