import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  MenuItem,
  Stack,
  Divider,
  Tabs,
  Tab,
} from "@mui/material";
import Pagination from "../users/usersTable/Pagination";
import BASE_URL from "../../auth/dbUrl";
import AdminTableBody from "../users/usersTable/AdminTableBody";
import ZonalTableBody from "../users/usersTable/ZonalTableBody";
import BranchTableBody from "../users/usersTable/BranchTableBody";

const LIST_TABS = [
  { key: "admin", label: "Admin", endpoint: "/admin-users", type: "table" },
  { key: "zonal", label: "Zonal", endpoint: "/zonal-users", type: "table" },
  { key: "branch", label: "Branch", endpoint: "/branch-users", type: "table" },
  { key: "thana", label: "Thana", endpoint: "/thana-users", type: "table" },
];

function UnifiedUsersList() {
  const [activeTab, setActiveTab] = useState(0);
  const [userData, setUserData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage, setUsersPerPage] = useState(25);

  const config = LIST_TABS[activeTab];

  useEffect(() => {
    setCurrentPage(1);
    setUserData([]);

    const fetchUsers = async () => {
      try {
        let response = await fetch(`${BASE_URL}${config.endpoint}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + window.localStorage.getItem("gsmToken"),
          },
        });
        let data = await response.json();
        if (response.ok) {
          setUserData(data);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, [activeTab, config.endpoint]);

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = userData.slice(indexOfFirstUser, indexOfLastUser);

  const selectHandler = (e) => {
    setUsersPerPage(parseInt(e.target.value, 10));
    setCurrentPage(1);
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const perPageOptions = [
    25,
    Math.ceil(userData.length / 16),
    Math.ceil(userData.length / 8),
    Math.ceil(userData.length / 4),
    Math.ceil(userData.length / 2),
    Math.ceil(userData.length),
  ].filter((v, i, a) => v > 0 && a.indexOf(v) === i);

  const renderTable = () => {
    switch (config.key) {
      case "admin":
        return <AdminTableBody users={currentUsers} />;
      case "zonal":
        return <ZonalTableBody users={currentUsers} />;
      case "branch":
        return <BranchTableBody users={currentUsers} />;
      default:
        return null;
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Paper sx={{ borderRadius: 2, overflow: "hidden" }}>
        <Box sx={{ bgcolor: "primary.main", px: 2, pt: 1 }}>
          <Tabs
            value={activeTab}
            onChange={(_, val) => setActiveTab(val)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              "& .MuiTab-root": { color: "rgba(255,255,255,0.5)", minHeight: 36, fontWeight: 400 },
              "& .Mui-selected": { color: "#fff !important", fontWeight: 700, bgcolor: "rgba(255,255,255,0.15)", borderRadius: 1 },
              "& .MuiTabs-indicator": { bgcolor: "#fff", height: 3 },
            }}
          >
            {LIST_TABS.map((tab) => (
              <Tab key={tab.key} label={tab.label} />
            ))}
          </Tabs>
        </Box>

        <Box sx={{ p: 3 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
            <TextField
              select
              size="small"
              value={usersPerPage}
              onChange={selectHandler}
              sx={{ minWidth: 80 }}
            >
              {perPageOptions.map((val) => (
                <MenuItem key={val} value={val}>
                  {val}
                </MenuItem>
              ))}
            </TextField>

            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Showing {currentUsers.length} of {userData.length} users
            </Typography>
          </Stack>

          <Divider sx={{ mb: 2 }} />

          {renderTable()}

          <Stack
            direction="row"
            justifyContent="flex-end"
            alignItems="center"
            sx={{ mt: 2 }}
          >
            <Pagination
              usersPerPage={usersPerPage}
              totalUsers={userData.length}
              paginate={paginate}
            />
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}

export default UnifiedUsersList;
