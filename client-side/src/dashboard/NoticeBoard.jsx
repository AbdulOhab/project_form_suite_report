import { useState, useEffect, useContext } from "react";

import DateHandler from "./time/DateHandler";
import Pagination from "./users/usersTable/Pagination";
import BASE_URL from "../auth/dbUrl";
import TimeStartBangla from "./time/TimeStartBangla";
import TimeEndBangla from "./time/TimeEndBangla";
import DateDifferenceComponent from "./time/DateDifferenceComponent";
import convertToBengaliNumber from "./time/NumberConverter";
import { Link } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import NodataFound from "./time/NodataFound";
import { buildNoticeSlug } from "../utils/noticeSlug";

// MUI components
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import TableContainer from "@mui/material/TableContainer";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";

// MUI icons
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import EventBusyIcon from "@mui/icons-material/EventBusy";

// ---------------------------------------------------------------------------
// Role-based action buttons (icon buttons with tooltips, one per role)
// ---------------------------------------------------------------------------
const RoleActions = ({ userInfo, notice, onDelete, handleReload }) => {
  if (userInfo?.userRole === "thana") {
    return (
      <Stack direction="row" spacing={1} justifyContent="center">
        <Button
          component={Link}
          to={`notice-view/${buildNoticeSlug(notice)}`}
          state={{ id: notice?._id }}
          variant="outlined"
          size="small"
          sx={{ px: 1, minWidth: 0 }}
        >
          View
        </Button>
        <Button
          component={Link}
          to={`thana-submission/${notice?._id}`}
          variant="outlined"
          size="small"
          sx={{ px: 1, minWidth: 0 }}
        >
          Report
        </Button>
        <Button
          component={Link}
          to={`thana-submission/${notice?._id}`}
          variant="outlined"
          size="small"
          sx={{ px: 1, minWidth: 0 }}
        >
          Submission
        </Button>
      </Stack>
    );
  }

  if (userInfo?.userRole === "branch") {
    return (
      <Stack direction="row" spacing={1} justifyContent="center">
        <Button
          component={Link}
          to={`notice-view/${buildNoticeSlug(notice)}`}
          state={{ id: notice?._id }}
          variant="outlined"
          size="small"
          sx={{ px: 1, minWidth: 0 }}
        >
          View
        </Button>
        <Button
          component={Link}
          to={`branch-data-interface/${notice?._id}`}
          variant="outlined"
          size="small"
          sx={{ px: 1, minWidth: 0 }}
        >
          Report
        </Button>
      </Stack>
    );
  }

  if (userInfo?.userRole === "zonal") {
    return (
      <Stack direction="row" spacing={1} justifyContent="center">
        <Button
          component={Link}
          to={`notice-view/${buildNoticeSlug(notice)}`}
          state={{ id: notice?._id }}
          variant="outlined"
          size="small"
          sx={{ px: 1, minWidth: 0 }}
        >
          View
        </Button>
        <Button
          component={Link}
          to={`zonal-data-interface/${notice?._id}`}
          variant="outlined"
          size="small"
          sx={{ px: 1, minWidth: 0 }}
        >
          Report
        </Button>
      </Stack>
    );
  }

  if (userInfo?.userRole === "admin") {
    return (
      <Stack direction="row" spacing={1} justifyContent="center">
        <Button
          component={Link}
          to={`notice-view/${buildNoticeSlug(notice)}`}
          state={{ id: notice?._id }}
          variant="outlined"
          size="small"
          sx={{ px: 1, minWidth: 0 }}
        >
          View
        </Button>
        <Button
          component={Link}
          to={`admin-data-interface/${notice?._id}`}
          variant="outlined"
          size="small"
          sx={{ px: 1, minWidth: 0 }}
        >
          Report
        </Button>
        <Button
          component={Link}
          to={`notice-edit/${notice?._id}`}
          variant="outlined"
          size="small"
          sx={{ px: 1, minWidth: 0 }}
        >
          Edit
        </Button>
        <Button
          variant="outlined"
          color="error"
          size="small"
          onClick={(e) => onDelete(e, notice?._id)}
          sx={{ px: 1, minWidth: 0 }}
        >
          Delete
        </Button>
      </Stack>
    );
  }

  return (
    <Button
      component={Link}
      to="/dashboard"
      variant="outlined"
      size="small"
      onClick={handleReload}
      sx={{ px: 1, minWidth: 0 }}
    >
      Refresh
    </Button>
  );
};

// ---------------------------------------------------------------------------
// Notice status: "upcoming" (not started yet) / "ongoing" (within the
// submission window) / "ended" (past the deadline). Previous-report cards
// are always "ended"; active-report cards compute this live.
// ---------------------------------------------------------------------------
const STATUS_META = {
  upcoming: { chipLabel: "আপকামিং", chipColor: "warning", text: "রিপোর্ট প্রদান শুরু হতে বাকি আছে" },
  ongoing: { chipLabel: "চলমান", chipColor: "success", text: "রিপোর্ট চলছে" },
  ended: { chipLabel: "শেষ", chipColor: "error", text: "রিপোর্ট গ্রহণ শেষ" },
};

const getNoticeStatus = (notice) => {
  const now = new Date();
  const start = new Date(`${notice?.startDadeline} ${notice?.timeStart || "00:00"}`);
  const end = new Date(`${notice?.endDadeline} ${notice?.timeEnd || "23:59"}`);
  if (now < start) return "upcoming";
  if (now <= end) return "ongoing";
  return "ended";
};

// Small, inline "X দিন Y ঘণ্টা Z মিনিট বাকি" — no big colored box, sits right
// next to the status text and updates once a minute.
const InlineCountdown = ({ target }) => {
  const [remaining, setRemaining] = useState(null);

  useEffect(() => {
    if (!target) return undefined;
    const tick = () => {
      const diffMs = target.getTime() - Date.now();
      if (diffMs <= 0) {
        setRemaining(null);
        return;
      }
      setRemaining({
        days: Math.floor(diffMs / 86400000),
        hours: Math.floor((diffMs % 86400000) / 3600000),
        minutes: Math.floor((diffMs % 3600000) / 60000),
      });
    };
    tick();
    const interval = setInterval(tick, 60000);
    return () => clearInterval(interval);
  }, [target]);

  if (!remaining) return null;

  return (
    <Typography component="span" variant="caption" fontWeight={700}>
      {convertToBengaliNumber(remaining.days)} দিন {convertToBengaliNumber(remaining.hours)}{" "}
      ঘন্টা {convertToBengaliNumber(remaining.minutes)} মিনিট
    </Typography>
  );
};

// ---------------------------------------------------------------------------
// Single notice card — shared by both the "active" grid and the "previous"
// card view, so the two sections stay visually identical.
// ---------------------------------------------------------------------------
const NoticeCard = ({ notice, userInfo, status, onDelete, handleReload }) => {
  const meta = STATUS_META[status];
  const countdownTarget =
    status === "upcoming"
      ? new Date(`${notice?.startDadeline} ${notice?.timeStart || "00:00"}`)
      : status === "ongoing"
      ? new Date(`${notice?.endDadeline} ${notice?.timeEnd || "23:59"}`)
      : null;

  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardContent sx={{ flexGrow: 1, p: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
          <Typography sx={{ fontSize: "0.95rem", fontWeight: 700, lineHeight: 1.35 }}>
            {notice?.document_name}
          </Typography>
          <Chip
            size="small"
            label={meta.chipLabel}
            color={meta.chipColor}
            variant={status === "ended" ? "outlined" : "filled"}
            sx={{ flexShrink: 0 }}
          />
        </Stack>

        {notice?.sub_title && (
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
            {notice.sub_title}
          </Typography>
        )}

        <Stack spacing={0.5} sx={{ mt: 1.5 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <CalendarTodayIcon sx={{ fontSize: 14, color: "text.secondary" }} />
            <Typography variant="caption" color="text.secondary" sx={{ minWidth: 32 }}>
              শুরু
            </Typography>
            <Typography variant="caption" fontWeight={500}>
              <DateHandler startDadeline={notice?.startDadeline} />
              &nbsp;
              <TimeStartBangla notice={notice} />
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <EventBusyIcon sx={{ fontSize: 14, color: "error.main" }} />
            <Typography variant="caption" color="text.secondary" sx={{ minWidth: 32 }}>
              শেষ
            </Typography>
            <Typography variant="caption" fontWeight={500}>
              <DateHandler startDadeline={notice?.endDadeline} />
              &nbsp;
              <TimeEndBangla notice={notice} />
            </Typography>
          </Stack>
        </Stack>

        <Divider sx={{ my: 1.25 }} />

        {status === "ended" ? (
          <Typography variant="caption" fontWeight={600} sx={{ color: "error.main" }}>
            {meta.text}
          </Typography>
        ) : (
          <Typography
            variant="caption"
            fontWeight={600}
            sx={{ color: status === "upcoming" ? "warning.dark" : "success.dark" }}
          >
            {meta.text}
            {countdownTarget && (
              <>
                {" · "}
                <InlineCountdown target={countdownTarget} />
              </>
            )}
          </Typography>
        )}
      </CardContent>

      <Divider />
      <CardActions sx={{ justifyContent: "flex-end", py: 0.75 }}>
        <RoleActions
          userInfo={userInfo}
          notice={notice}
          onDelete={onDelete}
          handleReload={handleReload}
        />
      </CardActions>
    </Card>
  );
};

// ---------------------------------------------------------------------------
// NoticeBoard component
// ---------------------------------------------------------------------------
const NoticeBoard = () => {
  const { userInfo } = useContext(AuthContext);

  // data & pagination state
  const [noticeData, setNoticeData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [noticePerPage, setNoticePerPage] = useState(20);
  const [total, setTotal] = useState(0);

  // view-mode toggle (previous vs active report)
  const [validCardView, setValidCardView] = useState(true);
  const [validTableView, setValidTableView] = useState(false);

  // delete-confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  // snackbar state
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  // ---- Data fetching (identical API call) ----
  useEffect(() => {
    const getNoticeData = async () => {
      try {
        const response = await fetch(`${BASE_URL}/all-notice`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + window.localStorage.getItem("gsmToken"),
          },
          body: JSON.stringify({
            page: currentPage,
            limit: validCardView ? 6 : noticePerPage,
            // Omitted (undefined) for the combined "রিপোর্ট" tab so the
            // backend returns active + previous together; explicit false
            // for "পূর্বের রিপোর্ট" to get only ended reports.
            systemViews: validCardView ? undefined : false,
          }),
        });
        const data = await response.json();

        if (response.ok) {
          setNoticeData(data?.data);
          setCurrentPage(data?.page);
          if (!validCardView) setNoticePerPage(data?.limit);
          setTotal(data?.total);
        } else {
          throw new Error("Failed to fetch");
        }
      } catch (error) {
        console.error("Error fetching notice data:", error);
      }
    };

    getNoticeData();
  }, [currentPage, noticePerPage, validCardView]);

  // ---- Handlers ----

  const validCardData = (endDadeline) => {
    const currentDate = new Date();
    const endDadelineDate = new Date(endDadeline);
    const timeDiff = endDadelineDate - currentDate;
    const diffInDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    return diffInDays;
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const indexOfLastNotice = currentPage * noticePerPage;
  const indexOfFirstNotice = indexOfLastNotice - noticePerPage;

  // Switch between "Previous Reports" and "Active Reports" tabs
  const handleReportToggle = (event, newValue) => {
    if (newValue === "previous") {
      setValidTableView(true);
      setValidCardView(false);
    } else {
      setValidCardView(true);
      setValidTableView(false);
    }
  };

  // Delete flow
  const deleteItem = (e, id) => {
    e.preventDefault();
    setDeleteTargetId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setDeleteDialogOpen(false);
    const id = deleteTargetId;

    const response = await fetch(`${BASE_URL}/delete-notice/${id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + window.localStorage.getItem("gsmToken"),
      },
    });
    await response.json();
    if (response.ok) {
      const updatedNoticeData = noticeData.filter((item) => item?._id !== id);
      setNoticeData(updatedNoticeData);
      setSnackbar({ open: true, message: "নোটিশ মুছে ফেলা হয়েছে।", severity: "success" });
    } else {
      setSnackbar({ open: true, message: "নোটিশ মুছে ফেলা যায়নি।", severity: "error" });
    }
    setDeleteTargetId(null);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setDeleteTargetId(null);
  };

  const handleReload = (event) => {
    event.preventDefault();
    window.location.reload();
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const paginationBar = (
    <Stack direction="row" justifyContent="flex-end" sx={{ mt: 3 }}>
      <Pagination
        usersPerPage={noticePerPage}
        totalUsers={total}
        paginate={paginate}
        currentPage={currentPage}
      />
    </Stack>
  );

  // ===================== RENDER =====================
  return (
    <>
      <Box sx={{ minHeight: "75vh" }}>
        {/* ---- Page header ---- */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" fontWeight={700}>
            Instance Report
          </Typography>
        </Box>

        {/* ---- Report type tabs ---- */}
        <Tabs
          value={validTableView ? "previous" : "active"}
          onChange={handleReportToggle}
          sx={{ mb: 3, borderBottom: 1, borderColor: "divider" }}
        >
          <Tab value="active" label="রিপোর্ট" />
          <Tab value="previous" label="পূর্বের রিপোর্ট" />
        </Tabs>

        {/* ====== Previous Reports section ====== */}
        {validTableView && (
          <>
            {noticeData?.length ? (
              <>
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow sx={{ "& th": { fontWeight: 700, bgcolor: "action.hover" } }}>
                        <TableCell align="center">ক্রম</TableCell>
                        <TableCell align="center">নোটিশ</TableCell>
                        <TableCell align="center">নোটিশের সময়সীমা</TableCell>
                        <TableCell align="center">কার্যকর নয়</TableCell>
                        <TableCell align="center">একশন</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {noticeData.map((notice, index) => (
                        <TableRow key={index} hover>
                          <TableCell align="center">
                            {indexOfFirstNotice + index + 1}
                          </TableCell>
                          <TableCell align="center">{notice?.document_name}</TableCell>
                          <TableCell align="center">
                            <DateDifferenceComponent
                              startDadeline={notice?.startDadeline}
                              endDadeline={notice?.endDadeline}
                              range={notice?.range}
                              timeStart={notice?.timeStart}
                              timeEnd={notice?.timeEnd}
                            />
                            <DateHandler startDadeline={notice?.startDadeline} /> থেকে{" "}
                            <DateHandler startDadeline={notice?.endDadeline} />
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="body2" color="error.main" fontWeight={600}>
                              {convertToBengaliNumber(
                                Math.abs(validCardData(notice?.endDadeline))
                              )}{" "}
                              দিন
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <RoleActions
                              userInfo={userInfo}
                              notice={notice}
                              onDelete={deleteItem}
                              handleReload={handleReload}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                {paginationBar}
              </>
            ) : (
              <Box sx={{ py: 4, px: 3, textAlign: "center" }}>
                <Box sx={{ maxWidth: 700, mx: "auto" }}>
                  <NodataFound message="কোনো পূর্বের রিপোর্ট পাওয়া যায়নি।" />
                </Box>
                <Button
                  variant="contained"
                  onClick={() => {
                    setValidCardView(true);
                    setValidTableView(false);
                  }}
                  sx={{ mt: 3 }}
                >
                  চলমান রিপোর্ট দেখতে ক্লিক করুন
                </Button>
              </Box>
            )}
          </>
        )}

        {/* ====== Active / Current Reports section ====== */}
        {validCardView && (
          <>
            {noticeData?.length ? (
              <>
                <Grid container spacing={3}>
                  {noticeData.map((notice, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <NoticeCard
                        notice={notice}
                        userInfo={userInfo}
                        status={getNoticeStatus(notice)}
                        onDelete={deleteItem}
                        handleReload={handleReload}
                      />
                    </Grid>
                  ))}
                </Grid>
              </>
            ) : (
              <Box sx={{ py: 4, px: 3, textAlign: "center" }}>
                <Box sx={{ maxWidth: 700, mx: "auto" }}>
                  <NodataFound message="চলমান কোনো রিপোর্ট নেই।" />
                </Box>
              </Box>
            )}
          </>
        )}
      </Box>

      {/* ---- Delete confirmation dialog ---- */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>আপনি কি নিশ্চিত?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            এই নোটিশটি মুছে ফেলতে চান? এটি পূর্বাবস্থায় ফেরানো যাবে না।
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>বাতিল</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            মুছে ফেলুন
          </Button>
        </DialogActions>
      </Dialog>

      {/* ---- Snackbar for success/error notifications ---- */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default NoticeBoard;
