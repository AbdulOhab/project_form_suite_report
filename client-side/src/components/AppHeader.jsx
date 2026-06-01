import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Chip,
  Button,
  Menu,
  MenuItem,
  Avatar,
  Box,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";

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
      }}
    >
      <Toolbar sx={{ gap: 1 }}>
        <IconButton
          color="inherit"
          edge="start"
          onClick={onMenuToggle}
          sx={{ mr: 1 }}
        >
          <MenuIcon />
        </IconButton>

        <Chip
          label={roleLabels[role]}
          size="small"
          sx={{
            bgcolor: "rgba(255,255,255,0.2)",
            color: "#fff",
            fontWeight: 600,
          }}
        />

        {!isMobile && (
          <Typography
            variant="body1"
            sx={{ flexGrow: 1, color: "rgba(255,255,255,0.9)", ml: 1 }}
          >
            রিপোর্ট সেন্টারে আপনাকে স্বাগতম
          </Typography>
        )}

        <Box sx={{ flexGrow: isMobile ? 1 : 0 }} />

        {role === "admin" && (
          <Button
            variant="outlined"
            size="small"
            sx={{
              borderColor: "rgba(255,255,255,0.5)",
              color: "#fff",
              "&:hover": { borderColor: "#fff", bgcolor: "rgba(255,255,255,0.1)" },
            }}
            onClick={() => navigate("/dashboard/notice/new")}
            startIcon={<AddCircleOutlineIcon />}
          >
            Notice
          </Button>
        )}

        <IconButton color="inherit" onClick={(e) => setAnchorEl(e.currentTarget)}>
          <AccountCircleIcon />
        </IconButton>
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
