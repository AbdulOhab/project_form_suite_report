import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getMenuItems } from "../config/sidebarMenu";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Toolbar,
  Divider,
  Box,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import HomeIcon from "@mui/icons-material/Home";

const DRAWER_WIDTH = 260;

const SidebarContent = ({ role, onClose, isMobile }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [openGroups, setOpenGroups] = useState({});
  const menuItems = getMenuItems(role);

  const toggleGroup = (label) => {
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const isActive = (path) => {
    if (!path) return false;
    return location.pathname.includes(path.split("/").pop());
  };

  const handleNavigate = (path) => {
    if (isMobile) onClose();
    navigate(path);
  };

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Toolbar>
        <Typography
          variant="h6"
          sx={{ fontWeight: 700, color: "primary.main", flexGrow: 1 }}
        >
          Instance Report
        </Typography>
      </Toolbar>
      <Divider />

      <List sx={{ flex: 1, px: 1, py: 1 }}>
        {menuItems.map((item) => {
          if (item.children) {
            return (
              <Box key={item.label} sx={{ mb: 0.5 }}>
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => toggleGroup(item.label)}
                    sx={{
                      borderRadius: 2,
                      "&:hover": { bgcolor: "primary.light", color: "#fff", "& .MuiListItemIcon-root": { color: "#fff" } },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.label} />
                    {openGroups[item.label] ? (
                      <ExpandLessIcon />
                    ) : (
                      <ExpandMoreIcon />
                    )}
                  </ListItemButton>
                </ListItem>
                <Collapse
                  in={openGroups[item.label]}
                  timeout="auto"
                  unmountOnExit
                >
                  <List component="div" disablePadding sx={{ pl: 2 }}>
                    {item.children.map((child) => (
                      <ListItem key={child.label} disablePadding>
                        <ListItemButton
                          onClick={() => handleNavigate(child.path)}
                          sx={{
                            borderRadius: 2,
                            bgcolor: isActive(child.path)
                              ? "primary.light"
                              : "transparent",
                            color: isActive(child.path) ? "#fff" : "text.primary",
                            "&:hover": {
                              bgcolor: "primary.light",
                              color: "#fff",
                              "& .MuiListItemIcon-root": { color: "#fff" },
                            },
                          }}
                        >
                          <ListItemIcon
                            sx={{
                              minWidth: 36,
                              color: isActive(child.path) ? "#fff" : "inherit",
                            }}
                          >
                            {child.icon}
                          </ListItemIcon>
                          <ListItemText
                            primary={child.label}
                            primaryTypographyProps={{ fontSize: "0.875rem" }}
                          />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                </Collapse>
              </Box>
            );
          }

          return (
            <ListItem key={item.label} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => handleNavigate(item.path)}
                sx={{
                  borderRadius: 2,
                  bgcolor: isActive(item.path) ? "primary.main" : "transparent",
                  color: isActive(item.path) ? "#fff" : "text.primary",
                  "&:hover": {
                    bgcolor: isActive(item.path) ? "primary.dark" : "primary.light",
                    color: "#fff",
                    "& .MuiListItemIcon-root": { color: "#fff" },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color: isActive(item.path) ? "#fff" : "inherit",
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider />
      <List sx={{ px: 1, py: 1 }}>
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => {
              if (isMobile) onClose();
              navigate("/");
            }}
            sx={{ borderRadius: 2 }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <HomeIcon />
            </ListItemIcon>
            <ListItemText primary="Back to Home" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );
};

const AppSidebar = ({ role, isOpen, onClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Drawer
      variant={isMobile ? "temporary" : "permanent"}
      open={isMobile ? isOpen : true}
      onClose={onClose}
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: DRAWER_WIDTH,
          bgcolor: "#fff",
        },
      }}
    >
      <SidebarContent role={role} onClose={onClose} isMobile={isMobile} />
    </Drawer>
  );
};

export default AppSidebar;
