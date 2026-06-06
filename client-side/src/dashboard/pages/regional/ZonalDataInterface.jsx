import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Box, Button, Paper, Typography, Dialog, DialogTitle,
  DialogContent, IconButton, Divider, Chip, List, ListItem, ListItemText,
} from "@mui/material";
import {
  Close, ArrowBack, InfoOutlined, TableChartOutlined,
  CalendarMonthOutlined, AccessTimeOutlined,
} from "@mui/icons-material";
import DateDifferenceComponent from "../../time/DateDifferenceComponent";
import ZonalTableDataInterfce from "../../time/ZonalTableDataInterfce";
import BASE_URL from "../../../auth/dbUrl";
import convertToBengaliNumber from "../../time/NumberConverter";

function ZonalDataInterface() {
  const { id } = useParams();
  const [descriptionAlert, setDescriptionAlert] = useState(false);
  const [branchReport, setBranchReport] = useState();
  const [notice, setNotice] = useState();
  const [totalData, setTotalData] = useState();

  useEffect(() => {
    const getZonalUsers = async () => {
      try {
        const response = await fetch(`${BASE_URL}/zonal/data-interface/${id}`, {
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
    getZonalUsers();
  }, [id]);

  const daysLeft = (end) => Math.ceil((new Date(end) - new Date()) / (1000 * 60 * 60 * 24));

  return (
    <>
      <Dialog open={descriptionAlert} onClose={() => setDescriptionAlert(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", pb: 1 }}>
          <Box>
            <Typography fontWeight="bold" variant="subtitle1">{notice?.document_name}</Typography>
            {notice?.sub_title && <Typography variant="caption" color="text.secondary">{notice.sub_title}</Typography>}
          </Box>
          <IconButton onClick={() => setDescriptionAlert(false)} size="small"><Close /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {notice?.doc_desc && <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{notice.doc_desc}</Typography>}
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
              <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ mb: 1, display: "block" }}>প্রশ্নসমূহ ({notice.questions.length} টি)</Typography>
              <List dense disablePadding>
                {notice.questions.map((q, i) => (
                  <ListItem key={i} disablePadding sx={{ py: 0.3 }}>
                    <ListItemText primary={`${i + 1}. ${q.questionText}`} secondary={q.questionType === "number" ? "সংখ্যা" : "টেক্সট"} primaryTypographyProps={{ variant: "body2" }} secondaryTypographyProps={{ variant: "caption" }} />
                  </ListItem>
                ))}
              </List>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Box sx={{ px: { xs: 1, sm: 2, md: 3 }, py: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1, flexWrap: "wrap", gap: 1 }}>
          <Button component={Link} to="/dashboard" size="small" startIcon={<ArrowBack />} variant="text" sx={{ fontWeight: 600 }}>ফিরে যান</Button>
          <Box sx={{ textAlign: "center", flex: 1, minWidth: 0 }}>
            <Typography variant="h6" fontWeight="bold" noWrap>{notice?.document_name || "Loading..."}</Typography>
            {notice?.sub_title && <Typography variant="caption" color="text.secondary">{notice.sub_title}</Typography>}
          </Box>
          <Button size="small" startIcon={<InfoOutlined />} variant="outlined" onClick={() => setDescriptionAlert(true)} sx={{ fontWeight: 600 }}>বিবরণ</Button>
        </Box>

        <Box sx={{ mb: 2 }}>
          {daysLeft(notice?.endDadeline) < 0 ? (
            <Chip color="error" variant="outlined" size="small" label={`নোটিশ প্রদানের সময় শেষ হয়েছে ${convertToBengaliNumber(Math.abs(daysLeft(notice?.endDadeline)))} দিন পূর্বে`} sx={{ fontWeight: "bold" }} />
          ) : (
            <DateDifferenceComponent startDadeline={notice?.startDadeline} range={notice?.range} timeStart={notice?.timeStart} timeEnd={notice?.timeEnd} endDadeline={notice?.endDadeline} />
          )}
        </Box>

        <Divider sx={{ mb: 2 }} />

        <Paper elevation={0} sx={{ borderRadius: 2, border: "1px solid", borderColor: "divider", overflow: "hidden" }}>
          <Box sx={{ px: 2, py: 1.5, bgcolor: "grey.50", borderBottom: "1px solid", borderColor: "divider", display: "flex", alignItems: "center", gap: 1 }}>
            <TableChartOutlined fontSize="small" color="action" />
            <Typography variant="subtitle2" fontWeight={600} color="text.secondary">দৈনিক রিপোর্ট বিশ্লেষণ</Typography>
          </Box>
          <Box sx={{ p: 1 }}>
            <ZonalTableDataInterfce startDadeline={notice?.startDadeline} range={notice?.range} totalData={totalData} questions={notice?.questions} branchReport={branchReport} />
          </Box>
        </Paper>
      </Box>
    </>
  );
}

export default ZonalDataInterface;
