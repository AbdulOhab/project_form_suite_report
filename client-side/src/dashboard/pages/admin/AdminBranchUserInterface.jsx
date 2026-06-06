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
import AdminBranchDayCount from "./AdminBranchDayCount";
import BASE_URL from "../../../auth/dbUrl";
import convertToBengaliNumber from "../../time/NumberConverter";

function AdminBranchUserInterface() {
  const { dayId, noticeId, zonalId } = useParams();

  const [descriptionAlert, setDescriptionAlert] = useState(false);
  const [notice, setNotice] = useState();
  const [totalData, setTotalData] = useState();
  const [tempData, setTempData] = useState();
  const [totalSubmit, setTotalSubmit] = useState();
  const [totalUnsubmit, setTotalUnsubmit] = useState();

  useEffect(() => {
    const getBranchUsers = async () => {
      try {
        const response = await fetch(
          `${BASE_URL}/admin/branch/data-checkout/${dayId}/${zonalId}/${noticeId}`,
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
          setTotalData(data.sumsArray);
          setTempData(data.tempData);
          setTotalSubmit(data.totalSubmit);
          setTotalUnsubmit(data.totalUnsubmit);
        } else {
          throw new Error("Failed to fetch");
        }
      } catch (error) {
        console.error("Error fetching notice data:", error);
      }
    };
    getBranchUsers();
  }, [noticeId, dayId, zonalId]);

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
          to={`/dashboard/admin-interface/${dayId}/${noticeId}`}
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

      {/* Table Section */}
      <Paper elevation={0} sx={{ borderRadius: 2, border: "1px solid", borderColor: "divider", overflow: "hidden" }}>
        <Box sx={{ px: 2, py: 1.5, bgcolor: "grey.50", borderBottom: "1px solid", borderColor: "divider" }}>
          <Typography variant="subtitle2" fontWeight={600} color="text.secondary">ব্রাঞ্চ দৈনিক রিপোর্ট</Typography>
        </Box>
        <Box sx={{ p: 1 }}>
          <AdminBranchDayCount
            startDadeline={notice?.startDadeline}
            range={notice?.range}
            questions={notice?.questions}
            totalData={totalData}
            tempData={tempData}
            totalSubmit={totalSubmit}
            totalUnsubmit={totalUnsubmit}
          />
        </Box>
      </Paper>
    </Box>
  );
}

export default AdminBranchUserInterface;
