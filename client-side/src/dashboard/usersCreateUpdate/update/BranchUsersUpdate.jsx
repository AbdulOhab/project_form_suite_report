import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box, Paper, TextField, Button, Snackbar, Alert, Chip } from "@mui/material";
import BASE_URL from "../../../auth/dbUrl";

function BranchUsersUpdate() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [userId, setUserId] = useState("");
  const [userName, setUserName] = useState("");
  const [branchCode, setBranchCode] = useState("");
  const [zonalCode, setZonalCode] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  useEffect(() => {
    fetch(`${BASE_URL}/get-branch-users/${id}`, {
      method: "POST",
      headers: { Authorization: "Bearer " + window.localStorage.getItem("gsmToken") },
    })
      .then((res) => res.json())
      .then((res) => {
        setUserId(res?.userId);
        setUserName(res?.userName);
        setBranchCode(res?.branchCode);
        setZonalCode(res?.zonalCode);
      });
  }, [id]);

  function updateHandler(e) {
    e.preventDefault();
    fetch(`${BASE_URL}/update-branch-users/${id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + window.localStorage.getItem("gsmToken"),
      },
      body: JSON.stringify({ userId, userName, branchCode, zonalCode }),
    })
      .then(async (res) => ({ status: res.status, data: await res.json() }))
      .then((res) => {
        if (res.status === 200) {
          setSnackbar({ open: true, message: typeof res.data === "string" ? res.data : "Updated successfully", severity: "success" });
          setTimeout(() => navigate("/dashboard/users-list"), 1200);
        } else {
          setSnackbar({ open: true, message: typeof res.data === "string" ? res.data : "Update failed", severity: "error" });
        }
      });
  }

  return (
    <Paper elevation={0} sx={{ borderRadius: 0, minHeight: "80vh" }}>
      <Box sx={{ display: { xs: "block", lg: "none" }, my: 3, textAlign: "center" }}>
        <Chip label="ইউজার আপডেট" color="primary" sx={{ fontWeight: "bold", fontSize: "1.1rem", px: 2, py: 2.5 }} />
      </Box>

      <Box sx={{ px: 2, my: 3, maxWidth: 500, mx: "auto" }}>
        <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
          <Chip label="Update Branch" color="info" sx={{ fontWeight: "bold", fontSize: "1rem" }} />
        </Box>

        <Paper variant="outlined" sx={{ p: 3 }}>
          <form onSubmit={updateHandler}>
            <TextField fullWidth type="text" inputMode="numeric" name="userId" label="User ID"
              required value={userId} onChange={(e) => setUserId(e.target.value)} size="small" sx={{ mb: 2 }} />
            <TextField fullWidth type="text" name="userName" label="User Name"
              required value={userName} onChange={(e) => setUserName(e.target.value)} size="small" sx={{ mb: 2 }} />
            <TextField fullWidth type="text" inputMode="numeric" name="branchCode" label="Branch Code"
              required value={branchCode} onChange={(e) => setBranchCode(e.target.value)} size="small" sx={{ mb: 2 }} />
            <TextField fullWidth type="text" inputMode="numeric" name="zonalCode" label="Zonal Code"
              required value={zonalCode} onChange={(e) => setZonalCode(e.target.value)} size="small" sx={{ mb: 2 }} />
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
              <Button type="submit" variant="contained">Update</Button>
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

export default BranchUsersUpdate;
