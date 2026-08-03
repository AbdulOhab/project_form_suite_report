import React, { useState, useEffect } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import {
  Box,
  Button,
  Paper,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import {
  Close,
  ArrowBack,
  InfoOutlined,
  TableChartOutlined,
  CalendarMonthOutlined,
  AccessTimeOutlined,
} from "@mui/icons-material";
import BranchDayCount from "../time/BranchDayCount";
import BASE_URL from "../../auth/dbUrl";
import { buildNoticeSlug } from "../../utils/noticeSlug";

function BranchUserInterface() {
  const { dayId } = useParams();
  const location = useLocation();
  const noticeId = location.state?.id;

  const [descriptionAlert, setDescriptionAlert] = useState(false);
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
      {/* Notice Details Dialog */}
      <Dialog open={descriptionAlert} onClose={() => setDescriptionAlert(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", pb: 1 }}>
          <Box>
            <Typography fontWeight="bold" variant="subtitle1">{notice?.document_name}</Typography>
            {notice?.sub_title && (
              <Typography variant="caption" color="text.secondary">{notice.sub_title}</Typography>
            )}
          </Box>
          <IconButton onClick={() => setDescriptionAlert(false)} size="small"><Close /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {notice?.doc_desc && (
            <Typography variant="body2" color="text.primary" sx={{ mb: 2 }}>{notice.doc_desc}</Typography>
          )}
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <CalendarMonthOutlined fontSize="small" color="action" />
              <Typography variant="caption" color="text.secondary">শুরু: {notice?.startDadeline}</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <CalendarMonthOutlined fontSize="small" color="error" />
              <Typography variant="caption" color="error.main">শেষ: {notice?.endDadeline}</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <AccessTimeOutlined fontSize="small" color="action" />
              <Typography variant="caption" color="text.secondary">{notice?.timeStart} – {notice?.timeEnd}</Typography>
            </Box>
          </Box>
          {notice?.questions?.length > 0 && (
            <>
              <Divider sx={{ mb: 1.5 }} />
              <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ mb: 1, display: "block" }}>
                প্রশ্নসমূহ ({notice.questions.length} টি)
              </Typography>
              <List dense disablePadding>
                {notice.questions.map((q, i) => (
                  <ListItem key={i} disablePadding sx={{ py: 0.3 }}>
                    <ListItemText
                      primary={`${i + 1}. ${q.questionText}`}
                      secondary={q.questionType === "number" ? "সংখ্যা" : "টেক্সট"}
                      primaryTypographyProps={{ variant: "body2" }}
                      secondaryTypographyProps={{ variant: "caption" }}
                    />
                  </ListItem>
                ))}
              </List>
            </>
          )}
        </DialogContent>
      </Dialog>

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
          <Button size="small" startIcon={<InfoOutlined />} variant="outlined" onClick={() => setDescriptionAlert(true)} sx={{ fontWeight: 600 }}>
            বিবরণ
          </Button>
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
