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
import { Close, ArrowBack, InfoOutlined } from "@mui/icons-material";
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
    <Box sx={{ px: { xs: 1, sm: 2, md: 3 }, py: 2 }}>
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

      {/* Compact top bar */}
      <Box sx={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        mb: 1, flexWrap: "wrap", gap: 1
      }}>
        <Button
          component={Link}
          to={`/dashboard/admin-data-interface/${noticeId}`}
          size="small"
          startIcon={<ArrowBack />}
          variant="text"
          sx={{ fontWeight: 600 }}
        >
          ফিরে যান
        </Button>
        <Box sx={{ textAlign: "center", flex: 1 }}>
          <Typography variant="h6" fontWeight="bold">{notice?.document_name}</Typography>
          {notice?.sub_title && (
            <Typography variant="caption" color="text.secondary">{notice.sub_title}</Typography>
          )}
        </Box>
        <Button
          size="small"
          startIcon={<InfoOutlined />}
          variant="outlined"
          onClick={() => setDescriptionAlert(true)}
          sx={{ fontWeight: 600 }}
        >
          বিবরণ
        </Button>
      </Box>

      {/* Compact timer */}
      <Box sx={{ mb: 2 }}>
        {validCardData(notice?.endDadeline) < 0 ? (
          <Chip
            color="error"
            variant="outlined"
            size="small"
            label={`নোটিশ প্রদানের সময় শেষ হয়েছে ${convertToBengaliNumber(Math.abs(validCardData(notice?.endDadeline)))} দিন পূর্বে`}
            sx={{ fontWeight: "bold" }}
          />
        ) : (
          <DateDifferenceComponent
            startDadeline={notice?.startDadeline}
            range={notice?.range}
            timeStart={notice?.timeStart}
            timeEnd={notice?.timeEnd}
            endDadeline={notice?.endDadeline}
          />
        )}
      </Box>

      {/* Toggle Buttons */}
      <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
        <Button
          size="small"
          variant={zonalShow ? "contained" : "outlined"}
          onClick={handleZonal}
          sx={{ fontWeight: 600 }}
        >
          জোন ডাটা
        </Button>
        <Button
          size="small"
          variant={branchShow ? "contained" : "outlined"}
          onClick={handleBranch}
          sx={{ fontWeight: 600 }}
        >
          ব্রাঞ্চ ডাটা
        </Button>
      </Box>

      {/* Zonal Table */}
      {zonalShow && (
        <Paper elevation={0} sx={{ borderRadius: 2, border: "1px solid", borderColor: "divider", overflow: "hidden" }}>
          <Box sx={{ px: 2, py: 1.5, bgcolor: "grey.50", borderBottom: "1px solid", borderColor: "divider" }}>
            <Typography variant="subtitle2" fontWeight={600} color="text.secondary">দৈনিক রিপোর্ট বিশ্লেষণ</Typography>
          </Box>
          <Box sx={{ p: 1 }}>
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
        <Paper elevation={0} sx={{ borderRadius: 2, border: "1px solid", borderColor: "divider", overflow: "hidden" }}>
          <Box sx={{ px: 2, py: 1.5, bgcolor: "grey.50", borderBottom: "1px solid", borderColor: "divider" }}>
            <Typography variant="subtitle2" fontWeight={600} color="text.secondary">দৈনিক রিপোর্ট বিশ্লেষণ</Typography>
          </Box>
          <Box sx={{ p: 1 }}>
            <AdminAllBranchDayCount />
          </Box>
        </Paper>
      )}
    </Box>
  );
}

export default AdminUserInterface;
