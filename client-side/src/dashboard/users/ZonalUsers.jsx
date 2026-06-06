import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  TextField,
  MenuItem,
  Button,
  Divider,
  Stack,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Pagination from "./usersTable/Pagination";
import BASE_URL from "../../auth/dbUrl";
import ZonalTableBody from "./usersTable/ZonalTableBody";

function ZonalUsers() {
  const [userData, setUserData] = useState([]);
  const [currentPage, setCurrenPage] = useState(1);
  const [usersPerPage, setUsersPerPage] = useState(25);

  useEffect(() => {
    const getZonalUsers = async () => {
      try {
        let response = await fetch(`${BASE_URL}/zonal-users`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + window.localStorage.getItem("gsmToken"),
          },
        });
        let data = await response.json();
        if (!response.ok) {
          throw new Error("get notice data failed");
        }
        if (response.ok) {
          setUserData(data);
        }
      } catch (error) {
        console.error("Error fetching notice data:", error);
      }
    };
    getZonalUsers();
  }, []);

  // get current users
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = userData.slice(indexOfFirstUser, indexOfLastUser);

  const selectHandler = (e) => {
    e.preventDefault();
    setUsersPerPage(e.target.value);
  };

  const paginate = (pageNumber) => setCurrenPage(pageNumber);

  const perPageOptions = [
    25,
    Math.ceil(userData?.length / 16),
    Math.ceil(userData?.length / 8),
    Math.ceil(userData?.length / 4),
    Math.ceil(userData?.length / 2),
    Math.ceil(userData?.length),
  ].filter((v, i, a) => v > 0 && a.indexOf(v) === i);

  return (
    <Box sx={{ mt: 2 }}>
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
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
            অঞ্চল সমূহ
          </Typography>

          <Button
            component={Link}
            to="/dashboard"
            variant="outlined"
            startIcon={<ArrowBackIcon />}
          >
            Back
          </Button>
        </Stack>

        <Divider sx={{ my: 2 }} />

        <ZonalTableBody users={currentUsers} />

        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mt: 2 }}
        >
          <Typography variant="body2" sx={{ border: 1, p: 1, borderRadius: 1, borderColor: "divider" }}>
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
}

export default ZonalUsers;
