import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import BASE_URL from "../../../auth/dbUrl";
import {
  Box,
  Button,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { ArrowBack } from "@mui/icons-material";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import Loader from "../../time/Loader";
import { buildNoticeSlug } from "../../../utils/noticeSlug";

const SumsAllBranchData = () => {
  const location = useLocation();
  const id = location.state?.id;

  const [data, setData] = useState({
    tempBranchData: [],
    totalData: [],
    questions: [],
    notice: [],
  });
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });

  // Fetch all branches sum data
  useEffect(() => {
    if (!id) return;

    const getAllBranches = async () => {
      try {
        const response = await fetch(`${BASE_URL}/sums-branch-data/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + window.localStorage.getItem("gsmToken"),
          },
        });
        const result = await response.json();

        if (response.ok) {
          setData({
            tempBranchData: result.tempData,
            totalData: result.sumsArray,
            questions: result.question?.questions,
            notice: result.question,
          });
        } else {
          throw new Error("Failed to fetch data");
        }
      } catch (error) {
        console.error("Error fetching branch data:", error);
      }
    };

    getAllBranches();
  }, [id]);

  // Handle sorting
  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction:
        prev.key === key && prev.direction === "ascending"
          ? "descending"
          : "ascending",
    }));
  };

  // Sort data based on sortConfig
  const sortedData = useMemo(() => {
    const { key, direction } = sortConfig;
    if (!key) return data.tempBranchData;

    return [...data.tempBranchData].sort((a, b) => {
      const aValue = a[key] || 0;
      const bValue = b[key] || 0;

      if (typeof aValue === "number" && typeof bValue === "number") {
        return direction === "ascending" ? aValue - bValue : bValue - aValue;
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        return direction === "ascending"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return 0;
    });
  }, [data.tempBranchData, sortConfig]);

  const exportToExcel = () => {
    const headers = [
      "Branch Code",
      "Branch Name",
      ...data.questions.map((q) => q.questionText),
    ];

    const tableData = sortedData.map((branch) => [
      branch.branchCode,
      branch.userName,
      ...data.questions.map((q, index) => branch[index] || 0),
    ]);

    const totalRow = [
      "Total",
      "",
      ...data.totalData.map((value) => value || 0),
    ];
    tableData.unshift(totalRow);

    const ws = XLSX.utils.aoa_to_sheet([headers, ...tableData]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Branch Data");

    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, "BranchData.xlsx");
  };

  const sortIndicator = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "ascending" ? " ▲" : " ▼";
  };

  return (
    <Box sx={{ px: { xs: 1, sm: 2, md: 3 }, py: 2 }}>
      {/* Compact top bar */}
      <Box sx={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        mb: 1, flexWrap: "wrap", gap: 1
      }}>
        <Button
          component={Link}
          to={`/dashboard/admin-data-interface/${buildNoticeSlug(data.notice)}`}
          state={{ id }}
          size="small"
          startIcon={<ArrowBack />}
          variant="text"
          sx={{ fontWeight: 600 }}
        >
          ফিরে যান
        </Button>
        <Box sx={{ textAlign: "center", flex: 1 }}>
          <Typography variant="h6" fontWeight="bold">{data.notice?.document_name}</Typography>
          {data.notice?.sub_title && (
            <Typography variant="caption" color="text.secondary">{data.notice.sub_title}</Typography>
          )}
        </Box>
      </Box>

      {!id ? (
        <Typography color="text.secondary">
          অ্যাডমিন ড্যাশবোর্ড থেকে এক নজরে ব্রাঞ্চ বাটনে ক্লিক করে আসুন।
        </Typography>
      ) : (
      <>
      {/* Table card */}
      <Paper elevation={0} sx={{ borderRadius: 2, border: "1px solid", borderColor: "divider", overflow: "hidden" }}>
        <Box sx={{
          px: 2, py: 1.5, bgcolor: "grey.50", borderBottom: "1px solid", borderColor: "divider",
          display: "flex", alignItems: "center", justifyContent: "space-between"
        }}>
          <Typography variant="subtitle2" fontWeight={600} color="text.secondary">ব্রাঞ্চ সারসংক্ষেপ</Typography>
          <Button
            size="small"
            variant="contained"
            startIcon={<FileDownloadIcon />}
            onClick={exportToExcel}
          >
            Export to Excel
          </Button>
        </Box>
        <Box sx={{ p: 1 }}>
          {sortedData.length ? (
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
                    <TableCell onClick={() => handleSort("branchCode")}>
                      Branch Code{sortIndicator("branchCode")}
                    </TableCell>
                    <TableCell onClick={() => handleSort("userName")}>
                      Branch Name{sortIndicator("userName")}
                    </TableCell>
                    {data.questions?.map((question, index) => (
                      <TableCell
                        key={index}
                        onClick={() => handleSort(index)}
                      >
                        {question?.questionText}
                        {sortIndicator(index)}
                      </TableCell>
                    ))}
                    <TableCell>Actions</TableCell>
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
                    <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                      Total
                    </TableCell>
                    <TableCell sx={{ color: "white" }}></TableCell>
                    {data.totalData.length
                      ? data.totalData?.map((value, index) => (
                          <TableCell
                            sx={{ color: "white", fontWeight: "bold" }}
                            key={index}
                          >
                            {value[index]}
                          </TableCell>
                        ))
                      : data.questions?.map((value, index) => (
                          <TableCell
                            sx={{ color: "white", fontWeight: "bold" }}
                            key={index}
                          >
                            0
                          </TableCell>
                        ))}
                    <TableCell />
                  </TableRow>

                  {/* Data Rows */}
                  {sortedData.map((branch, branchIndex) => (
                    <TableRow
                      key={branchIndex}
                      hover
                      sx={{ "&:hover": { bgcolor: "action.hover" } }}
                    >
                      <TableCell sx={{ textAlign: "center" }}>
                        {branch.branchCode}
                      </TableCell>
                      <TableCell sx={{ textAlign: "center" }}>
                        {branch.userName}
                      </TableCell>
                      {data.questions?.map((question, qIndex) => (
                        <TableCell
                          key={`${branchIndex}-${qIndex}`}
                          sx={{ textAlign: "center" }}
                        >
                          {branch?.[qIndex] || 0}
                        </TableCell>
                      ))}
                      <TableCell>
                        <Stack direction="row" spacing={1} justifyContent="center">
                          <Button
                            component={Link}
                            to={`/dashboard/sums-thana-by-branch/${id}/${branch?.branchCode}`}
                            variant="outlined"
                            size="small"
                            startIcon={<AddIcon fontSize="small" />}
                          >
                            থানাভিত্তিক
                          </Button>
                          <Button
                            component={Link}
                            to={`/dashboard/sums-day-by-day-branch-data/${id}/${branch?.zonalCode}/${branch?.branchCode}`}
                            variant="outlined"
                            size="small"
                            startIcon={<VisibilityIcon fontSize="small" />}
                          >
                            দিনভিত্তিক
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Loader />
          )}
        </Box>
      </Paper>
      </>
      )}
    </Box>
  );
};

export default SumsAllBranchData;
