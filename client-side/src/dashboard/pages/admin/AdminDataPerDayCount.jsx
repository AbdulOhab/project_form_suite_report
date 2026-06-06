import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Box,
  Button,
  Paper,
  Typography,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from "@mui/material";
import { Close, ArrowBack } from "@mui/icons-material";
import DateDifferenceComponent from "../../time/DateDifferenceComponent";
import ZonalDataPerDayInterface from "../../time/ZonalDataPerDayInterface";
import BASE_URL from "../../../auth/dbUrl";
import convertToBengaliNumber from "../../time/NumberConverter";

function AdminDataPerDayCount() {
  const { dayId, zonalId, branchId, noticeId } = useParams();
  const [descriptionAlert, setDescriptionAlert] = useState(false);

  const [notice, setNotice] = useState();
  const [totalData, setTotalData] = useState();
  const [thanaReport, setThanaReport] = useState();
  const [branchName, setBranchName] = useState();

  useEffect(() => {
    const getZonalUsers = async () => {
      try {
        const response = await fetch(
          `${BASE_URL}/admin/thana-data-daycount/${dayId}/${zonalId}/${branchId}/${noticeId}`,
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
          setBranchName(data.branch);
        } else {
          throw new Error("Failed to fetch");
        }
      } catch (error) {
        console.error("Error fetching notice data:", error);
      }
    };
    getZonalUsers();
  }, [noticeId, dayId, branchId, zonalId]);

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
                <Paper variant="outlined" sx={{ p: 2 }}>
                  {validCardData(notice?.endDadeline) < 0 ? (
                    <Typography
                      align="center"
                      fontWeight="bold"
                      color="error"
                      fontSize="1rem"
                    >
                      নোটিশ প্রদানের সময় শেষ হয়েছে{" "}
                      {convertToBengaliNumber(
                        Math.abs(validCardData(notice?.endDadeline))
                      )}{" "}
                      দিন পূর্বে
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
                </Paper>
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
                <Box sx={{ textAlign: "center", mt: 1 }}>
                  <Chip
                    label="এক নজরে থানা রিপোর্ট"
                    sx={{
                      fontWeight: "bold",
                      fontSize: "1.25rem",
                      px: 2,
                      py: 2.5,
                      bgcolor: "success.main",
                      color: "white",
                    }}
                  />
                </Box>
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
                  to={`/dashboard/admin-branch-interface/${dayId}/${zonalId}/${noticeId}`}
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
          <ZonalDataPerDayInterface
            startDadeline={notice?.startDadeline}
            range={notice?.range}
            questions={notice?.questions}
            thanaReport={thanaReport}
            totalData={totalData}
            branchName={branchName}
          />
        </Paper>
      </Box>
    </>
  );
}

export default AdminDataPerDayCount;
