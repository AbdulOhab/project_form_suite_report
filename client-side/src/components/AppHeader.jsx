import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  Box,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LogoutIcon from "@mui/icons-material/Logout";

const roleLabels = {
  admin: "Admin",
  zonal: "Zonal",
  branch: "Branch",
  thana: "Thana",
};

const AppHeader = ({ onMenuToggle }) => {
  const { logout, userInfo } = useContext(AuthContext);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [anchorEl, setAnchorEl] = useState(null);

  const role = userInfo?.userRole || "thana";
  const userName = userInfo?.userName || "User";

  const handleLogout = () => {
    setAnchorEl(null);
    logout();
    navigate("/login");
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        bgcolor: "primary.main",
        zIndex: (t) => t.zIndex.drawer + 1,
        borderRadius: 0,
      }}
    >
      <Toolbar variant="dense" sx={{ gap: 1, minHeight: 44 }}>
        {isMobile && (
          <IconButton
            color="inherit"
            edge="start"
            onClick={onMenuToggle}
            sx={{ mr: 1 }}
          >
            <MenuIcon />
          </IconButton>
        )}

        <Box
          sx={{
            bgcolor: "rgba(255,255,255,0.2)",
            color: "#fff",
            fontWeight: 600,
            px: 1.5,
            py: 0.5,
            fontSize: "0.8125rem",
            lineHeight: 1.5,
          }}
        >
          {roleLabels[role]}
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        <Box
          onClick={(e) => setAnchorEl(e.currentTarget)}
          sx={{ display: "flex", alignItems: "center", cursor: "pointer", gap: 0.25 }}
        >
          <IconButton color="inherit">
            <AccountCircleIcon />
          </IconButton>
          {!isMobile && (
            <Typography variant="body2" sx={{ color: "#fff", fontWeight: 500 }}>
              {userName}
            </Typography>
          )}
        </Box>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        >
          <MenuItem disabled>
            <Typography variant="body2">{userName}</Typography>
          </MenuItem>
          <MenuItem onClick={handleLogout}>
            <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
            Logout
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default AppHeader;
