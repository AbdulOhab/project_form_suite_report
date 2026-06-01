import React from "react";
import { Box, Typography } from "@mui/material";
import SearchOffIcon from "@mui/icons-material/SearchOff";

const NodataFound = ({ message }) => {
  return (
    <Box
      sx={{
        my: 3,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <SearchOffIcon sx={{ fontSize: 60, color: "error.main", mb: 1 }} />
      <Typography
        variant="h5"
        sx={{
          fontWeight: "bold",
          color: "error.main",
          textAlign: "center",
        }}
      >
        {message}
      </Typography>
    </Box>
  );
};

export default NodataFound;
