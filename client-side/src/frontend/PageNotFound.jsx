import React from "react";
import { Link } from "react-router-dom";
import { Container, Paper, Typography, Button, Box } from "@mui/material";
import SentimentDissatisfiedIcon from "@mui/icons-material/SentimentDissatisfied";

const PageNotFound = () => {
  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          py: 5,
        }}
      >
        <Paper elevation={3} sx={{ p: 5, textAlign: "center" }}>
          <SentimentDissatisfiedIcon sx={{ fontSize: 120, color: "text.secondary", mb: 2 }} />
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            404 - Page Not Found
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            The page you are looking for does not exist.
          </Typography>
          <Button variant="contained" component={Link} to="/" size="large">
            Return Home Page
          </Button>
        </Paper>
      </Box>
    </Container>
  );
};

export default PageNotFound;
