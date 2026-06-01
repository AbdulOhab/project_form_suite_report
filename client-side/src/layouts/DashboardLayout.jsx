import { useContext, useState } from "react";
import { Outlet } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { Box, Container, Toolbar, useMediaQuery, useTheme } from "@mui/material";
import AppHeader from "../components/AppHeader";
import AppSidebar from "../components/AppSidebar";

const DRAWER_WIDTH = 260;

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
        <Toolbar />
        <Container maxWidth="xl" sx={{ py: 3 }}>
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
};

export default DashboardLayout;
