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
import { Close, ArrowBack } from "@mui/icons-material";
import DateDifferenceComponent from "../../time/DateDifferenceComponent";
import TimeDifference from "../../time/TimeDifference";
import ZonalDayCount from "../../time/ZonalDayCount";
import BASE_URL from "../../../auth/dbUrl";
import convertToBengaliNumber from "../../time/NumberConverter";

function ZonalUserInterface() {
  const { dayId, noticeId } = useParams();

  const [descriptionAlert, setDescriptionAlert] = useState(false);

  const [branchReport, setBranchReport] = useState();
  const [notice, setNotice] = useState();
  const [totalData, setTotalData] = useState();

  useEffect(() => {
    const getBranchUsers = async () => {
      try {
        const response = await fetch(
          `${BASE_URL}/zonal/data-checkout/${dayId}/${noticeId}`,
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
        console.log(data);

        if (response.ok) {
          setBranchReport(data.tempBranch);
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
  }, [noticeId, dayId]);

  const descriptionHandler = () => {
    setDescriptionAlert(true);
  };
  const descriptionCloserHandler = () => {
    setDescriptionAlert(false);
  };

  const validCardData = (endDadeline) => {
    const currentDate = new Date();
    const endDadelineDate = new Date(endDadeline);

    const timeDiff = endDadelineDate - currentDate;
    const diffInDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    return diffInDays;
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
                        <TableCell align="center">
                          {validCardData(notice?.endDadeline) < 0 ? (
                            <Typography
                              align="center"
                              variant="h6"
                              fontWeight="bold"
                              color="error"
                            >
                              নোটিশ শেষ হয়েছে{" "}
                              {convertToBengaliNumber(
                                Math.abs(validCardData(notice?.endDadeline))
                              )}{" "}
                              দিন আগে
                            </Typography>
                          ) : (
                            <DateDifferenceComponent
                              startDadeline={notice?.startDadeline}
                              range={notice?.range}
                              timeStart={notice?.timeStart}
                              timeEnd={notice?.timeEnd}
                              endDadeline={notice?.endDadeline}
                            />
                          )}
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
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "flex-end",
                  flexDirection: "column",
                  gap: 1,
                }}
              >
                {!descriptionAlert && (
                  <Button
                    variant="outlined"
                    color="success"
                    onClick={descriptionHandler}
                    sx={{ fontWeight: 600, width: "50%" }}
                  >
                    Notice
                  </Button>
                )}
                <Button
                  component={Link}
                  to={`/dashboard/zonal-data-interface/${noticeId}`}
                  variant="text"
                  startIcon={<ArrowBack />}
                  sx={{ fontSize: "1.1rem", p: 1 }}
                >
                  Back
                </Button>
              </Box>
            </Box>
          </Paper>
        </Paper>

        {/* Table Section */}
        <Paper elevation={3} sx={{ my: 1.5, p: 2, borderRadius: 1 }}>
          <ZonalDayCount
            startDadeline={notice?.startDadeline}
            range={notice?.range}
            questions={notice?.questions}
            branchReport={branchReport}
            totalData={totalData}
          />
        </Paper>
      </Box>
    </>
  );
}

export default ZonalUserInterface;
