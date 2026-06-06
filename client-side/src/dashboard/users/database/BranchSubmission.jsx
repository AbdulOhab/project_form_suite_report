import React, { useState } from "react";
import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
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
import { Close, Edit as EditIcon } from "@mui/icons-material";
import DateDifferenceComponent from "../../time/DateDifferenceComponent";
import TimeDifference from "../../time/TimeDifference";
import BASE_URL from "../../../auth/dbUrl";

function BranchSubmission() {
  const { id } = useParams();

  const [descriptionAlert, setDescriptionAlert] = useState(false);

  const [thanaReport, setThanaReport] = useState();
  const [notice, setNotice] = useState();
  const [totalData, setTotalData] = useState();

  useEffect(() => {
    const getBranchUsers = async () => {
      try {
        const response = await fetch(
          `${BASE_URL}/branch/data-checkout/${id}`,
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
          setThanaReport(data.tempThana);
          setNotice(data.question);
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
    <>
      <Box>
        <Paper elevation={0} sx={{ my: 0.5 }}>
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
                            startDadeline={notice?.startDadeline}
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
        </Paper>

        {/* Table Section */}
        <Paper elevation={3} sx={{ my: 1.5 }}>
          <TableContainer>
            <Table
              size="small"
              sx={{
                textAlign: "center",
                border: 1,
                borderColor: "success.main",
                "& th, & td": { textAlign: "center", px: 1 },
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
                  <TableCell>Thana Name</TableCell>
                  {notice?.questions?.map((question, index) => (
                    <TableCell key={index}>{question?.questionText}</TableCell>
                  ))}
                  <TableCell>Action</TableCell>
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
                {thanaReport?.map((thana, index) => (
                  <TableRow key={index} sx={{ textTransform: "capitalize" }}>
                    <TableCell component="th" scope="row">
                      {thana?.userName}
                    </TableCell>
                    {thana?.answer?.answers ? (
                      <React.Fragment>
                        {thana.answer.answers.map((ans, ansIndex) => (
                          <TableCell key={`${index}-${ansIndex}`}>
                            {ans?.data}
                          </TableCell>
                        ))}
                        <TableCell key={`edit-${index}`}>
                          <Button
                            component={Link}
                            to={`/dashboard/branch-edit-answer/${id}/${thana?.answer?._id}`}
                            size="small"
                            color="error"
                          >
                            <EditIcon />
                          </Button>
                        </TableCell>
                      </React.Fragment>
                    ) : (
                      <React.Fragment>
                        <TableCell key={index}>
                          <Button
                            component={Link}
                            to={`/dashboard/branch-empty-answer/${thana?.thanaCode}/${notice?._id}`}
                            size="small"
                          >
                            <EditIcon />
                          </Button>
                        </TableCell>
                      </React.Fragment>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>
    </>
  );
}

export default BranchSubmission;
