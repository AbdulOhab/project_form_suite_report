import React, { useState } from "react";
import { useEffect } from "react";
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
import AdminZonalDayCount from "./AdminZonalDayCount";
import BASE_URL from "../../../auth/dbUrl";
import AdminAllBranchDayCount from "./AdminAllBranchDayCount";
import convertToBengaliNumber from "../../time/NumberConverter";

function AdminUserInterface() {
  const { dayId, noticeId } = useParams();

  const [descriptionAlert, setDescriptionAlert] = useState(false);

  const [zonalReport, setZonalReport] = useState();
  const [notice, setNotice] = useState();
  const [totalData, setTotalData] = useState();
  const [totalSubmitted, setTotalSummitted] = useState();
  const [totalUnsubmitted, setTotalUnsubmitted] = useState();
  const [tempData, setTempData] = useState();
  const [branchShow, setBranchShow] = useState(false);
  const [zonalShow, setZonalShow] = useState(true);

  // zonal data fetch
  useEffect(() => {
    const getZonalUsers = async () => {
      try {
        const response = await fetch(
          `${BASE_URL}/admin/data-checkout/${dayId}/${noticeId}`,
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
          setZonalReport(data.tempZonal);
          setNotice(data.question);
          setTotalData(data.sumsArray);
          setTempData(data.tempData);
          setTotalSummitted(data.totalSubmitted);
          setTotalUnsubmitted(data.totalUnsubmitted);
        } else {
          throw new Error("Failed to fetch");
        }
      } catch (error) {
        console.error("Error fetching notice data:", error);
      }
    };
    getZonalUsers();
  }, [noticeId, dayId]);

  const descriptionHandler = () => {
    setDescriptionAlert(true);
  };
  const descriptionCloserHandler = () => {
    setDescriptionAlert(false);
  };

  const handleBranch = () => {
    setBranchShow(true);
    setZonalShow(false);
  };
  const handleZonal = () => {
    setBranchShow(false);
    setZonalShow(true);
  };

  const validCardData = (endDadeline) => {
    const currentDate = new Date();
    const endDadelineDate = new Date(endDadeline);

    const timeDiff = endDadelineDate - currentDate;
    const diffInDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    return diffInDays;
  };

  return (
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
                label="এক নজরে অঞ্চল ও শাখা সমূহের রিপোর্ট"
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
              to={`/dashboard/admin-data-interface/${noticeId}`}
              variant="text"
              startIcon={<ArrowBack />}
              sx={{ fontSize: "1.1rem", p: 1 }}
            >
              Back
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Toggle Buttons */}
      <Box sx={{ display: "flex", gap: 3, p: 2 }}>
        <Button
          variant="contained"
          color="success"
          onClick={handleZonal}
          sx={{
            fontWeight: zonalShow ? "bold" : "normal",
            textDecoration: zonalShow ? "underline" : "none",
          }}
        >
          জোন ডাটা
        </Button>
        <Button
          variant="contained"
          color="success"
          onClick={handleBranch}
          sx={{
            fontWeight: branchShow ? "bold" : "normal",
            textDecoration: branchShow ? "underline" : "none",
          }}
        >
          ব্রাঞ্চ ডাটা
        </Button>
      </Box>

      {/* Zonal Table */}
      {zonalShow && (
        <Paper elevation={3} sx={{ p: 2, borderRadius: 1 }}>
          <Box sx={{ textAlign: "center", mb: 2 }}>
            <Chip
              label="এক নজরে অঞ্চল সমূহের রিপোর্ট"
              sx={{
                bgcolor: "primary.main",
                color: "white",
                px: 3,
                py: 2.5,
                fontSize: "1rem",
              }}
            />
          </Box>
          <Box>
            <AdminZonalDayCount
              startDadeline={notice?.startDadeline}
              range={notice?.range}
              questions={notice?.questions}
              zonalReport={zonalReport}
              totalData={totalData}
              branchData={tempData}
              countUnSubmit={totalUnsubmitted}
              countSubmit={totalSubmitted}
            />
          </Box>
        </Paper>
      )}

      {/* Branch Table */}
      {branchShow && (
        <Paper elevation={3} sx={{ p: 2 }}>
          <Box sx={{ textAlign: "center", mb: 2 }}>
            <Chip
              label="এক নজরে শাখা সমূহের রিপোর্ট"
              sx={{
                bgcolor: "primary.main",
                color: "white",
                px: 3,
                py: 2.5,
                fontSize: "1rem",
              }}
            />
          </Box>
          <Box>
            <AdminAllBranchDayCount />
          </Box>
        </Paper>
      )}
    </Paper>
  );
}

export default AdminUserInterface;
