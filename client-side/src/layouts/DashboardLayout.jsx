import { useContext, useState } from "react";
import { Outlet } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { Box, Container, Toolbar, useMediaQuery, useTheme } from "@mui/material";
import AppHeader from "../components/AppHeader";
import AppSidebar from "../components/AppSidebar";

const DRAWER_WIDTH = 240;

const DashboardLayout = () => {
  const { userInfo } = useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const role = userInfo?.userRole || "thana";

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      <AppHeader onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
      <AppSidebar
        role={role}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: isMobile ? "100%" : `calc(100% - ${DRAWER_WIDTH}px)`,
          minHeight: "100vh",
        }}
      >
        <Toolbar variant="dense" />
        <Container maxWidth="xl" sx={{ pt: 3, pb: 6 }}>
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
};

export default DashboardLayout;
