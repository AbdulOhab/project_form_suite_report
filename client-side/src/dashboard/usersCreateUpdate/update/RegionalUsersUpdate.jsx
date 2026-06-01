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
} from "@mui/material";
import BASE_URL from "../../../auth/dbUrl";

function RegionalUsersUpdate() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [userId, setUserId] = useState("");
  const [userName, setUserName] = useState("");
  const [zonalCode, setZonalCode] = useState("");

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // get thana data from database
  useEffect(() => {
    async function getThanaUser() {
      await fetch(`${BASE_URL}/get-zonal-users/${id}`, {
        method: "GET",
        headers: {
          Authorization: "Bearer " + window.localStorage.getItem("gsmToken"),
        },
      })
        .then((res) => res.json())
        .then((res) => {
          setUserId(res?.userId);
          setUserName(res?.userName);
          setZonalCode(res?.zonalCode);
        })
        .catch((err) => {
          setSnackbar({
            open: true,
            message: err.message,
            severity: "error",
          });
        });
    }
    getThanaUser();
  }, [id]);

  // update handler function
  function updateHandler(e) {
    e.preventDefault();
    fetch(`${BASE_URL}/update-zonal-users/${id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + window.localStorage.getItem("gsmToken"),
      },
      body: JSON.stringify({
        userId: userId,
        userName: userName,
        zonalCode: zonalCode,
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
            message: typeof res.data === "string" ? res.data : "Updated successfully",
            severity: "success",
          });
          setTimeout(() => navigate("/dashboard/zonal-users"), 1200);
        } else {
          setSnackbar({
            open: true,
            message: typeof res.data === "string" ? res.data : "Update failed",
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
    <Box sx={{ maxWidth: 500, mx: "auto", my: 5 }}>
      <Paper elevation={3} sx={{ borderRadius: 2, overflow: "hidden" }}>
        <Box sx={{ bgcolor: "#2e7d32", p: 2 }}>
          <Typography
            variant="h5"
            sx={{ textAlign: "center", color: "#fff", fontWeight: "bold" }}
          >
            অঞ্চলের তথ্য হালনাগাদ করুন
          </Typography>
        </Box>
        <Box sx={{ p: 3 }}>
          <form onSubmit={updateHandler}>
            <TextField
              fullWidth
              type="number"
              name="userId"
              label="User ID"
              placeholder="Enter UserId"
              required
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              type="text"
              name="userName"
              label="User Name"
              placeholder="User Name"
              required
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              type="number"
              name="zonalCode"
              label="Zonal Code"
              placeholder="Zonal Code"
              required
              value={zonalCode}
              onChange={(e) => setZonalCode(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
              <Button type="submit" variant="contained" color="primary">
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

export default RegionalUsersUpdate;
