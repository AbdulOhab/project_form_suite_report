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

function BranchUsersUpdate() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [userId, setUserId] = useState("");
  const [userName, setUserName] = useState("");
  const [branchCode, setBranchCode] = useState("");
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
      await fetch(`${BASE_URL}/get-branch-users/${id}`, {
        method: "POST",
        headers: {
          Authorization: "Bearer " + window.localStorage.getItem("gsmToken"),
        },
      })
        .then((res) => res.json())
        .then((res) => {
          setUserId(res?.userId);
          setUserName(res?.userName);
          setBranchCode(res?.branchCode);
          setZonalCode(res?.zonalCode);
        });
    }
    getThanaUser();
  }, [id]);

  // update handler function
  function updateHandler(e) {
    e.preventDefault();
    fetch(`${BASE_URL}/update-branch-users/${id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + window.localStorage.getItem("gsmToken"),
      },
      body: JSON.stringify({
        userId: userId,
        userName: userName,
        branchCode: branchCode,
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
          setTimeout(() => navigate("/dashboard/branch-users"), 1200);
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
    <Box sx={{ maxWidth: 550, mx: "auto", my: 5 }}>
      <Paper elevation={3} sx={{ borderRadius: 2, overflow: "hidden" }}>
        <Box sx={{ bgcolor: "#2e7d32", p: 2 }}>
          <Typography
            variant="h5"
            sx={{ textAlign: "center", color: "#fff", fontWeight: "bold" }}
          >
            ব্রাঞ্চ হালনাগাদ করুন
          </Typography>
        </Box>
        <Box sx={{ p: 3 }}>
          <form onSubmit={updateHandler}>
            <Stack spacing={2} divider={<Divider />}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Typography sx={{ minWidth: 120 }}>User ID</Typography>
                <TextField
                  fullWidth
                  type="number"
                  name="userId"
                  placeholder="Enter User ID"
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
                <Typography sx={{ minWidth: 120 }}>Branch Code</Typography>
                <TextField
                  fullWidth
                  type="number"
                  name="branchCode"
                  placeholder="Branch Code"
                  required
                  value={branchCode}
                  onChange={(e) => setBranchCode(e.target.value)}
                  size="small"
                />
              </Stack>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Typography sx={{ minWidth: 120 }}>Zonal Code</Typography>
                <TextField
                  fullWidth
                  type="number"
                  name="zonalCode"
                  placeholder="Zonal Code"
                  required
                  value={zonalCode}
                  onChange={(e) => setZonalCode(e.target.value)}
                  size="small"
                />
              </Stack>
            </Stack>
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
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

export default BranchUsersUpdate;
