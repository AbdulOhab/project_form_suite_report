import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  MenuItem,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  TextField,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
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

const SEARCH_FIELD_OPTIONS = {
  admin: [
    { value: "userId", label: "ইউজার আইডি" },
    { value: "userName", label: "নাম" },
    { value: "email", label: "ইমেইল" },
    { value: "userRole", label: "রোল" },
  ],
  zonal: [
    { value: "userId", label: "ইউজার আইডি" },
    { value: "zonalCode", label: "অঞ্চল কোড" },
    { value: "userName", label: "নাম" },
    { value: "userRole", label: "রোল" },
  ],
  branch: [
    { value: "userId", label: "ইউজার আইডি" },
    { value: "branchCode", label: "ব্রাঞ্চ কোড" },
    { value: "userName", label: "নাম" },
    { value: "zonalCode", label: "অঞ্চল কোড" },
    { value: "userRole", label: "রোল" },
  ],
  thana: [
    { value: "userId", label: "ইউজার আইডি" },
    { value: "userName", label: "থানার নাম" },
    { value: "thanaCode", label: "থানা কোড" },
    { value: "branchCode", label: "ব্রাঞ্চ কোড" },
    { value: "zonalCode", label: "অঞ্চল কোড" },
    { value: "userRole", label: "রোল" },
  ],
};

function UnifiedUsersList() {
  const [activeTab, setActiveTab] = useState(0);
  const [userData, setUserData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage, setUsersPerPage] = useState(25);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("all");

  const config = LIST_TABS[activeTab];
  const fieldOptions = SEARCH_FIELD_OPTIONS[config.key] || [];

  useEffect(() => {
    setCurrentPage(1);
    setUserData([]);
    setSearchTerm("");
    setSearchField("all");
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

  const filteredData = React.useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return userData;
    if (searchField === "all") {
      return userData.filter((user) =>
        Object.values(user).some((value) =>
          String(value ?? "").toLowerCase().includes(term)
        )
      );
    }
    return userData.filter((user) =>
      String(user[searchField] ?? "").toLowerCase().includes(term)
    );
  }, [userData, searchTerm, searchField]);

  const effectiveUsersPerPage =
    usersPerPage === "all" ? filteredData.length || 1 : usersPerPage;
  const indexOfLastUser = currentPage * effectiveUsersPerPage;
  const indexOfFirstUser = indexOfLastUser - effectiveUsersPerPage;
  const currentUsers = filteredData.slice(indexOfFirstUser, indexOfLastUser);

  const selectHandler = (e) => {
    const val = e.target.value;
    setUsersPerPage(val === "all" ? "all" : parseInt(val, 10));
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleSearchFieldChange = (e) => {
    setSearchField(e.target.value);
    setCurrentPage(1);
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const rowsPerPageOptions = [20, 25, 50, 100, 500, 1000];

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
      <Box sx={{ px: 2, py: 2, my: 3 }}>
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
          <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
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
                <MenuItem value="all">All</MenuItem>
              </Select>
            </FormControl>

            <TextField
              size="small"
              placeholder="সার্চ করুন..."
              value={searchTerm}
              onChange={handleSearchChange}
              sx={{ minWidth: 220 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />

            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>ফিল্ড</InputLabel>
              <Select value={searchField} label="ফিল্ড" onChange={handleSearchFieldChange}>
                <MenuItem value="all">সব ফিল্ড</MenuItem>
                {fieldOptions.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>

        {loading ? (
          <Box sx={{ py: 6, textAlign: "center" }}>
            <Typography variant="body1" color="text.secondary">
              Loading...
            </Typography>
          </Box>
        ) : filteredData.length > 0 ? (
          <>
            {/* Table */}
            <Paper variant="outlined">{renderTable()}</Paper>

            {/* Pagination bar */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mt: 4,
                mb: 6,
                flexWrap: "wrap",
                gap: 2,
              }}
            >
              <Paper
                elevation={0}
                sx={{
                  px: 3,
                  py: 2,
                  borderRadius: 2,
                  bgcolor: "action.hover",
                }}
              >
                <Typography variant="body1">
                  Showing {currentUsers.length} of {filteredData.length} users
                  {searchTerm ? ` (filtered from ${userData.length})` : ""}
                </Typography>
              </Paper>
              <Pagination
                usersPerPage={effectiveUsersPerPage}
                totalUsers={filteredData.length}
                paginate={paginate}
                currentPage={currentPage}
              />
            </Box>
          </>
        ) : (
          /* Empty state */
          <Box sx={{ py: 6, textAlign: "center" }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {searchTerm
                ? "কোনো ফলাফল পাওয়া যায়নি"
                : `কোনো ${config.label} ইউজার পাওয়া যায়নি`}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchTerm
                ? "অন্য কিছু দিয়ে সার্চ করে দেখুন।"
                : "অন্য ট্যাবে যান বা নতুন ইউজার তৈরি করুন।"}
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
}

export default UnifiedUsersList;
