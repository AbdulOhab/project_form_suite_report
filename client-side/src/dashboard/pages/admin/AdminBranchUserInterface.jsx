import React, { useState } from "react";
import { useEffect } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import {
  Box,
  Button,
  Paper,
  Typography,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import AdminBranchDayCount from "./AdminBranchDayCount";
import BASE_URL from "../../../auth/dbUrl";
import { buildNoticeSlug } from "../../../utils/noticeSlug";

function AdminBranchUserInterface() {
  const { dayId, zonalId } = useParams();
  const location = useLocation();
  const noticeId = location.state?.id;

  const [notice, setNotice] = useState();
  const [totalData, setTotalData] = useState();
  const [tempData, setTempData] = useState();
  const [totalSubmit, setTotalSubmit] = useState();
  const [totalUnsubmit, setTotalUnsubmit] = useState();

  useEffect(() => {
    if (!noticeId) return;

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

  return (
    <Box sx={{ maxWidth: 1500, mx: "auto", px: { xs: 1, sm: 2, md: 3 }, py: 2 }}>
      {/* Compact top bar */}
      <Box sx={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        mb: 1, flexWrap: "wrap", gap: 1
      }}>
        <Button
          component={Link}
          to={`/dashboard/admin-interface/${dayId}/${buildNoticeSlug(notice)}`}
          state={{ id: noticeId }}
          size="small"
          startIcon={<ArrowBack />}
          variant="text"
          sx={{ fontWeight: 600 }}
        >
          ফিরে যান
        </Button>
        <Box sx={{ textAlign: "center", flex: 1 }}>
          <Typography variant="h6" fontWeight="bold">{notice?.document_name || (noticeId ? "Loading..." : "")}</Typography>
          {notice?.sub_title && (
            <Typography variant="caption" color="text.secondary">{notice.sub_title}</Typography>
          )}
        </Box>
      </Box>

      {!noticeId ? (
        <Typography color="text.secondary" sx={{ mt: 2 }}>
          রিপোর্ট থেকে বিস্তারিত বাটনে ক্লিক করে আসুন।
        </Typography>
      ) : (
        <>
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
                noticeId={noticeId}
                slug={buildNoticeSlug(notice)}
              />
            </Box>
          </Paper>
        </>
      )}
    </Box>
  );
}

export default AdminBranchUserInterface;
