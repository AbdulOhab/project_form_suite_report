import { Outlet } from "react-router-dom";
import { Box } from "@mui/material";

const PublicLayout = () => {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #e8f5e9 0%, #ffffff 50%, #e8f5e9 100%)",
      }}
    >
      <Outlet />
    </Box>
  );
};

export default PublicLayout;
