import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Button,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import DateDifferenceComponent from "../../time/DateDifferenceComponent";
import TimeDifference from "../../time/TimeDifference";
import BASE_URL from "../../../auth/dbUrl";

function ZonalSubmission() {
  const { id } = useParams();
  const [branchTotalData, setBranchTotolData] = useState();
  const [totalData, setTotalData] = useState();
  const [notice, setNotice] = useState();
  const [branch, setBranch] = useState();
  const [descriptionAlert, setDescriptionAlert] = useState(false);

  useEffect(() => {
    const getBranchUsers = async () => {
      try {
        const response = await fetch(
          `${BASE_URL}/zonal/data-checkout/${id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization:
                "Bearer " + window.localStorage.getItem("gsmToken"),
            },
          }
        );
        const data = await response.json();

        if (response.ok) {
          setNotice(data.question);
          setBranch(data.tempBranch);
          setBranchTotolData(data.tempData);
          setTotalData(data.sumsArray);
        } else {
          throw new Error("Failed to fetch");
        }
      } catch (error) {
        console.error("Error fetching notice data:", error);
      }
    };
    getBranchUsers();
  }, [id]);

  const descriptionHandler = () => {
    setDescriptionAlert(true);
  };
  const descriptionCloserHandler = () => {
    setDescriptionAlert(false);
  };

  return (
    <Box>
      <Paper>
        {/* Description Dialog */}
        <Dialog
          open={descriptionAlert}
          onClose={descriptionCloserHandler}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ display: "flex", justifyContent: "flex-end" }}>
            <IconButton onClick={descriptionCloserHandler} size="small">
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <Typography>{notice?.doc_desc}</Typography>
          </DialogContent>
        </Dialog>

        {/* Header Section */}
        <Paper elevation={0} sx={{ p: 2 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 2,
            }}
          >
            {/* Left - Deadline */}
            <Box sx={{ flex: { lg: 3, md: 3, sm: 12 }, width: "100%" }}>
              <TableContainer
                component={Paper}
                variant="outlined"
                sx={{ borderColor: "success.main" }}
              >
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <DateDifferenceComponent
                          startDadeline={notice?.startDadeline}
                          endDadeline={notice?.endDadeline}
                          range={notice?.range}
                        />
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>
                        <TimeDifference
                          timeStart={notice?.timeStart}
                          timeEnd={notice?.timeEnd}
                          endDadeline={notice?.endDadeline}
                        />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            {/* Middle - Title */}
            <Box sx={{ flex: { lg: 6, md: 6, sm: 12 }, width: "100%" }}>
              <Typography
                align="center"
                variant="h4"
                fontWeight={600}
                color="success.main"
              >
                {notice?.document_name}
              </Typography>
              {notice?.sub_title && (
                <Typography align="center" variant="body1">
                  {notice?.sub_title}
                </Typography>
              )}
            </Box>

            {/* Right - Actions */}
            <Box
              sx={{
                flex: { lg: 3, md: 3, sm: 12 },
                width: "100%",
              }}
            >
              {!descriptionAlert && (
                <Button
                  variant="outlined"
                  color="success"
                  onClick={descriptionHandler}
                  sx={{ fontWeight: 600 }}
                >
                  Notice Description
                </Button>
              )}
            </Box>
          </Box>
        </Paper>

        {/* Table Section */}
        <Box sx={{ p: 2 }}>
          <TableContainer>
            <Table
              size="small"
              sx={{
                textAlign: "center",
                "& th, & td": { textAlign: "center", verticalAlign: "middle" },
              }}
            >
              <TableHead>
                <TableRow
                  sx={{
                    textTransform: "capitalize",
                    bgcolor: "info.main",
                    "& th": { color: "white", fontWeight: "bold" },
                  }}
                >
                  <TableCell>Branch Name</TableCell>
                  {notice?.questions?.map((question, index) => (
                    <TableCell key={index}>{question?.questionText}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableHead>
                <TableRow sx={{ "& th": { fontWeight: "bold" } }}>
                  <TableCell>Total</TableCell>
                  {totalData?.map((sum, index) => (
                    <TableCell key={index}>{sum[index]}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {branch?.map((user, userIndex) => (
                  <TableRow key={userIndex}>
                    <TableCell>{user.userName}</TableCell>
                    {Object.keys(branchTotalData[userIndex]).map(
                      (key, answerIndex) => (
                        <TableCell key={answerIndex}>
                          {branchTotalData[userIndex][key]}
                        </TableCell>
                      )
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Paper>
    </Box>
  );
}

export default ZonalSubmission;
