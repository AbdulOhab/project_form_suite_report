import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box, Paper, TextField, Button, Snackbar, Alert, Chip } from "@mui/material";
import BASE_URL from "../../../auth/dbUrl";

function UpdateBranchPassword() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [password1, setPassword1] = useState("");
  const [password2, setPassword2] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  function updateHandler(e) {
    e.preventDefault();

    if (password1 !== password2) {
      setSnackbar({ open: true, message: "Passwords do not match", severity: "error" });
      return;
    }

    fetch(`${BASE_URL}/update-branch-password/${id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + window.localStorage.getItem("gsmToken"),
      },
      body: JSON.stringify({ password1, password2 }),
    })
      .then(async (res) => ({ status: res.status, data: await res.json() }))
      .then((res) => {
        if (res.status === 200) {
          setSnackbar({ open: true, message: typeof res.data === "string" ? res.data : "Password updated successfully", severity: "success" });
          setTimeout(() => navigate("/dashboard/users-list"), 1200);
        } else {
          setSnackbar({ open: true, message: typeof res.data === "string" ? res.data : "Update failed", severity: "error" });
        }
      });
  }

  return (
    <Paper elevation={0} sx={{ borderRadius: 0, minHeight: "80vh" }}>
      <Box sx={{ display: { xs: "block", lg: "none" }, my: 3, textAlign: "center" }}>
        <Chip label="পাসওয়ার্ড রিসেট" color="primary" sx={{ fontWeight: "bold", fontSize: "1.1rem", px: 2, py: 2.5 }} />
      </Box>

      <Box sx={{ px: 2, my: 3, maxWidth: 500, mx: "auto" }}>
        <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
          <Chip label="Reset Branch Password" color="info" sx={{ fontWeight: "bold", fontSize: "1rem" }} />
        </Box>

        <Paper variant="outlined" sx={{ p: 3 }}>
          <form onSubmit={updateHandler}>
            <TextField fullWidth type="password" name="password1" label="New Password"
              placeholder="Enter new password" required size="small" value={password1}
              onChange={(e) => setPassword1(e.target.value)} sx={{ mb: 2 }} />
            <TextField fullWidth type="password" name="password2" label="Confirm Password"
              placeholder="Confirm new password" required size="small" value={password2}
              onChange={(e) => setPassword2(e.target.value)} sx={{ mb: 2 }} />
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
              <Button type="submit" variant="contained">Update Password</Button>
            </Box>
          </form>
        </Paper>
      </Box>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
      </Snackbar>
    </Paper>
  );
}

export default UpdateBranchPassword;
