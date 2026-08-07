import React, { useContext, useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import BASE_URL from "../../../auth/dbUrl";
import { AuthContext } from "../../../contexts/AuthContext";
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Stack,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { ArrowBack } from "@mui/icons-material";
import { buildNoticeSlug } from "../../../utils/noticeSlug";
import { buildExportFileName } from "../../../utils/exportFileName";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const SumsAllZonalData = () => {
  const { userInfo } = useContext(AuthContext);
  const location = useLocation();
  const id = location.state?.id;

  const [notice, setNotice] = useState();
  const [totalData, setTotalData] = useState();
  const [tempData, setTempData] = useState();
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      await fetch(`${BASE_URL}/sums-zonal-data/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + window.localStorage.getItem("gsmToken"),
        },
      })
        .then((res) => res.json())
        .then((data) => {
          setNotice(data.question);
          setTotalData(data.sumsArray);
          setTempData(data.tempData);
        })
        .catch((err) => {
          console.log(err);
        });
    };
    fetchData();
  }, [id]);

  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const sortedData = useMemo(() => {
    let sortableData = Array.isArray(tempData) ? [...tempData] : [];

    if (sortConfig.key !== null) {
      sortableData.sort((a, b) => {
        let aValue, bValue;

        // Check if sorting key is a predefined column or dynamic question
        if (sortConfig.key === "zonalCode" || sortConfig.key === "userName") {
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
  }, [tempData, sortConfig]);

  const exportToExcel = () => {
    // Extract table headers
    const headers = [
      "Zonal Code",
      "Zonal Name",
      ...notice.questions.map((q) => q.questionText),
    ];

    // Extract table data
    const data = sortedData.map((zonal) => [
      zonal.zonalCode,
      zonal.userName,
      ...notice.questions.map((q, index) => zonal[index] || 0),
    ]);

    // Add total row
    const totalRow = ["", "Total", ...totalData.map((value) => value || 0)];
    data.unshift(totalRow); // Insert at the top

    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);

    // Create workbook and add worksheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Zonal Data");

    // Save file
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, buildExportFileName(userInfo?.userId, "Admin", notice?.document_name));
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
          to={`/dashboard/admin-data-interface/${buildNoticeSlug(notice)}`}
          state={{ id }}
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
      </Box>

      {!id ? (
        <Typography color="text.secondary">
          অ্যাডমিন ড্যাশবোর্ড থেকে এক নজরে অঞ্চল বাটনে ক্লিক করে আসুন।
        </Typography>
      ) : (
      <>
      {/* Table card */}
      <Paper elevation={0} sx={{ borderRadius: 2, border: "1px solid", borderColor: "divider", overflow: "hidden" }}>
        <Box sx={{
          px: 2, py: 1.5, bgcolor: "grey.50", borderBottom: "1px solid", borderColor: "divider",
          display: "flex", alignItems: "center", justifyContent: "space-between"
        }}>
          <Typography variant="subtitle2" fontWeight={600} color="text.secondary">অঞ্চল সারসংক্ষেপ</Typography>
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
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow
                  sx={{
                    bgcolor: "primary.main",
                    "& th": { color: "white", fontWeight: "bold", cursor: "pointer", textAlign: "center" },
                  }}
                >
                  <TableCell onClick={() => handleSort("zonalCode")}>
                    Zonal Code{sortIndicator("zonalCode")}
                  </TableCell>
                  <TableCell onClick={() => handleSort("userName")}>
                    Zonal Name{sortIndicator("userName")}
                  </TableCell>
                  {notice?.questions?.map((question, index) => (
                    <TableCell
                      key={index}
                      onClick={() => handleSort(index)}
                    >
                      {question?.questionText}
                      {sortIndicator(index)}
                    </TableCell>
                  ))}
                  <TableCell sx={{ textAlign: "center" }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {/* Total Row */}
                <TableRow
                  sx={{
                    bgcolor: "primary.main",
                    "& th, & td": { color: "white", fontWeight: "bold", textAlign: "center" },
                  }}
                >
                  <TableCell colSpan={2} sx={{ color: "white", fontWeight: "bold", textAlign: "center" }}>
                    Total
                  </TableCell>
                  {totalData?.length
                    ? totalData?.map((value, index) => (
                        <TableCell
                          sx={{ color: "white", fontWeight: "bold", textAlign: "center" }}
                          key={index}
                        >
                          {value[index]}
                        </TableCell>
                      ))
                    : notice?.questions?.map((value, index) => (
                        <TableCell
                          sx={{ color: "white", fontWeight: "bold", textAlign: "center" }}
                          key={index}
                        >
                          0
                        </TableCell>
                      ))}
                  <TableCell />
                </TableRow>

                {/* Data Rows */}
                {sortedData?.map((zonal, zonalIndex) => (
                  <TableRow
                    key={zonalIndex}
                    hover
                    sx={{ "&:hover": { bgcolor: "action.hover" } }}
                  >
                    <TableCell sx={{ textAlign: "center" }}>
                      {zonal.zonalCode}
                    </TableCell>
                    <TableCell sx={{ textAlign: "center" }}>
                      {zonal.userName}
                    </TableCell>
                    {notice?.questions?.map((question, questionIndex) => (
                      <TableCell
                        key={`${zonalIndex}-${questionIndex}`}
                        sx={{ textAlign: "center" }}
                      >
                        {zonal[questionIndex] || 0}
                      </TableCell>
                    ))}
                    <TableCell>
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <Button
                          component={Link}
                          to={`/dashboard/sums-zonal-data-by-branch/${zonal.zonalCode}/${buildNoticeSlug(notice)}`}
                          state={{ id }}
                          variant="outlined"
                          size="small"
                          startIcon={<AddIcon fontSize="small" />}
                        >
                          শাখাভিত্তিক
                        </Button>
                        <Button
                          component={Link}
                          to={`/dashboard/sums-day-by-day-zonal-data/${zonal.zonalCode}/${buildNoticeSlug(notice)}`}
                          state={{ id }}
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
        </Box>
      </Paper>
      </>
      )}
    </Box>
  );
};

export default SumsAllZonalData;
