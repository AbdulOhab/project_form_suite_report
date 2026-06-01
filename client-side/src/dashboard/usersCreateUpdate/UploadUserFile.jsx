import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  Button,
  Snackbar,
  Alert,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import BASE_URL from "../../auth/dbUrl";

const UploadUserFile = () => {
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const csvfileHandler = async (e) => {
    e.preventDefault();
    const fileInput = e.target.querySelector('input[type="file"]');
    const file = fileInput?.files[0];

    if (!file) {
      console.error("No file selected.");
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
          Accept: "application/json",
        },
        body: formData,
      });

      const data = await response.json();

      if (response.status === 200) {
        setSnackbar({
          open: true,
          message: "Uploaded successfully",
          severity: "success",
        });
        setTimeout(() => navigate("/dashboard"), 1200);
      } else {
        setSnackbar({
          open: true,
          message: "Failed to upload",
          severity: "error",
        });
        console.error(`Error: ${response.status}`, data);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setIsUploading(false);
      setTimeout(() => {
        setIsUploading(false);
      }, 5000);
    }
  };

  return (
    <Box sx={{ maxWidth: 500, mx: "auto", my: 5 }}>
      <Paper elevation={3} sx={{ borderRadius: 2, overflow: "hidden" }}>
        <Box sx={{ bgcolor: "#2e7d32", p: 2 }}>
          <Typography
            variant="h5"
            sx={{ textAlign: "center", color: "#fff", fontWeight: "bold" }}
          >
            Upload Your CSV File
          </Typography>
        </Box>
        <Box sx={{ p: 3 }}>
          <form onSubmit={csvfileHandler}>
            <Button
              component="label"
              variant="outlined"
              startIcon={<UploadFileIcon />}
              fullWidth
              sx={{ mb: 3 }}
            >
              Choose CSV File
              <input type="file" id="file" name="file" hidden />
            </Button>
            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={isUploading}
              >
                {isUploading ? "Uploading..." : "Upload"}
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
