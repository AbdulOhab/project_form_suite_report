import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import BASE_URL from "../../../auth/dbUrl";
import {
  Box,
  Button,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  Stack,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import LockIcon from "@mui/icons-material/Lock";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import DateDifferenceComponent from "../../time/DateDifferenceComponent";
import convertToBengaliNumber from "../../time/NumberConverter";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const SumsAllZonalData = () => {
  const { qId } = useParams();

  const [descriptionAlert, setDescriptionAlert] = useState(false);
  const [notice, setNotice] = useState();
  const [totalData, setTotalData] = useState();
  const [tempData, setTempData] = useState();
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });

  useEffect(() => {
    const fetchData = async () => {
      await fetch(`${BASE_URL}/sums-zonal-data/${qId}`, {
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
  }, [qId]);

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

  const descriptionHandler = () => {
    setDescriptionAlert(true);
  };
  const descriptionCloserHandler = () => {
    setDescriptionAlert(false);
  };
  const validCardData = (endDadeline) => {
    const currentDate = new Date();
    const endDadelineDate = new Date(endDadeline);

    const timeDiff = endDadelineDate - currentDate;
    const diffInDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    return diffInDays;
  };

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
      ...notice.questions.map((q) => zonal[q.questionText] || 0),
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
    saveAs(blob, "ZonalData.xlsx");
  };

  const sortIndicator = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "ascending" ? " ▲" : " ▼";
  };

  return (
    <Paper elevation={2} sx={{ p: 2 }}>
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

      {/* Header Section */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
          mb: 2,
        }}
      >
        {/* Left - Date Info */}
        <Paper variant="outlined" sx={{ p: 1.5, flex: "1 1 auto", minWidth: 200 }}>
          {validCardData(notice?.endDadeline) < 0 ? (
            <Typography
              sx={{
                textAlign: "center",
                fontSize: "1.25rem",
                fontWeight: "bold",
                color: "error.main",
              }}
            >
              নোটিশ শেষ হয়েছে{" "}
              {convertToBengaliNumber(
                Math.abs(validCardData(notice?.endDadeline))
              )}{" "}
              দিন আগে
            </Typography>
          ) : (
            <DateDifferenceComponent
              startDadeline={notice?.startDadeline}
              range={notice?.range}
              timeStart={notice?.timeStart}
              timeEnd={notice?.timeEnd}
              endDadeline={notice?.endDadeline}
            />
          )}
        </Paper>

        {/* Middle - Title */}
        <Box sx={{ textAlign: "center", flex: "2 1 auto" }}>
          <Typography
            variant="h5"
            sx={{
              textAlign: "center",
              fontWeight: 600,
              color: "primary.main",
            }}
          >
            {notice?.document_name}
          </Typography>
          {notice?.sub_title && (
            <Typography variant="body2" sx={{ textAlign: "center" }}>
              {notice?.sub_title}
            </Typography>
          )}
          <Typography sx={{ textAlign: "center", mt: 1 }}>
            <Typography
              component="span"
              sx={{
                fontSize: "1.5rem",
                fontWeight: "bold",
                bgcolor: "primary.main",
                color: "white",
                borderRadius: 1,
                px: 1.5,
              }}
            >
              এক নজরে অঞ্চল সমূহের পূর্ণাঙ্গ রিপোর্ট
            </Typography>
          </Typography>
        </Box>

        {/* Right - Actions */}
        <Stack
          direction="column"
          alignItems="flex-end"
          justifyContent="flex-end"
          spacing={1}
          sx={{ flex: "1 1 auto", minWidth: 120 }}
        >
          {!descriptionAlert && (
            <Button variant="outlined" onClick={descriptionHandler}>
              Notice
            </Button>
          )}
          <Button
            component={Link}
            variant="contained"
            to={`/dashboard/admin-data-interface/${qId}`}
          >
            Back
          </Button>
        </Stack>
      </Box>

      {/* Table Section */}
      <Box sx={{ textAlign: "end", mb: 1 }}>
        <Button
          variant="contained"
          startIcon={<FileDownloadIcon />}
          onClick={exportToExcel}
        >
          Export to Excel
        </Button>
      </Box>

      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow
              sx={{
                bgcolor: "primary.main",
                "& th": { color: "white", fontWeight: "bold", cursor: "pointer" },
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
              <TableCell colSpan={2} sx={{ color: "white", fontWeight: "bold" }}>
                Total
              </TableCell>
              {totalData?.length
                ? totalData?.map((value, index) => (
                    <TableCell
                      sx={{ color: "white", fontWeight: "bold" }}
                      key={index}
                    >
                      {value[index]}
                    </TableCell>
                  ))
                : notice?.questions?.map((value, index) => (
                    <TableCell
                      sx={{ color: "white", fontWeight: "bold" }}
                      key={index}
                    >
                      0
                    </TableCell>
                  ))}
              <TableCell>
                <LockIcon sx={{ color: "error.main" }} />
              </TableCell>
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
                    {zonal[question.questionText] || 0}
                  </TableCell>
                ))}
                <TableCell>
                  <Stack direction="row" spacing={1} justifyContent="center">
                    <IconButton
                      component={Link}
                      to={`/dashboard/sums-zonal-data-by-branch/${qId}/${zonal.zonalCode}`}
                      color="primary"
                      size="small"
                    >
                      <AddIcon />
                    </IconButton>
                    <IconButton
                      component={Link}
                      to={`/dashboard/sums-day-by-day-zonal-data/${qId}/${zonal.zonalCode}`}
                      color="primary"
                      size="small"
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default SumsAllZonalData;
