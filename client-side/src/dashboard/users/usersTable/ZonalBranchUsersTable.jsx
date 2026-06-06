import React, { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  TextField,
  MenuItem,
  Button,
  Stack,
  Divider,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import BASE_URL from "../../../auth/dbUrl";
import Pagination from "./Pagination";
import ZonalBranchesTable from "./ZonalBranchesTable";

const ZonalBranchUsersTable = () => {
  const location = useLocation();
  const queryParams = location.search;
  const [zonalName, setZonalName] = useState("");

  const { zonalId } = useParams();

  const [userData, setUserData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage, setUsersPerPage] = useState(25);

  useEffect(() => {
    const getBranchUsers = async () => {
      try {
        let response = await fetch(
          `${BASE_URL}/get-branch-users-by-zonal/${zonalId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization:
                "Bearer " + window.localStorage.getItem("gsmToken"),
            },
          }
        );

        let data = await response.json();

        if (!response.ok) {
          throw new Error("Failed to fetch branch users data");
        }
        if (response.ok) {
          setUserData(data?.branch);
          setZonalName(data?.zonalName);
        }
      } catch (error) {
        console.error("Error fetching branch users data:", error);
      }
    };
    getBranchUsers();
  }, [zonalId]);

  // get current users
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = userData.slice(indexOfFirstUser, indexOfLastUser);

  const selectHandler = (e) => {
    e.preventDefault();
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

  return (
    <Box sx={{ mt: 2 }}>
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ my: 2 }}
        >
          <TextField
            select
            size="small"
            value={usersPerPage}
            onChange={selectHandler}
            sx={{ minWidth: 100 }}
          >
            {perPageOptions.map((val) => (
              <MenuItem key={val} value={val}>
                {val}
              </MenuItem>
            ))}
          </TextField>

          <Typography
            variant="h5"
            sx={{ textAlign: "center", fontWeight: "bold", color: "#2e7d32" }}
          >
            {zonalName?.userName}
          </Typography>

          <Button
            component={Link}
            to={`/dashboard/zonal-users${queryParams}`}
            variant="outlined"
            startIcon={<ArrowBackIcon />}
          >
            Back
          </Button>
        </Stack>

        <Divider sx={{ mb: 2 }} />

        <ZonalBranchesTable users={currentUsers} />

        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mt: 2 }}
        >
          <Typography
            variant="body2"
            sx={{ border: 1, p: 1, borderRadius: 1, borderColor: "divider" }}
          >
            Showing {currentUsers.length} of {userData.length} users
          </Typography>
          <Pagination
            usersPerPage={usersPerPage}
            totalUsers={userData.length}
            paginate={paginate}
          />
        </Stack>
      </Paper>
    </Box>
  );
};

export default ZonalBranchUsersTable;
