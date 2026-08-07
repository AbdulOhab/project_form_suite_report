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

const SumsZonalDataByBranch = () => {
  const { userInfo } = useContext(AuthContext);
  const { zId } = useParams();
  const location = useLocation();
  const qId = location.state?.id;

  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });

  const [tempData, setTempData] = useState();
  const [notice, setNotice] = useState();
  const [questions, setQuestions] = useState();
  const [totalData, setTotalData] = useState();

  useEffect(() => {
    if (!qId) return;

    const getZonalaDataByBranch = async () => {
      try {
        const response = await fetch(
          `${BASE_URL}/sums-zonal-data-by-branch/${qId}/${zId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + window.localStorage.getItem("gsmToken"),
            },
          }
        );
        const data = await response.json();
        if (response.ok) {
          setTempData(data.tempData);
          setNotice(data.question);
          setQuestions(data.question);
          setTotalData(data.sumsArray);
        } else {
          throw new Error("Failed to fetch");
        }
      } catch (error) {
        console.error("Error fetching notice data:", error);
      }
    };

    getZonalaDataByBranch();
  }, [zId, qId]);

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

        if (sortConfig.key === "zonalCode" || sortConfig.key === "userName") {
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
  }, [tempData, sortConfig]);

  const sortIndicator = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "ascending" ? " ▲" : " ▼";
  };

  const exportToExcel = () => {
    const questionList = questions?.questions || [];
    const headers = ["Branch Code", "Branch Name", ...questionList.map((q) => q.questionText)];

    const data = sortedData.map((branch) => [
      branch.branchCode,
      branch.userName,
      ...questionList.map((_, index) => branch[index] || 0),
    ]);

    const totalRow = [
      "Total",
      "",
      ...(totalData?.length
        ? totalData.map((value, index) => (value ? value[index] : 0))
        : questionList.map(() => 0)),
    ];
    data.unshift(totalRow);

    const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Zonal Branch Data");

    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, buildExportFileName(userInfo?.userId, "Admin", notice?.document_name));
  };

  return (
    <Box sx={{ maxWidth: 1500, mx: "auto", px: { xs: 1, sm: 2, md: 3 }, py: 2 }}>
      {/* Compact top bar */}
      <Box sx={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        mb: 1, flexWrap: "wrap", gap: 1
      }}>
        <Button
          component={Link}
          to={`/dashboard/sums-all-zonal-data/${buildNoticeSlug(notice)}`}
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
          এক নজরে অঞ্চল থেকে শাখাভিত্তিক বাটনে ক্লিক করে আসুন।
        </Typography>
      ) : (
        <Paper elevation={0} sx={{ borderRadius: 2, border: "1px solid", borderColor: "divider", overflow: "hidden" }}>
          <Box sx={{
            px: 2, py: 1.5, bgcolor: "grey.50", borderBottom: "1px solid", borderColor: "divider",
            display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1
          }}>
            <Typography variant="subtitle2" fontWeight={600} color="text.secondary">
              শাখাভিত্তিক সারসংক্ষেপ · অঞ্চল কোড {zId}
            </Typography>
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
                      <TableCell onClick={() => handleSort("zonalCode")}>
                        Branch Code{sortIndicator("zonalCode")}
                      </TableCell>
                      <TableCell onClick={() => handleSort("userName")}>
                        Branch name{sortIndicator("userName")}
                      </TableCell>
                      {questions?.questions?.map((question, index) => (
                        <TableCell
                          key={index}
                          onClick={() => handleSort(index)}
                        >
                          {question.questionText}
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
                        "& th, & td": { color: "white", fontWeight: "bold", textAlign: "center" },
                      }}
                    >
                      <TableCell
                        colSpan={2}
                        sx={{ color: "white", fontWeight: "bold", textAlign: "center" }}
                      >
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
                    </TableRow>

                    {/* Data Rows */}
                    {sortedData?.map((branch, zonalIndex) => (
                      <TableRow
                        key={zonalIndex}
                        hover
                        sx={{ "&:hover": { bgcolor: "action.hover" } }}
                      >
                        <TableCell sx={{ textAlign: "center" }}>
                          {branch.branchCode}
                        </TableCell>
                        <TableCell sx={{ textAlign: "center" }}>
                          {branch.userName}
                        </TableCell>
                        {notice?.questions?.map((question, questionIndex) => (
                          <TableCell
                            key={`${zonalIndex}-${questionIndex}`}
                            sx={{ textAlign: "center" }}
                          >
                            {branch[questionIndex] || 0}
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

export default SumsZonalDataByBranch;
