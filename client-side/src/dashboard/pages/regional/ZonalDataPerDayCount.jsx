import React, { useEffect, useState } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import {
  Box, Button, Paper, Typography,
} from "@mui/material";
import {
  ArrowBack, TableChartOutlined,
} from "@mui/icons-material";
import ZonalDataPerDayInterface from "../../time/ZonalDataPerDayInterface";
import BASE_URL from "../../../auth/dbUrl";
import { buildNoticeSlug } from "../../../utils/noticeSlug";

function ZonalDataPerDayCount() {
  const { dayId, branchId } = useParams();
  const location = useLocation();
  const noticeId = location.state?.id;
  const [notice, setNotice] = useState();
  const [totalData, setTotalData] = useState();
  const [thanaReport, setThanaReport] = useState();
  const [branchName, setBranchName] = useState();

  useEffect(() => {
    if (!noticeId) return;

    const getZonalUsers = async () => {
      try {
        const response = await fetch(`${BASE_URL}/zonal/zonal-data-daycount/${dayId}/${branchId}/${noticeId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + window.localStorage.getItem("gsmToken"),
          },
        });
        const data = await response.json();
        if (response.ok) {
          setThanaReport(data.tempThana);
          setNotice(data.question);
          setTotalData(data.sumsArray);
          setBranchName(data.branch);
        }
      } catch (error) {
        console.error("Error fetching notice data:", error);
      }
    };
    getZonalUsers();
  }, [noticeId, dayId, branchId]);

  return (
    <>
      <Box sx={{ maxWidth: 1500, mx: "auto", px: { xs: 1, sm: 2, md: 3 }, py: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1, flexWrap: "wrap", gap: 1 }}>
          <Button component={Link} to={`/dashboard/zonal-interface/${dayId}/${buildNoticeSlug(notice)}`} state={{ id: noticeId }} size="small" startIcon={<ArrowBack />} variant="text" sx={{ fontWeight: 600 }}>ফিরে যান</Button>
          <Box sx={{ textAlign: "center", flex: 1, minWidth: 0 }}>
            <Typography variant="h6" fontWeight="bold" noWrap>{notice?.document_name || (noticeId ? "Loading..." : "")}</Typography>
            {branchName?.userName && <Typography variant="caption" color="text.secondary">{branchName.userName}</Typography>}
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
                <Typography variant="subtitle2" fontWeight={600} color="text.secondary">থানা রিপোর্ট</Typography>
              </Box>
              <Box sx={{ p: 1 }}>
                <ZonalDataPerDayInterface startDadeline={notice?.startDadeline} range={notice?.range} questions={notice?.questions} thanaReport={thanaReport} totalData={totalData} branchName={branchName} />
              </Box>
            </Paper>
          </>
        )}
      </Box>
    </>
  );
}

export default ZonalDataPerDayCount;
