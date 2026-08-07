import React, { useContext, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { buildNoticeSlug } from "../../../utils/noticeSlug";
import { buildExportFileName } from "../../../utils/exportFileName";
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
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import Loader from "../../time/Loader";

const SumsThanaByBranches = () => {
  const { userInfo } = useContext(AuthContext);
  const { bId } = useParams();
  const location = useLocation();
  const qId = location.state?.id;

  const [notice, setNotice] = useState("");
  const [totalData, setTotalData] = useState();
  const [branchName, setBranchName] = useState("");
  const [questions, setQuestions] = useState();
  const [sumsThanaData, setSumsThanaData] = useState();

  useEffect(() => {
    if (!qId) return;

    const sumsthanadata = async () => {
      try {
        const response = await fetch(
          `${BASE_URL}/sums-thana-by-branch-data/${qId}/${bId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization:
                "Bearer " + window.localStorage.getItem("gsmToken"),
            },
          }
        );
        const data = await response.json();

        if (response.ok) {
          setNotice(data.question);
          setQuestions(data?.question?.questions);
          setTotalData(data?.sumsArray);
          setBranchName(data?.branch);
          setSumsThanaData(data?.sumsThanaData);
        } else {
          return console.log("Failed to fetch");
        }
      } catch (error) {
        console.error("Error fetching notice data:", error);
      }
    };
    sumsthanadata();
  }, [qId, bId]);

  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });
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

        if (sortConfig.key === "branchCode" || sortConfig.key === "userName") {
          aValue = a[sortConfig.key];
          bValue = b[sortConfig.key];
        } else {
          aValue = a[sortConfig.key] || 0;
          bValue = b[sortConfig.key] || 0;
        }

        if (!isNaN(aValue) && !isNaN(bValue)) {
          return sortConfig.direction === "ascending"
            ? aValue - bValue
            : bValue - aValue;
        }

        if (typeof aValue === "string" && typeof bValue === "string") {
          return sortConfig.direction === "ascending"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        return 0;
      });
    }

    return sortableData;
  }, [sumsThanaData, sortConfig]);

  const sortIndicator = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "ascending" ? " ▲" : " ▼";
  };

  const exportToExcel = () => {
    const headers = ["Thana Code", "Thana Name", ...questions.map((q) => q.questionText)];

    const data = sortedData.map((thana) => [
      thana.thanaCode,
      thana.userName,
      ...questions.map((_, index) => thana?.[index] || 0),
    ]);

    const totalRow = [
      "Total",
      "",
      ...(totalData?.length
        ? totalData.map((element, index) => (element ? element[index] : 0))
        : questions.map(() => 0)),
    ];
    data.unshift(totalRow);

    const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Thana Report");

    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, buildExportFileName(userInfo?.userId, "Admin", notice?.document_name));
  };

  const cardTitle = branchName?.userName
    ? `${branchName.userName} — থানাভিত্তিক সারসংক্ষেপ`
    : "থানাভিত্তিক সারসংক্ষেপ";

  return (
    <Box sx={{ maxWidth: 1500, mx: "auto", px: { xs: 1, sm: 2, md: 3 }, py: 2 }}>
      {/* Compact top bar */}
      <Box sx={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        mb: 1, flexWrap: "wrap", gap: 1
      }}>
        <Button
          component={Link}
          to={`/dashboard/sums-all-branches-data/${buildNoticeSlug(notice)}`}
          state={{ id: qId }}
          size="small"
          startIcon={<ArrowBack />}
          variant="text"
          sx={{ fontWeight: 600 }}
        >
          ফিরে যান
        </Button>
        <Box sx={{ textAlign: "center", flex: 1, minWidth: 0 }}>
          <Typography variant="h6" fontWeight="bold" noWrap>
            {notice?.document_name || (qId ? "Loading..." : "")}
          </Typography>
          {notice?.sub_title && (
            <Typography variant="caption" color="text.secondary">{notice.sub_title}</Typography>
          )}
        </Box>
      </Box>

      {!qId ? (
        <Typography color="text.secondary">
          এক নজরে ব্রাঞ্চ থেকে থানাভিত্তিক বাটনে ক্লিক করে আসুন।
        </Typography>
      ) : (
        <Paper elevation={0} sx={{ borderRadius: 2, border: "1px solid", borderColor: "divider", overflow: "hidden" }}>
          <Box sx={{
            px: 2, py: 1.5, bgcolor: "grey.50", borderBottom: "1px solid", borderColor: "divider",
            display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1
          }}>
            <Typography variant="subtitle2" fontWeight={600} color="text.secondary">{cardTitle}</Typography>
            {!!sortedData.length && (
              <Button
                size="small"
                variant="contained"
                startIcon={<FileDownloadIcon />}
                onClick={exportToExcel}
              >
                Export to Excel
              </Button>
            )}
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
                          textAlign: "center",
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
                          onClick={() => handleSort(index)}
                        >
                          {question?.questionText}
                          {sortIndicator(index)}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {/* Total Row */}
                    <TableRow
                      sx={{
                        bgcolor: "primary.main",
                        "& th, & td": { color: "common.white", fontWeight: "bold", textAlign: "center" },
                      }}
                    >
                      <TableCell colSpan={2} sx={{ color: "common.white", fontWeight: "bold", textAlign: "center" }}>
                        Total
                      </TableCell>
                      {totalData?.map((element, index) => (
                        <TableCell key={index} sx={{ color: "common.white", fontWeight: "bold", textAlign: "center" }}>
                          {element ? element[index] : "0"}
                        </TableCell>
                      ))}
                    </TableRow>

                    {/* Data Rows */}
                    {sortedData.map((thana, thanaIndex) => (
                      <TableRow
                        key={thanaIndex}
                        hover
                        sx={{
                          bgcolor: "background.paper",
                          "&:hover": { bgcolor: "action.hover" },
                        }}
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
                            {thana?.[qIndex] || 0}
                          </TableCell>
                        ))}
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
      )}
    </Box>
  );
};

export default SumsThanaByBranches;
