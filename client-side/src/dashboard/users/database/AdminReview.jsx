import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Box, Paper, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, Button, LinearProgress, Divider, Grid, Skeleton,
} from "@mui/material";
import {
  TableChartOutlined, CheckCircleOutline, PendingOutlined,
  AssignmentOutlined, VisibilityOutlined,
} from "@mui/icons-material";
import BASE_URL from "../../../auth/dbUrl";

const token = () => window.localStorage.getItem("gsmToken");

function AdminReview() {
  const [overview, setOverview] = useState([]);
  const [totalThanas, setTotalThanas] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const res = await fetch(`${BASE_URL}/admin/submission-overview`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token(),
          },
        });
        const data = await res.json();
        if (res.ok) {
          setOverview(data.overview);
          setTotalThanas(data.totalThanas);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOverview();
  }, []);

  const totalSubmitted = overview.reduce((s, n) => s + n.submitted, 0);
  const totalExpected = overview.reduce((s, n) => s + n.totalExpected, 0);
  const overallRate = totalExpected > 0 ? Math.round((totalSubmitted / totalExpected) * 100) : 0;
  const activeNotices = overview.filter((n) => {
    const end = new Date(n.endDadeline);
    return end >= new Date();
  });

  const rateColor = (rate) => {
    if (rate >= 80) return "success";
    if (rate >= 50) return "warning";
    return "error";
  };

  const isActive = (endDadeline) => new Date(endDadeline) >= new Date();

  if (loading) {
    return (
      <Box sx={{ px: { xs: 2, md: 4 }, py: 3 }}>
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} variant="rectangular" height={48} sx={{ mb: 1, borderRadius: 1 }} />
        ))}
      </Box>
    );
  }

  return (
    <Box sx={{ px: { xs: 1, sm: 2, md: 3 }, py: 2 }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
        <AssignmentOutlined color="primary" />
        <Typography variant="h6" fontWeight="bold">সাবমিশন পর্যালোচনা</Typography>
      </Box>

      {/* Summary cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <Paper elevation={0} sx={{ p: 2, border: "1px solid", borderColor: "divider", borderRadius: 2, textAlign: "center" }}>
            <Typography variant="h4" fontWeight="bold" color="primary.main">{overview.length}</Typography>
            <Typography variant="caption" color="text.secondary">মোট নোটিশ</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper elevation={0} sx={{ p: 2, border: "1px solid", borderColor: "divider", borderRadius: 2, textAlign: "center" }}>
            <Typography variant="h4" fontWeight="bold" color="success.main">{activeNotices.length}</Typography>
            <Typography variant="caption" color="text.secondary">চলমান নোটিশ</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper elevation={0} sx={{ p: 2, border: "1px solid", borderColor: "divider", borderRadius: 2, textAlign: "center" }}>
            <Typography variant="h4" fontWeight="bold" color="info.main">{totalThanas}</Typography>
            <Typography variant="caption" color="text.secondary">মোট থানা</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper elevation={0} sx={{ p: 2, border: "1px solid", borderColor: "divider", borderRadius: 2, textAlign: "center" }}>
            <Typography variant="h4" fontWeight="bold" color={overallRate >= 80 ? "success.main" : overallRate >= 50 ? "warning.main" : "error.main"}>
              {overallRate}%
            </Typography>
            <Typography variant="caption" color="text.secondary">সামগ্রিক সাবমিশন হার</Typography>
          </Paper>
        </Grid>
      </Grid>

      <Divider sx={{ mb: 2 }} />

      {/* Table */}
      <Paper elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, overflow: "hidden" }}>
        <Box sx={{ px: 2, py: 1.5, bgcolor: "grey.50", borderBottom: "1px solid", borderColor: "divider", display: "flex", alignItems: "center", gap: 1 }}>
          <TableChartOutlined fontSize="small" color="action" />
          <Typography variant="subtitle2" fontWeight={600} color="text.secondary">নোটিশ-ভিত্তিক সাবমিশন স্ট্যাটাস</Typography>
        </Box>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "primary.main" }}>
                <TableCell sx={{ color: "common.white", fontWeight: 600 }}>নোটিশ</TableCell>
                <TableCell sx={{ color: "common.white", fontWeight: 600, textAlign: "center" }}>স্ট্যাটাস</TableCell>
                <TableCell sx={{ color: "common.white", fontWeight: 600, textAlign: "center" }}>দিন</TableCell>
                <TableCell sx={{ color: "common.white", fontWeight: 600, textAlign: "center" }}>মোট প্রত্যাশিত</TableCell>
                <TableCell sx={{ color: "common.white", fontWeight: 600, textAlign: "center" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, justifyContent: "center" }}>
                    <CheckCircleOutline fontSize="small" />
                    সাবমিট
                  </Box>
                </TableCell>
                <TableCell sx={{ color: "common.white", fontWeight: 600, textAlign: "center" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, justifyContent: "center" }}>
                    <PendingOutlined fontSize="small" />
                    বাকি
                  </Box>
                </TableCell>
                <TableCell sx={{ color: "common.white", fontWeight: 600, textAlign: "center", minWidth: 140 }}>সাবমিশন হার</TableCell>
                <TableCell sx={{ color: "common.white", fontWeight: 600, textAlign: "center" }}>একশন</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {overview.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4, color: "text.secondary" }}>
                    কোনো নোটিশ পাওয়া যায়নি
                  </TableCell>
                </TableRow>
              ) : (
                overview.map((notice) => {
                  const rate = notice.totalExpected > 0
                    ? Math.round((notice.submitted / notice.totalExpected) * 100)
                    : 0;
                  const active = isActive(notice.endDadeline);

                  return (
                    <TableRow key={notice._id} sx={{ "&:hover": { bgcolor: "action.hover" } }}>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>{notice.document_name}</Typography>
                        {notice.sub_title && (
                          <Typography variant="caption" color="text.secondary">{notice.sub_title}</Typography>
                        )}
                        <Typography variant="caption" display="block" color="text.secondary">
                          {notice.startDadeline} → {notice.endDadeline}
                        </Typography>
                      </TableCell>

                      <TableCell align="center">
                        <Chip
                          size="small"
                          label={active ? "চলমান" : "শেষ"}
                          color={active ? "success" : "default"}
                          variant={active ? "filled" : "outlined"}
                        />
                      </TableCell>

                      <TableCell align="center">
                        <Typography variant="body2">{notice.range}</Typography>
                      </TableCell>

                      <TableCell align="center">
                        <Typography variant="body2">{notice.totalExpected}</Typography>
                      </TableCell>

                      <TableCell align="center">
                        <Typography variant="body2" fontWeight={600} color="success.main">
                          {notice.submitted}
                        </Typography>
                      </TableCell>

                      <TableCell align="center">
                        <Typography variant="body2" fontWeight={600} color={notice.pending > 0 ? "error.main" : "text.secondary"}>
                          {notice.pending}
                        </Typography>
                      </TableCell>

                      <TableCell align="center" sx={{ minWidth: 140 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={Math.min(rate, 100)}
                            color={rateColor(rate)}
                            sx={{ flex: 1, height: 8, borderRadius: 4 }}
                          />
                          <Typography variant="caption" fontWeight={600} sx={{ minWidth: 34 }}>
                            {rate}%
                          </Typography>
                        </Box>
                      </TableCell>

                      <TableCell align="center">
                        <Button
                          size="small"
                          variant="outlined"
                          color="primary"
                          startIcon={<VisibilityOutlined />}
                          component={Link}
                          to={`/dashboard/admin-data-interface/${notice._id}`}
                        >
                          দেখুন
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}

export default AdminReview;
