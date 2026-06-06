import { useState, useEffect, useContext } from "react";

import TimeDifference from "./time/TimeDifference";
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

// MUI components
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import MenuItem from "@mui/material/MenuItem";
import Chip from "@mui/material/Chip";
import InputAdornment from "@mui/material/InputAdornment";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";

// MUI icons
import SearchIcon from "@mui/icons-material/Search";
import ViewListIcon from "@mui/icons-material/ViewList";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import RefreshIcon from "@mui/icons-material/Refresh";
import ContactPageIcon from "@mui/icons-material/ContactPage";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import Divider from "@mui/material/Divider";

// ---------------------------------------------------------------------------
// Role-based action buttons (extracted from 3 repeated blocks in original)
// ---------------------------------------------------------------------------
const RoleActions = ({ userInfo, notice, onDelete, handleReload }) => {
  // thana role: disabled view link + submission link
  if (userInfo?.userRole === "thana") {
    return (
      <Box sx={{ display: "flex", gap: 1, alignItems: "center", justifyContent: "center" }}>
        {/* thana: view notice answer (disabled in active/validCard view context) */}
        <IconButton
          component={Link}
          to={`notice-answer/${notice?._id}`}
          color="primary"
          disabled
          size="small"
        >
          <VisibilityIcon />
        </IconButton>
        {/* thana: submission */}
        <IconButton
          component={Link}
          to={`thana-submission/${notice?._id}`}
          color="primary"
          size="small"
        >
          <ContactPageIcon />
        </IconButton>
      </Box>
    );
  }

  // branch role: view link
  if (userInfo?.userRole === "branch") {
    return (
      <IconButton
        component={Link}
        to={`branch-data-interface/${notice?._id}`}
        color="primary"
        size="small"
      >
        <VisibilityIcon />
      </IconButton>
    );
  }

  // zonal role: view link
  if (userInfo?.userRole === "zonal") {
    return (
      <IconButton
        component={Link}
        to={`zonal-data-interface/${notice?._id}`}
        color="primary"
        size="small"
      >
        <VisibilityIcon />
      </IconButton>
    );
  }

  // admin role: view + edit + delete
  if (userInfo?.userRole === "admin") {
    return (
      <Box sx={{ display: "flex", gap: 0.5 }}>
        <IconButton
          component={Link}
          to={`admin-data-interface/${notice?._id}`}
          color="primary"
          size="small"
        >
          <VisibilityIcon />
        </IconButton>
        <IconButton
          component={Link}
          to={`notice-edit/${notice?._id}`}
          color="primary"
          size="small"
        >
          <EditIcon />
        </IconButton>
        <IconButton
          color="error"
          size="small"
          onClick={(e) => onDelete(e, notice?._id)}
        >
          <DeleteIcon />
        </IconButton>
      </Box>
    );
  }

  // fallback / unknown role: refresh
  return (
    <IconButton
      component={Link}
      to="/dashboard"
      color="primary"
      size="small"
      onClick={handleReload}
    >
      <RefreshIcon />
    </IconButton>
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

  // view-mode toggles (previous vs active report, and table vs card)
  const [validCardView, setValidCardView] = useState(true);
  const [validTableView, setValidTableView] = useState(false);
  const [noticeCardView, setNoticeCardView] = useState(false);
  const [noticeTableView, setNoticeTableView] = useState(true);

  // search
  const [searchData, setSearchData] = useState("");

  // delete-confirmation dialog state (replaces Swal.fire)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  // snackbar state (replaces Swal.fire success / SweetAlert error)
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
            query: searchData,
            page: currentPage,
            limit: noticePerPage,
            systemViews: validCardView ? true : false,
          }),
        });
        const data = await response.json();

        if (response.ok) {
          setNoticeData(data?.data);
          setCurrentPage(data?.page);
          setNoticePerPage(data?.limit);
          setTotal(data?.total);
        } else {
          throw new Error("Failed to fetch");
        }
      } catch (error) {
        console.error("Error fetching notice data:", error);
      }
    };

    getNoticeData();
  }, [searchData, currentPage, noticePerPage, validCardView]);

  // ---- Handlers ----

  const selectHandler = (e) => {
    e.preventDefault();
    setNoticePerPage(parseInt(e.target.value, 10));
    setCurrentPage(1);
  };

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

  // Toggle between "Previous Reports" and "Active Reports"
  const handleReportToggle = (event, newView) => {
    if (newView === null) return; // ToggleButtonGroup: clicking same button de-selects; ignore
    if (newView === "previous") {
      setValidTableView(true);
      setValidCardView(false);
    } else {
      // "active"
      setValidCardView(true);
      setValidTableView(false);
    }
  };

  // Toggle between table and card view within previous reports
  const handleViewToggle = (event, newView) => {
    if (newView === null) return;
    if (newView === "table") {
      setNoticeTableView(true);
      setNoticeCardView(false);
    } else {
      setNoticeCardView(true);
      setNoticeTableView(false);
    }
  };

  // Delete flow: open dialog instead of Swal.fire
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

  // Rows-per-page options (matching original <select> logic)
  const rowsPerPageOptions = [
    20,
    ...(total > 0
      ? [
          Math.ceil(total / 16),
          Math.ceil(total / 8),
          Math.ceil(total / 4),
          Math.ceil(total / 2),
          Math.ceil(total),
        ]
      : []),
  ].filter((v, i, arr) => arr.indexOf(v) === i && v > 0); // deduplicate & remove zeros

  // ===================== RENDER =====================
  return (
    <>
      <Paper elevation={0} sx={{ borderRadius: 0, minHeight: "75vh" }}>
        {/* Mobile-only header */}
        <Box
          sx={{
            display: { xs: "block", lg: "none" },
            my: 3,
            textAlign: "center",
          }}
        >
          <Chip
            label="রিপোর্ট সেন্টারে আপনাকে স্বাগতম"
            color="primary"
            sx={{ fontWeight: "bold", fontSize: "1.1rem", px: 2, py: 2.5 }}
          />
        </Box>

        {/* ---- Header bar: report toggle + search ---- */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
            flexWrap: "wrap",
            px: 2,
            py: 2,
            mt: 1,
          }}
        >
          {/* Previous / Active report toggle */}
          <ToggleButtonGroup
            value={validTableView ? "previous" : "active"}
            exclusive
            onChange={handleReportToggle}
            size="small"
          >
            <ToggleButton value="previous" sx={{ fontWeight: "bold" }}>
              পূর্বের রিপোর্ট
            </ToggleButton>
            <ToggleButton value="active" sx={{ fontWeight: "bold" }}>
              চলমান রিপোর্ট
            </ToggleButton>
          </ToggleButtonGroup>

          {/* Search field */}
          <TextField
            size="small"
            placeholder="Search for..."
            value={searchData}
            onChange={(e) => setSearchData(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 220 }}
          />
        </Box>

        {/* ---- Main content ---- */}
        <Box sx={{ px: { xs: 2, sm: 3, md: 5 }, mt: 3, pb: 6 }}>
          {/* ====== Previous Reports section ====== */}
          {validTableView && (
            <>
              {/* Top bar: rows-per-page select, title, view toggle */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3,
                  flexWrap: "wrap",
                  gap: 1,
                }}
              >
                {/* Rows per page select */}
                <FormControl size="small" sx={{ minWidth: 100 }}>
                  <InputLabel id="previous-rows-label">Rows</InputLabel>
                  <Select
                    labelId="previous-rows-label"
                    value={noticePerPage}
                    label="Rows"
                    onChange={selectHandler}
                  >
                    {rowsPerPageOptions.map((opt) => (
                      <MenuItem key={opt} value={opt}>
                        {opt}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Section title */}
                <Chip
                  label="পূর্বের রিপোর্ট"
                  color="info"
                  sx={{ fontWeight: "bold", fontSize: "1rem" }}
                />

                {/* Table / Card view toggle */}
                <ToggleButtonGroup
                  value={noticeTableView ? "table" : "card"}
                  exclusive
                  onChange={handleViewToggle}
                  size="small"
                >
                  <ToggleButton value="table">
                    <ViewListIcon />
                  </ToggleButton>
                  <ToggleButton value="card">
                    <ViewModuleIcon />
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>

              {noticeData?.length ? (
                <>
                  {/* ---- Table view for previous reports ---- */}
                  {noticeTableView && (
                    <Paper variant="outlined">
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell align="center">ক্রম</TableCell>
                            <TableCell align="center">নোটিশ</TableCell>
                            <TableCell align="center">নোটিশের সময়সীমা</TableCell>
                            <TableCell align="center">কার্যকর নয়</TableCell>
                            <TableCell align="center">একশন</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {noticeData.map((notice, index) => (
                            <TableRow key={index}>
                              <TableCell align="center">
                                {indexOfFirstNotice + index + 1}
                              </TableCell>
                              <TableCell align="center">
                                {notice?.document_name}
                              </TableCell>
                              <TableCell align="center">
                                <DateDifferenceComponent
                                  startDadeline={notice?.startDadeline}
                                  endDadeline={notice?.endDadeline}
                                  range={notice?.range}
                                  timeStart={notice?.timeStart}
                                  timeEnd={notice?.timeEnd}
                                />
                                <DateHandler startDadeline={notice?.startDadeline} />{" "}
                                থেকে{" "}
                                <DateHandler startDadeline={notice?.endDadeline} />
                              </TableCell>
                              <TableCell align="center">
                                {convertToBengaliNumber(
                                  Math.abs(validCardData(notice?.endDadeline))
                                )}{" "}
                                দিন
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
                    </Paper>
                  )}

                  {/* ---- Card view for previous reports ---- */}
                  {noticeCardView && (
                    <Grid container spacing={4}>
                      {noticeData.map((notice, index) => (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                          <Card variant="outlined" sx={{ p: 2 }}>
                            <CardContent>
                              <Typography
                                variant="h6"
                                align="center"
                                gutterBottom
                              >
                                {notice?.document_name}
                              </Typography>
                              <Typography variant="body2" sx={{ my: 1 }}>
                                রিপোর্ট শুরু:{" "}
                                <DateHandler startDadeline={notice?.startDadeline} />
                                &nbsp;&nbsp;
                                <TimeStartBangla notice={notice} />
                              </Typography>
                              <Typography variant="body2" sx={{ my: 1 }}>
                                রিপোর্ট শেষ:{" "}
                                <DateHandler startDadeline={notice?.endDadeline} />
                                &nbsp;&nbsp;
                                <TimeEndBangla notice={notice} />
                              </Typography>
                              <Paper
                                variant="outlined"
                                sx={{
                                  p: 1,
                                  textAlign: "center",
                                  color: "error.main",
                                  fontWeight: "bold",
                                  mt: 1,
                                }}
                              >
                                কার্যকর নয়{" "}
                                {convertToBengaliNumber(
                                  Math.abs(validCardData(notice?.endDadeline))
                                )}
                                দিন
                              </Paper>
                            </CardContent>
                            <CardActions sx={{ justifyContent: "center", mt: 1 }}>
                              <RoleActions
                                userInfo={userInfo}
                                notice={notice}
                                onDelete={deleteItem}
                                handleReload={handleReload}
                              />
                            </CardActions>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  )}

                  {/* ---- Pagination ---- */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mt: 3,
                      mb: 4,
                      flexWrap: "wrap",
                      gap: 2,
                    }}
                  >
                    <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1 }}>
                      <Typography variant="body2">
                        Showing {noticeData.length} of {total} users
                      </Typography>
                    </Paper>
                    <Pagination
                      usersPerPage={noticePerPage}
                      totalUsers={total}
                      paginate={paginate}
                      currentPage={currentPage}
                    />
                  </Box>
                </>
              ) : (
                /* ---- Empty state for previous reports ---- */
                <Box sx={{ py: 4, px: 3, textAlign: "center" }}>
                  <Box sx={{ maxWidth: 700, mx: "auto" }}>
                    <NodataFound
                      message="কোনো পূর্বের রিপোর্ট পাওয়া যায়নি।"
                    />
                  </Box>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => {
                      setValidCardView(true);
                      setValidTableView(false);
                    }}
                    sx={{ mt: 3, mb: 2 }}
                  >
                    চলমান রিপোর্ট দেখতে ক্লিক করুন
                  </Button>
                </Box>
              )}
            </>
          )}

          {/* ====== Active / Current Reports section (চলমান রিপোর্ট) ====== */}
          {validCardView && (
            <>
              {noticeData?.length ? (
                <Box>
                  {/* Top bar: rows-per-page select + title */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      pb: 5,
                      pt: 2,
                      flexWrap: "wrap",
                      gap: 1,
                    }}
                  >
                    <FormControl size="small" sx={{ minWidth: 100 }}>
                      <InputLabel id="active-rows-label">Rows</InputLabel>
                      <Select
                        labelId="active-rows-label"
                        value={noticePerPage}
                        label="Rows"
                        onChange={selectHandler}
                      >
                        {rowsPerPageOptions.map((opt) => (
                          <MenuItem key={opt} value={opt}>
                            {opt}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <Chip
                      label="চলমান রিপোর্ট"
                      color="info"
                      sx={{ fontWeight: "bold", fontSize: "1rem" }}
                    />
                  </Box>

                  {/* Card grid for active reports */}
                  <Grid container spacing={4}>
                    {noticeData?.map((notice, index) => (
                      <Grid item xs={12} sm={6} md={6} key={index}>
                        <Card
                          sx={{
                            borderRadius: 3,
                            overflow: "hidden",
                            border: "1px solid",
                            borderColor: "divider",
                            boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
                            transition: "box-shadow 0.2s, transform 0.2s",
                            "&:hover": {
                              boxShadow: "0 6px 24px rgba(0,0,0,0.13)",
                              transform: "translateY(-2px)",
                            },
                          }}
                        >
                          {/* Accent top bar */}
                          <Box sx={{ height: 6, bgcolor: "#0097a7" }} />

                          <CardContent sx={{ px: 3, pt: 2.5, pb: 1 }}>
                            {/* Title */}
                            <Typography
                              variant="h5"
                              align="center"
                              fontWeight="bold"
                              color="text.primary"
                              gutterBottom
                              sx={{ lineHeight: 1.4 }}
                            >
                              {notice?.document_name}
                            </Typography>

                            {/* Sub title */}
                            {notice?.sub_title && (
                              <Typography
                                variant="caption"
                                align="center"
                                display="block"
                                color="text.secondary"
                                sx={{ mb: 1 }}
                              >
                                {notice.sub_title}
                              </Typography>
                            )}

                            <Divider sx={{ my: 1.5 }} />

                            {/* Date range rows */}
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.8 }}>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <CalendarMonthIcon fontSize="small" sx={{ color: "text.secondary", flexShrink: 0 }} />
                                <Typography variant="body2" color="text.secondary" sx={{ minWidth: 80 }}>
                                  রিপোর্ট শুরু:
                                </Typography>
                                <Typography variant="body2" fontWeight="medium">
                                  <DateHandler startDadeline={notice?.startDadeline} />
                                  &nbsp;
                                  <TimeStartBangla notice={notice} />
                                </Typography>
                              </Box>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <CalendarMonthIcon fontSize="small" sx={{ color: "error.main", flexShrink: 0 }} />
                                <Typography variant="body2" color="text.secondary" sx={{ minWidth: 80 }}>
                                  রিপোর্ট শেষ:
                                </Typography>
                                <Typography variant="body2" fontWeight="medium">
                                  <DateHandler startDadeline={notice?.endDadeline} />
                                  &nbsp;
                                  <TimeEndBangla notice={notice} />
                                </Typography>
                              </Box>
                            </Box>

                            {/* Countdown timer */}
                            <Box sx={{ mt: 2 }}>
                              <TimeDifference notice={notice} />
                            </Box>
                          </CardContent>

                          <Divider />

                          <CardActions sx={{ justifyContent: "center", py: 1.5 }}>
                            <RoleActions
                              userInfo={userInfo}
                              notice={notice}
                              onDelete={deleteItem}
                              handleReload={handleReload}
                            />
                          </CardActions>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>

                  {/* ---- Pagination ---- */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mt: 3,
                      mb: 4,
                      flexWrap: "wrap",
                      gap: 2,
                    }}
                  >
                    <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1 }}>
                      <Typography variant="body2">
                        Showing {noticeData.length} of {total} users
                      </Typography>
                    </Paper>
                    <Pagination
                      usersPerPage={noticePerPage}
                      totalUsers={total}
                      paginate={paginate}
                      currentPage={currentPage}
                    />
                  </Box>
                </Box>
              ) : (
                /* ---- Empty state for active reports ---- */
                <Box sx={{ py: 4, px: 3, textAlign: "center" }}>
                  <Box sx={{ maxWidth: 700, mx: "auto" }}>
                    <NodataFound
                      message="চলমান কোনো রিপোর্ট নেই।"
                    />
                  </Box>
                </Box>
              )}
            </>
          )}
        </Box>
      </Paper>

      {/* ---- Delete confirmation dialog (replaces Swal.fire) ---- */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>আপনি কি নিশ্চিত?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            এই নোটিশটি মুছে ফেলতে চান? এটি পূর্বাবস্থায় ফেরানো যাবে না।
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            বাতিল
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            মুছে ফেলুন
          </Button>
        </DialogActions>
      </Dialog>

      {/* ---- Snackbar for success/error notifications (replaces Swal.fire / SweetAlert) ---- */}
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
