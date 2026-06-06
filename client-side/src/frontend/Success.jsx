import React from "react";
import { Container, Paper, Typography, Box } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

function Success() {
  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 8, textAlign: "center" }}>
        <Box sx={{ mb: 3 }}>
          <CheckCircleOutlineIcon sx={{ fontSize: 120, color: "success.main" }} />
        </Box>
        <Typography variant="h3" color="success.main" fontWeight="bold" gutterBottom>
          Success
        </Typography>
        <Typography variant="body1" sx={{ mt: 2, p: 1.5, bgcolor: "success.light", borderRadius: 1, color: "success.contrastText" }}>
          Your form has been submitted successfully
        </Typography>
      </Paper>
    </Container>
  );
}

export default Success;
