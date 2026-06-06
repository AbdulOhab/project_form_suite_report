import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Snackbar,
  Alert,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DownloadIcon from "@mui/icons-material/Download";
import BASE_URL from "../../auth/dbUrl";

const UploadUserFile = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleDownloadUsers = () => {
    const token = window.localStorage.getItem("gsmToken");
    fetch(`${BASE_URL}/download-users-csv`, {
      headers: { Authorization: "Bearer " + token },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Download failed");
        return res.blob();
      })
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "users_list.csv";
        a.click();
        window.URL.revokeObjectURL(url);
      })
      .catch(() => {
        setSnackbar({ open: true, message: "Failed to download users", severity: "error" });
      });
  };

  const csvfileHandler = async (e) => {
    e.preventDefault();
    const fileInput = e.target.querySelector('input[type="file"]');
    const file = fileInput?.files[0];

    if (!file) {
      setSnackbar({ open: true, message: "Please select a file first", severity: "warning" });
      return;
    }

    const formData = new FormData();
    formData.append("csvFile", file);

    setIsUploading(true);

    try {
      const response = await fetch(`${BASE_URL}/upload-user-file`, {
        method: "POST",
        headers: {
          Authorization: "Bearer " + window.localStorage.getItem("gsmToken"),
        },
        body: formData,
      });

      const data = await response.json();

      if (response.status === 200) {
        setSnackbar({
          open: true,
          message: typeof data === "string" ? data : "Uploaded successfully",
          severity: "success",
        });
        e.target.reset();
      } else {
        setSnackbar({
          open: true,
          message: typeof data === "string" ? data : data?.error || "Failed to upload",
          severity: "error",
        });
      }
    } catch (error) {
      setSnackbar({ open: true, message: "Network error", severity: "error" });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 500, mx: "auto", my: 3 }}>
      <Paper elevation={3} sx={{ borderRadius: 2, overflow: "hidden" }}>
        <Box sx={{ bgcolor: "primary.main", p: 2 }}>
          <Typography
            variant="h5"
            sx={{ textAlign: "center", color: "#fff", fontWeight: "bold" }}
          >
            Upload Users from CSV
          </Typography>
        </Box>
        <Box sx={{ p: 3 }}>
          <Button
            variant="outlined"
            color="success"
            startIcon={<DownloadIcon />}
            fullWidth
            onClick={handleDownloadUsers}
            sx={{ mb: 3 }}
          >
            Download Users List
          </Button>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            1. Download users list → 2. Edit CSV (fill password column to update) → 3. Upload below
          </Typography>

          <form onSubmit={csvfileHandler}>
            <Button
              component="label"
              variant="outlined"
              startIcon={<UploadFileIcon />}
              fullWidth
              sx={{ mb: 3 }}
            >
              Choose CSV File
              <input type="file" accept=".csv" name="csvFile" hidden />
            </Button>

            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Button
                type="submit"
                variant="contained"
                disabled={isUploading}
              >
                {isUploading ? "Uploading..." : "Upload & Update"}
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
};

export default UploadUserFile;
