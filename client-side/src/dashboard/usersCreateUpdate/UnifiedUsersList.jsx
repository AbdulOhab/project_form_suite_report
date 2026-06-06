import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  MenuItem,
  Tabs,
  Tab,
  Chip,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import Pagination from "../users/usersTable/Pagination";
import BASE_URL from "../../auth/dbUrl";
import AdminTableBody from "../users/usersTable/AdminTableBody";
import ZonalTableBody from "../users/usersTable/ZonalTableBody";
import BranchTableBody from "../users/usersTable/BranchTableBody";
import ThanaTableBody from "../users/usersTable/ThanaTableBody";

const LIST_TABS = [
  { key: "admin", label: "Admin", endpoint: "/admin-users" },
  { key: "zonal", label: "Zonal", endpoint: "/zonal-users" },
  { key: "branch", label: "Branch", endpoint: "/branch-users" },
  { key: "thana", label: "Thana", endpoint: "/thana-users" },
];

function UnifiedUsersList() {
  const [activeTab, setActiveTab] = useState(0);
  const [userData, setUserData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage, setUsersPerPage] = useState(25);

  const config = LIST_TABS[activeTab];

  useEffect(() => {
    setCurrentPage(1);
    setUserData([]);
    setLoading(true);

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
      } finally {
        setLoading(false);
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

  const rowsPerPageOptions = [
    25,
    ...(userData.length > 0
      ? [
          Math.ceil(userData.length / 16),
          Math.ceil(userData.length / 8),
          Math.ceil(userData.length / 4),
          Math.ceil(userData.length / 2),
          Math.ceil(userData.length),
        ]
      : []),
  ].filter((v, i, arr) => arr.indexOf(v) === i && v > 0);

  const renderTable = () => {
    switch (config.key) {
      case "admin":
        return <AdminTableBody users={currentUsers} />;
      case "zonal":
        return <ZonalTableBody users={currentUsers} />;
      case "branch":
        return <BranchTableBody users={currentUsers} />;
      case "thana":
        return <ThanaTableBody users={currentUsers} />;
      default:
        return null;
    }
  };

  return (
    <Paper elevation={0} sx={{ borderRadius: 0, minHeight: "80vh" }}>
      {/* Mobile-only header */}
      <Box sx={{ display: { xs: "block", lg: "none" }, my: 3, textAlign: "center" }}>
        <Chip
          label="ইউজার ম্যানেজমেন্ট"
          color="primary"
          sx={{ fontWeight: "bold", fontSize: "1.1rem", px: 2, py: 2.5 }}
        />
      </Box>

      {/* Tab bar */}
      <Box sx={{ px: 2, pt: 1 }}>
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            "& .MuiTab-root": { fontWeight: 400 },
            "& .Mui-selected": { fontWeight: 700 },
          }}
        >
          {LIST_TABS.map((tab) => (
            <Tab key={tab.key} label={tab.label} />
          ))}
        </Tabs>
      </Box>

      {/* Content */}
      <Box sx={{ px: 2, my: 3 }}>
        {/* Top bar: rows-per-page + title */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
            flexWrap: "wrap",
            gap: 1,
          }}
        >
          <FormControl size="small" sx={{ minWidth: 100 }}>
            <InputLabel>Rows</InputLabel>
            <Select
              value={usersPerPage}
              label="Rows"
              onChange={selectHandler}
            >
              {rowsPerPageOptions.map((opt) => (
                <MenuItem key={opt} value={opt}>
                  {opt}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Chip
            label={`${config.label} ইউজার`}
            color="info"
            sx={{ fontWeight: "bold", fontSize: "1rem" }}
          />
        </Box>

        {loading ? (
          <Box sx={{ py: 6, textAlign: "center" }}>
            <Typography variant="body1" color="text.secondary">
              Loading...
            </Typography>
          </Box>
        ) : userData.length > 0 ? (
          <>
            {/* Table */}
            <Paper variant="outlined">{renderTable()}</Paper>

            {/* Pagination bar */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mt: 3,
                mb: 4,
                flexWrap: "wrap",
                gap: 2,
              }}
            >
              <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1 }}>
                <Typography variant="body2">
                  Showing {currentUsers.length} of {userData.length} users
                </Typography>
              </Paper>
              <Pagination
                usersPerPage={usersPerPage}
                totalUsers={userData.length}
                paginate={paginate}
                currentPage={currentPage}
              />
            </Box>
          </>
        ) : (
          /* Empty state */
          <Box sx={{ py: 6, textAlign: "center" }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              কোনো {config.label} ইউজার পাওয়া যায়নি
            </Typography>
            <Typography variant="body2" color="text.secondary">
              অন্য ট্যাবে যান বা নতুন ইউজার তৈরি করুন।
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
}

export default UnifiedUsersList;
