import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Snackbar,
  Alert,
  Divider,
  Stack,
} from "@mui/material";
import BASE_URL from "../../../auth/dbUrl";

function AdminUsersUpdate() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [userId, setUserId] = useState("");
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  useEffect(() => {
    async function getAdminUser() {
      await fetch(`${BASE_URL}/get-admin-users/${id}`, {
        method: "POST",
        headers: {
          Authorization: "Bearer " + window.localStorage.getItem("gsmToken"),
        },
      })
        .then((res) => res.json())
        .then((res) => {
          setUserId(res?.userId);
          setUserName(res?.userName);
          setEmail(res?.email || "");
        });
    }
    getAdminUser();
  }, [id]);

  function updateHandler(e) {
    e.preventDefault();
    fetch(`${BASE_URL}/update-admin-users/${id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + window.localStorage.getItem("gsmToken"),
      },
      body: JSON.stringify({ userId, userName, email }),
    })
      .then(async (res) => {
        let data = await res.json();
        return { status: res.status, data };
      })
      .then((res) => {
        if (res.status === 200) {
          setSnackbar({
            open: true,
            message: typeof res.data === "string" ? res.data : "Updated successfully",
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
            Update Admin
          </Typography>
        </Box>
        <Box sx={{ p: 3 }}>
          <form onSubmit={updateHandler}>
            <Stack spacing={2} divider={<Divider />}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Typography sx={{ minWidth: 120 }}>User ID</Typography>
                <TextField
                  fullWidth
                  type="text"
                  inputMode="numeric"
                  name="userId"
                  placeholder="User ID"
                  required
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  size="small"
                />
              </Stack>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Typography sx={{ minWidth: 120 }}>User Name</Typography>
                <TextField
                  fullWidth
                  type="text"
                  name="userName"
                  placeholder="User Name"
                  required
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  size="small"
                />
              </Stack>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Typography sx={{ minWidth: 120 }}>Email</Typography>
                <TextField
                  fullWidth
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  size="small"
                />
              </Stack>
            </Stack>
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
              <Button type="submit" variant="contained">
                Update
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

export default AdminUsersUpdate;
