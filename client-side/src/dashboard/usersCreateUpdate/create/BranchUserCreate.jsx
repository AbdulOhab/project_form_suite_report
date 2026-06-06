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
} from "@mui/material";
import BASE_URL from "../../../auth/dbUrl";

function BranchUserCreate() {
  const navigate = useNavigate();
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  function submitHandler(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    fetch(`${BASE_URL}/create-branch-users`, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + window.localStorage.getItem("gsmToken"),
      },
      body: formData,
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
            message: typeof res.data === "string" ? res.data : "Created successfully",
            severity: "success",
          });
          setTimeout(() => navigate("/dashboard/branch-users"), 1200);
        } else {
          setSnackbar({
            open: true,
            message: typeof res.data === "string" ? res.data : "Creation failed",
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
            Create Branch
          </Typography>
        </Box>
        <Box sx={{ p: 3, bgcolor: "grey.50" }}>
          <form onSubmit={submitHandler}>
            <TextField
              fullWidth
              type="number"
              name="userId"
              label="User ID"
              placeholder="Enter User ID"
              required
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              type="password"
              name="password"
              label="Password"
              placeholder="Password"
              required
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              type="text"
              name="userName"
              label="User Name"
              placeholder="User Name"
              required
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              type="number"
              name="branchCode"
              label="Branch Code"
              placeholder="Branch Code"
              required
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              type="number"
              name="zonalCode"
              label="Zonal Code"
              placeholder="Zonal Code"
              required
              sx={{ mb: 2 }}
            />
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
              <Button type="submit" variant="contained" color="primary">
                Create
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

export default BranchUserCreate;
