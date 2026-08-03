import React, { useState, useEffect } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import {
  Box, Button, Paper, Typography,
} from "@mui/material";
import {
  ArrowBack, TableChartOutlined,
} from "@mui/icons-material";
import ZonalDayCount from "../../time/ZonalDayCount";
import BASE_URL from "../../../auth/dbUrl";
import { buildNoticeSlug } from "../../../utils/noticeSlug";

function ZonalUserInterface() {
  const { dayId } = useParams();
  const location = useLocation();
  const noticeId = location.state?.id;
  const [branchReport, setBranchReport] = useState();
  const [notice, setNotice] = useState();
  const [totalData, setTotalData] = useState();

  useEffect(() => {
    if (!noticeId) return;

    const getBranchUsers = async () => {
      try {
        const response = await fetch(`${BASE_URL}/zonal/data-checkout/${dayId}/${noticeId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + window.localStorage.getItem("gsmToken"),
          },
        });
        const data = await response.json();
        if (response.ok) {
          setBranchReport(data.tempBranch);
          setNotice(data.question);
          setTotalData(data.sumsArray);
        }
      } catch (error) {
        console.error("Error fetching notice data:", error);
      }
    };
    getBranchUsers();
  }, [noticeId, dayId]);

  return (
    <>
      <Box sx={{ maxWidth: 1500, mx: "auto", px: { xs: 1, sm: 2, md: 3 }, py: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1, flexWrap: "wrap", gap: 1 }}>
          <Button component={Link} to={`/dashboard/zonal-data-interface/${buildNoticeSlug(notice)}`} state={{ id: noticeId }} size="small" startIcon={<ArrowBack />} variant="text" sx={{ fontWeight: 600 }}>ফিরে যান</Button>
          <Box sx={{ textAlign: "center", flex: 1, minWidth: 0 }}>
            <Typography variant="h6" fontWeight="bold" noWrap>{notice?.document_name || (noticeId ? "Loading..." : "")}</Typography>
            {notice?.sub_title && <Typography variant="caption" color="text.secondary">{notice.sub_title}</Typography>}
          </Box>
        </Box>

        {!noticeId ? (
          <Typography color="text.secondary" sx={{ mt: 2 }}>
            রিপোর্ট থেকে বিস্তারিত বাটনে ক্লিক করে আসুন।
          </Typography>
        ) : (
          <>
            <Paper elevation={0} sx={{ borderRadius: 2, border: "1px solid", borderColor: "divider", overflow: "hidden" }}>
              <Box sx={{ px: 2, py: 1.5, bgcolor: "grey.50", borderBottom: "1px solid", borderColor: "divider", display: "flex", alignItems: "center", gap: 1 }}>
                <TableChartOutlined fontSize="small" color="action" />
                <Typography variant="subtitle2" fontWeight={600} color="text.secondary">ব্রাঞ্চ রিপোর্ট</Typography>
              </Box>
              <Box sx={{ p: 1 }}>
                <ZonalDayCount startDadeline={notice?.startDadeline} range={notice?.range} questions={notice?.questions} branchReport={branchReport} totalData={totalData} noticeId={noticeId} slug={buildNoticeSlug(notice)} />
              </Box>
            </Paper>
          </>
        )}
      </Box>
    </>
  );
}

export default ZonalUserInterface;
