import React from "react";
import { CircularProgress, Box } from "@mui/material";

const Loader = () => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        my: 5,
      }}
    >
      <CircularProgress size={60} sx={{ color: "#2e7d32" }} />
    </Box>
  );
};

export default Loader;
