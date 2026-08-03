import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Box, Button, Paper, Typography, Chip } from "@mui/material";
import { ArrowBack, TableChartOutlined } from "@mui/icons-material";
import DateByDayCount from "../time/DateByDayCount";
import BASE_URL from "../../auth/dbUrl";
import { buildNoticeSlug } from "../../utils/noticeSlug";

// Same status convention as the Notice Board card (upcoming / ongoing / ended).
const STATUS_META = {
  upcoming: { label: "রিপোর্ট প্রদান শুরু হয়নি", color: "warning" },
  ongoing: { label: "রিপোর্ট চলছে", color: "success" },
  ended: { label: "রিপোর্ট গ্রহণ শেষ", color: "error" },
};

const getNoticeStatus = (notice) => {
  const now = new Date();
  const start = new Date(`${notice?.startDadeline} ${notice?.timeStart || "00:00"}`);
  const end = new Date(`${notice?.endDadeline} ${notice?.timeEnd || "23:59"}`);
  if (now < start) return "upcoming";
  if (now <= end) return "ongoing";
  return "ended";
};

function ThanaUserInterface() {
  const location = useLocation();
  const id = location.state?.id;

  const [answer, setAnswer] = useState();
  const [notice, setNotice] = useState();
  const [totalData, setTotalData] = useState();

  useEffect(() => {
    if (!id) return;

    const getThanaUsers = async () => {
      try {
        const response = await fetch(`${BASE_URL}/thana/data-checkout/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + window.localStorage.getItem("gsmToken"),
          },
        });
        const data = await response.json();
        if (response.ok) {
          setAnswer(data.answers);
          setNotice(data.question);
          setTotalData(data.sumsArray);
        } else {
          throw new Error("Failed to fetch");
        }
      } catch (error) {
        console.error("Error fetching notice data:", error);
      }
    };
    getThanaUsers();
  }, [id]);

  const status = notice ? getNoticeStatus(notice) : null;
  const statusMeta = status && STATUS_META[status];

  return (
    <Box sx={{ maxWidth: 1500, mx: "auto", px: { xs: 1, sm: 2, md: 3 }, py: 2 }}>

      {/* ── Top bar ── */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 2, gap: 1 }}>
        <Button
          component={Link}
          to="/dashboard"
          size="small"
          variant="outlined"
          startIcon={<ArrowBack fontSize="small" />}
          sx={{
            color: "text.secondary",
            borderColor: "divider",
            bgcolor: "#ffffff",
            fontWeight: 600,
            "&:hover": { bgcolor: "action.hover", borderColor: "divider" },
          }}
        >
          Back
        </Button>
        <Box sx={{ textAlign: "center", flex: 1, minWidth: 0 }}>
          <Typography variant="h6" fontWeight="bold" noWrap>
            {notice?.document_name || (id ? "Loading..." : "")}
          </Typography>
          {notice?.sub_title && (
            <Typography variant="caption" color="text.secondary">
              {notice.sub_title}
            </Typography>
          )}
        </Box>
        <Box sx={{ width: 96 }} />
      </Box>

      {!id ? (
        <Typography color="text.secondary">
          নোটিশ বোর্ড থেকে Report বাটনে ক্লিক করে আসুন।
        </Typography>
      ) : (
        <>
          {statusMeta && (
            <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
              <Chip size="small" label={statusMeta.label} color={statusMeta.color} variant="outlined" sx={{ fontWeight: 600, bgcolor: "#ffffff" }} />
            </Box>
          )}

          <Paper
            elevation={0}
            sx={{
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                px: 2,
                py: 1.5,
                bgcolor: "#ffffff",
                borderBottom: "1px solid",
                borderColor: "divider",
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <TableChartOutlined fontSize="small" color="action" />
              <Typography variant="subtitle2" fontWeight={600} color="text.secondary">
                দৈনিক রিপোর্ট
              </Typography>
            </Box>
            <Box sx={{ p: 1 }}>
              <DateByDayCount
                startDadeline={notice?.startDadeline}
                range={notice?.range}
                timeStart={notice?.timeStart}
                timeEnd={notice?.timeEnd}
                thanaReport={answer}
                questions={notice?.questions}
                totalData={totalData}
                id={id}
                slug={buildNoticeSlug(notice)}
              />
            </Box>
          </Paper>
        </>
      )}

    </Box>
  );
}

export default ThanaUserInterface;
