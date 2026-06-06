import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import BASE_URL from "../../../auth/dbUrl";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import LockIcon from "@mui/icons-material/Lock";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { ArrowBack, InfoOutlined } from "@mui/icons-material";
import DateDifferenceComponent from "../../time/DateDifferenceComponent";
import convertToBengaliNumber from "../../time/NumberConverter";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import Loader from "../../time/Loader";

const SumsAllThanaData = () => {
  const { qId } = useParams();
  const [notice, setNotice] = useState("");
  const [totalData, setTotalData] = useState();
  const [questions, setQuestions] = useState();
  const [sumsThanaData, setSumsThanaData] = useState();
  const [currentPage, setCurrentPage] = useState(1);
  const [descriptionAlert, setDescriptionAlert] = useState(false);
  const [usersPerPage, setUsersPerPage] = useState(25);
  const [search, setSearch] = useState("");
  const [originalData, setOriginalData] = useState([]);

  useEffect(() => {
    const sumsthanadata = async () => {
      try {
        const response = await fetch(`${BASE_URL}/sums-thana-data/${qId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + window.localStorage.getItem("gsmToken"),
          },
        });
        const data = await response.json();

        if (response.ok) {
          setNotice(data.question);
          setQuestions(data?.question?.questions);
          setTotalData(data?.sumsArray);
          setSumsThanaData(data?.sumsThanaData);
          setOriginalData(data?.sumsThanaData || []);
        } else {
          return console.log("Failed to fetch");
        }
      } catch (error) {
        // Handle error
        console.error("Error fetching notice data:", error);
      }
    };
    sumsthanadata();
  }, [qId]);

  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });

  // console.log(branchData);
  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const sortedData = useMemo(() => {
    let sortableData = Array.isArray(sumsThanaData) ? [...sumsThanaData] : [];
    if (sortConfig.key !== null) {
      sortableData.sort((a, b) => {
        let aValue, bValue;

        // Check if sorting key is a predefined column or dynamic question
        if (sortConfig.key === "branchCode" || sortConfig.key === "userName") {
          aValue = a[sortConfig.key];
          bValue = b[sortConfig.key];
        } else {
          // Sort by question values dynamically
          aValue = a[sortConfig.key] || 0; // Default to 0 if key doesn't exist
          bValue = b[sortConfig.key] || 0;
        }

        // Handle numeric sorting
        if (!isNaN(aValue) && !isNaN(bValue)) {
          return sortConfig.direction === "ascending"
            ? aValue - bValue
            : bValue - aValue;
        }

        // Handle string sorting
        if (typeof aValue === "string" && typeof bValue === "string") {
          return sortConfig.direction === "ascending"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        return 0; // Default case for undefined or mixed data
      });
    }

    return sortableData;
  }, [sumsThanaData, sortConfig]);

  const descriptionHandler = () => {
    setDescriptionAlert(true);
  };
  const descriptionCloserHandler = () => {
    setDescriptionAlert(false);
  };
  const selectHandler = (event) => {
    setUsersPerPage(Number(event.target.value));
    setCurrentPage(1); // Reset to the first page
  };

  // Calculate paginated data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * usersPerPage;
    const endIndex = startIndex + usersPerPage;
    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, currentPage, usersPerPage]);

  // handle search data
  useEffect(() => {
    const searchHandler = () => {
      if (!search.trim()) {
        setSumsThanaData(originalData); // Reset if search is empty
        return;
      }
      const filteredData = originalData?.filter(
        (data) =>
          data?.userName?.toLowerCase().includes(search.toLowerCase()) ||
          data?.thanaCode === Number(search)
      );
      setCurrentPage(1); // Reset to first page
      setSumsThanaData(filteredData);
    };
    searchHandler();
  }, [search, originalData]);

  const validCardData = (endDadeline) => {
    const currentDate = new Date();
    const endDadelineDate = new Date(endDadeline);

    const timeDiff = endDadelineDate - currentDate;
    const diffInDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    return diffInDays;
  };

  const exportToExcel = () => {
    // Define headers excluding "Action"
    const headers = [
      "Thana Code",
      "Thana Name",
      ...questions.map((q) => q.questionText),
    ];

    // Extract table data excluding "Action" column
    const data = paginatedData.map((thana) => [
      thana.thanaCode,
      thana.userName,
      ...questions.map((q) => thana[q.questionText] || 0),
    ]);

    // Add total row (excluding "Action")
    const totalRow = ["Total", "", ...totalData.map((value) => value || 0)];
    data.unshift(totalRow); // Insert at the top

    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);

    // Create workbook and add worksheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Thana Data");

    // Save file
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, "ThanaData.xlsx");
  };

  const exportToExcelByTotal = () => {
    // Define headers excluding "Action"
    const headers = [
      "Thana Code",
      "Thana Name",
      ...questions.map((q) => q.questionText),
    ];

    // Extract table data excluding "Action" column
    const data = sortedData.map((thana) => [
      thana.thanaCode,
      thana.userName,
      ...questions.map((q) => thana[q.questionText] || 0),
    ]);

    // Add total row (excluding "Action")
    const totalRow = ["Total", "", ...totalData.map((value) => value || 0)];
    data.unshift(totalRow); // Insert at the top

    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);

    // Create workbook and add worksheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Thana Data");

    // Save file
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, "ThanaData.xlsx");
  };

  const totalPages = Math.ceil(sortedData.length / usersPerPage);
  const visiblePages = 5; // Set max visible pages

  const getPageNumbers = () => {
    if (totalPages <= visiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages = new Set([1, totalPages]); // Always show first and last page

    if (currentPage > 2) pages.add(currentPage - 1); // Show previous page
    pages.add(currentPage); // Show current page
    if (currentPage < totalPages - 1) pages.add(currentPage + 1); // Show next page

    return [...pages].sort((a, b) => a - b);
  };

  const pages = getPageNumbers();

  const sortIndicator = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "ascending" ? " ▲" : " ▼";
  };

  return (
    <Box sx={{ px: { xs: 1, sm: 2, md: 3 }, py: 2 }}>
      {/* Description Dialog */}
      <Dialog
        open={descriptionAlert}
        onClose={descriptionCloserHandler}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: "flex", justifyContent: "flex-end", p: 1 }}>
          <IconButton onClick={descriptionCloserHandler}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography>{notice?.doc_desc}</Typography>
        </DialogContent>
      </Dialog>

      {/* Compact top bar */}
      <Box sx={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        mb: 1, flexWrap: "wrap", gap: 1
      }}>
        <Button
          component={Link}
          to={`/dashboard/admin-data-interface/${qId}`}
          size="small"
          startIcon={<ArrowBack />}
          variant="text"
          sx={{ fontWeight: 600 }}
        >
          ফিরে যান
        </Button>
        <Box sx={{ textAlign: "center", flex: 1 }}>
          <Typography variant="h6" fontWeight="bold">{notice?.document_name}</Typography>
          {notice?.sub_title && (
            <Typography variant="caption" color="text.secondary">{notice.sub_title}</Typography>
          )}
        </Box>
        <Button
          size="small"
          startIcon={<InfoOutlined />}
          variant="outlined"
          onClick={() => setDescriptionAlert(true)}
          sx={{ fontWeight: 600 }}
        >
          বিবরণ
        </Button>
      </Box>

      {/* Compact timer */}
      <Box sx={{ mb: 2 }}>
        {validCardData(notice?.endDadeline) < 0 ? (
          <Chip
            color="error"
            variant="outlined"
            size="small"
            label={`নোটিশ প্রদানের সময় শেষ হয়েছে ${convertToBengaliNumber(Math.abs(validCardData(notice?.endDadeline)))} দিন পূর্বে`}
            sx={{ fontWeight: "bold" }}
          />
        ) : (
          <DateDifferenceComponent
            startDadeline={notice?.startDadeline}
            range={notice?.range}
            timeStart={notice?.timeStart}
            timeEnd={notice?.timeEnd}
            endDadeline={notice?.endDadeline}
          />
        )}
      </Box>

      {/* Table card */}
      <Paper elevation={0} sx={{ borderRadius: 2, border: "1px solid", borderColor: "divider", overflow: "hidden" }}>
        <Box sx={{
          px: 2, py: 1.5, bgcolor: "grey.50", borderBottom: "1px solid", borderColor: "divider",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: 1
        }}>
          <Typography variant="subtitle2" fontWeight={600} color="text.secondary">থানা সারসংক্ষেপ</Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
            <FormControl size="small" sx={{ minWidth: 100 }}>
              <InputLabel>Rows</InputLabel>
              <Select value={usersPerPage} onChange={selectHandler} label="Rows">
                <MenuItem value={25}>25</MenuItem>
                <MenuItem value={Math.ceil(sortedData?.length / 16 || 0)}>
                  {Math.ceil(sortedData?.length / 16 || 0)}
                </MenuItem>
                <MenuItem value={Math.ceil(sortedData?.length / 8 || 0)}>
                  {Math.ceil(sortedData?.length / 8 || 0)}
                </MenuItem>
                <MenuItem value={Math.ceil(sortedData?.length / 4 || 0)}>
                  {Math.ceil(sortedData?.length / 4 || 0)}
                </MenuItem>
                <MenuItem value={Math.ceil(sortedData?.length / 2 || 0)}>
                  {Math.ceil(sortedData?.length / 2 || 0)}
                </MenuItem>
                <MenuItem value={Math.ceil(sortedData?.length || 0)}>
                  {Math.ceil(sortedData?.length || 0)}
                </MenuItem>
              </Select>
            </FormControl>
            <Button
              size="small"
              variant="contained"
              startIcon={<FileDownloadIcon />}
              onClick={exportToExcel}
            >
              Export This Page
            </Button>
            <Button
              size="small"
              variant="outlined"
              startIcon={<FileDownloadIcon />}
              onClick={exportToExcelByTotal}
            >
              Export Total Thana Data
            </Button>
            <TextField
              size="small"
              label="Search..."
              variant="outlined"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ minWidth: 160 }}
            />
          </Box>
        </Box>
        <Box sx={{ p: 1 }}>
          {/* Table */}
          {paginatedData.length ? (
            <>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow
                      sx={{
                        bgcolor: "primary.main",
                        "& th": {
                          color: "white",
                          fontWeight: "bold",
                          cursor: "pointer",
                        },
                      }}
                    >
                      <TableCell onClick={() => handleSort("thanaCode")}>
                        Thana Code{sortIndicator("thanaCode")}
                      </TableCell>
                      <TableCell onClick={() => handleSort("userName")}>
                        Thana Name{sortIndicator("userName")}
                      </TableCell>
                      {questions?.map((question, index) => (
                        <TableCell
                          key={index}
                          onClick={() => handleSort(question.questionText)}
                        >
                          {question?.questionText}
                          {sortIndicator(question.questionText)}
                        </TableCell>
                      ))}
                      <TableCell>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {/* Total Row */}
                    <TableRow
                      sx={{
                        bgcolor: "primary.main",
                        "& th, & td": { color: "white", fontWeight: "bold" },
                      }}
                    >
                      <TableCell
                        colSpan={2}
                        sx={{ color: "white", fontWeight: "bold" }}
                      >
                        Total
                      </TableCell>
                      {totalData?.length > 0 ? (
                        totalData?.map((element, index) => (
                          <TableCell
                            sx={{ color: "white", fontWeight: "bold" }}
                            key={index}
                          >
                            {element ? element[index] : 0}
                          </TableCell>
                        ))
                      ) : (
                        <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                          0
                        </TableCell>
                      )}
                      <TableCell>
                        <LockIcon sx={{ color: "error.main" }} />
                      </TableCell>
                    </TableRow>

                    {/* Data Rows */}
                    {paginatedData.map((thana, thanaIndex) => (
                      <TableRow
                        key={thanaIndex}
                        hover
                        sx={{ "&:hover": { bgcolor: "action.hover" } }}
                      >
                        <TableCell sx={{ textAlign: "center" }}>
                          {thana.thanaCode}
                        </TableCell>
                        <TableCell sx={{ textAlign: "center" }}>
                          {thana.userName}
                        </TableCell>
                        {questions?.map((question, qIndex) => (
                          <TableCell
                            key={`${thanaIndex}-${qIndex}`}
                            sx={{ textAlign: "center" }}
                          >
                            {thana?.[question.questionText] || 0}
                          </TableCell>
                        ))}
                        <TableCell sx={{ textAlign: "center" }}>
                          <IconButton
                            component={Link}
                            to={`/dashboard/sums-Totol-day-thana-data/${qId}/${thana?.zonalCode}/${thana?.branchCode}/${thana.thanaCode}`}
                            color="primary"
                            size="small"
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Pagination Info & Controls */}
              <Box sx={{ mt: 2 }}>
                <Paper variant="outlined" sx={{ p: 1, mb: 1 }}>
                  <Typography variant="body2" sx={{ color: "primary.main" }}>
                    Total: {sortedData?.length}
                    <Typography component="span" sx={{ mx: 1 }}>|</Typography>
                    {paginatedData.length} of {sortedData?.length}
                    <Typography component="span" sx={{ mx: 1 }}>|</Typography>
                    Page {currentPage} of{" "}
                    {Math.ceil(sortedData?.length / usersPerPage || 0)}
                  </Typography>
                </Paper>

                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <Button
                    size="small"
                    variant="outlined"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    Previous
                  </Button>

                  {pages.map((page, index, arr) => (
                    <React.Fragment key={page}>
                      {index > 0 && page !== arr[index - 1] + 1 && (
                        <Button size="small" disabled>
                          ...
                        </Button>
                      )}
                      <Button
                        size="small"
                        variant={currentPage === page ? "contained" : "outlined"}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Button>
                    </React.Fragment>
                  ))}

                  <Button
                    size="small"
                    variant="outlined"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    Next
                  </Button>
                </Stack>
              </Box>
            </>
          ) : (
            <Loader />
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default SumsAllThanaData;
