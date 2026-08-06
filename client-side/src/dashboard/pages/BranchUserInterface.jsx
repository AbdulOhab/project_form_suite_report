import React, { useState, useEffect } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import {
  Box,
  Button,
  Paper,
  Typography,
} from "@mui/material";
import {
  ArrowBack,
  TableChartOutlined,
} from "@mui/icons-material";
import BranchDayCount from "../time/BranchDayCount";
import BASE_URL from "../../auth/dbUrl";
import { buildNoticeSlug } from "../../utils/noticeSlug";

function BranchUserInterface() {
  const { dayId } = useParams();
  const location = useLocation();
  const noticeId = location.state?.id;

  const [thanaReport, setThanaReport] = useState();
  const [notice, setNotice] = useState();
  const [totalData, setTotalData] = useState();

  useEffect(() => {
    if (!noticeId) return;

    const getBranchUsers = async () => {
      try {
        const response = await fetch(`${BASE_URL}/branch/data-checkout/${dayId}/${noticeId}`, {
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
        } else {
          throw new Error("Failed to fetch");
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

        {/* Compact top bar */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1, flexWrap: "wrap", gap: 1 }}>
          <Button
            component={Link}
            to={`/dashboard/branch-data-interface/${buildNoticeSlug(notice)}`}
            state={{ id: noticeId }}
            size="small"
            startIcon={<ArrowBack />}
            variant="text"
            sx={{ fontWeight: 600 }}
          >
            ফিরে যান
          </Button>
          <Box sx={{ textAlign: "center", flex: 1, minWidth: 0 }}>
            <Typography variant="h6" fontWeight="bold" noWrap>
              {notice?.document_name || (noticeId ? "Loading..." : "")}
            </Typography>
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
            {/* Table card */}
            <Paper elevation={0} sx={{ borderRadius: 2, border: "1px solid", borderColor: "divider", overflow: "hidden" }}>
              <Box sx={{ px: 2, py: 1.5, bgcolor: "grey.50", borderBottom: "1px solid", borderColor: "divider", display: "flex", alignItems: "center", gap: 1 }}>
                <TableChartOutlined fontSize="small" color="action" />
                <Typography variant="subtitle2" fontWeight={600} color="text.secondary">
                  থানা রিপোর্ট
                </Typography>
              </Box>
              <Box sx={{ p: 1 }}>
                <BranchDayCount
                  startDadeline={notice?.startDadeline}
                  range={notice?.range}
                  questions={notice?.questions}
                  thanaReport={thanaReport}
                  totalData={totalData}
                  noticeId={noticeId}
                  timeStart={notice?.timeStart}
                  timeEnd={notice?.timeEnd}
                  documentName={notice?.document_name}
                />
              </Box>
            </Paper>
          </>
        )}

      </Box>
    </>
  );
}

export default BranchUserInterface;
