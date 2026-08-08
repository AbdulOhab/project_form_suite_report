import React, { useContext, useEffect, useMemo, useState } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import ZonalBangladayDate from "../../time/ZonalBangladayDate";
import Loader from "../../time/Loader";
import BASE_URL from "../../../auth/dbUrl";
import { buildNoticeSlug } from "../../../utils/noticeSlug";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Typography,
} from "@mui/material";
import TableChartOutlined from "@mui/icons-material/TableChartOutlined";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { AuthContext } from "../../../contexts/AuthContext";
import { buildExportFileName } from "../../../utils/exportFileName";

function AdminAllBranchDayCount() {
  const { userInfo } = useContext(AuthContext);
  const { dayId } = useParams();
  const location = useLocation();
  const noticeId = location.state?.id;

  const [notice, setNotice] = useState();
  const [branchReport, setBranchReport] = useState([]);
  const [tempBranchData, setTempBranchData] = useState([]);
  const [branchSumArray, setBranchSumArray] = useState([]);
  const [questions, setQuestions] = useState();

  const [dateList, setDateList] = useState([]);
  const [countUnSubmit, setCountUnSubmit] = useState();
  const [countSubmit, setCountSubmit] = useState();

  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });

  const { startDadeline, range } = notice || {};

  useEffect(() => {
    if (!noticeId) return;

    const getAllBranches = async () => {
      try {
        const response = await fetch(
          `${BASE_URL}/admin/get-all-branches/${noticeId}/${dayId}/`,
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
          setBranchReport(data.tempBranch);
          setTempBranchData(data.tempData);
          setBranchSumArray(data.sumsArray);
        } else {
          throw new Error("Failed to fetch");
        }
      } catch (error) {
        console.error("Error fetching notice data:", error);
      }
    };
    getAllBranches();
  }, [noticeId, dayId]);

  useEffect(() => {
    const data = branchReport?.reduce(
      (acc, branch) => {
        if (Array.isArray(branch?.tempThana)) {
          acc.total += branch.tempThana?.length;
          acc.unsubmitted += branch.tempThana.filter(
            (thana) => thana?.answers?.length === 0
          )?.length;
        }
        return acc;
      },
      { unsubmitted: 0, total: 0 }
    );

    setCountUnSubmit(data?.unsubmitted);
    setCountSubmit(data?.total - data?.unsubmitted);
  }, [branchReport]);

  useEffect(() => {
    const generateDateList = (start, range) => {
      const startDate = new Date(start);
      const dates = [];
      for (let i = 0; i < range; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        dates.push(currentDate);
      }
      return dates;
    };

    if (startDadeline && range) {
      const dates = generateDateList(startDadeline, range);
      setDateList(dates);
    }
  }, [startDadeline, range]);

  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const sortedData = useMemo(() => {
    let sortableData = Array.isArray(tempBranchData) ? [...tempBranchData] : [];

    if (sortConfig.key !== null) {
      sortableData.sort((a, b) => {
        let aValue, bValue;

        if (
          sortConfig.key === "branchCode" ||
          sortConfig.key === "userName" ||
          sortConfig.key === "totalThana" ||
          sortConfig.key === "thanaAnsSubmit" ||
          sortConfig.key === "thanaAnsUnsubmit"
        ) {
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
  }, [tempBranchData, sortConfig]);

  const exportToExcel = () => {
    const headers = [
      "Branch Code",
      "Branch Name",
      "Total Thana",
      "Submit",
      "Unsubmit",
      ...questions.map((q) => q.questionText),
    ];

    const data = sortedData.map((branch) => [
      branch.branchCode,
      branch.userName,
      branch.totalThana,
      branch.thanaAnsSubmit,
      branch.thanaAnsUnsubmit,
      ...questions.map((_, qIndex) => branch?.[qIndex] || 0),
    ]);

    const totalRow = [
      "",
      "Total",
      "",
      "",
      "",
      ...(branchSumArray?.length
        ? branchSumArray.map((value, index) => value[index] || 0)
        : questions.map(() => 0)),
    ];
    data.unshift(totalRow);

    const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Branch Report");

    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, buildExportFileName(userInfo?.userId, "Admin", notice?.document_name));
  };

  return (
    <Paper elevation={0} sx={{ borderRadius: 2, border: "1px solid", borderColor: "divider", overflow: "hidden" }}>
      <Box
        sx={{
          px: 2,
          py: 1.5,
          bgcolor: "#ffffff",
          borderBottom: "1px solid",
          borderColor: "divider",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <TableChartOutlined fontSize="small" color="action" />
          <Typography variant="subtitle2" fontWeight={600} color="text.secondary">দৈনিক রিপোর্ট</Typography>
        </Box>
        {!!dateList?.length && (
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
      {!dateList?.length ? (
        <Loader />
      ) : (
        dateList?.map((date, index) => {
          if (index + 1 === Number(dayId)) {
            return (
              <React.Fragment key={index}>
                <ZonalBangladayDate
                  day={index + 1}
                  date={date}
                  totalUnsubmitted={countUnSubmit}
                  totalSubmitted={countSubmit}
                />
                <TableContainer component={Paper} sx={{ overflowX: "auto" }}>
                  <Table size="small" border={1}>
                    <TableHead>
                      <TableRow sx={{ bgcolor: "grey.100", textAlign: "center" }}>
                        <TableCell
                          sx={{ textAlign: "center", cursor: "pointer" }}
                          onClick={() => handleSort("branchCode")}
                        >
                          Branch Code
                          {sortConfig.key === "branchCode" &&
                            (sortConfig.direction === "ascending" ? " ▲" : " ▼")}
                        </TableCell>
                        <TableCell
                          sx={{ textAlign: "center", cursor: "pointer" }}
                          onClick={() => handleSort("userName")}
                        >
                          Branch Name
                          {sortConfig.key === "userName" &&
                            (sortConfig.direction === "ascending" ? " ▲" : " ▼")}
                        </TableCell>
                        <TableCell
                          sx={{ textAlign: "center", cursor: "pointer" }}
                          onClick={() => handleSort("totalThana")}
                        >
                          Total Thana
                          {sortConfig.key === "totalThana" &&
                            (sortConfig.direction === "ascending" ? " ▲" : " ▼")}
                        </TableCell>
                        <TableCell
                          sx={{ textAlign: "center", cursor: "pointer" }}
                          onClick={() => handleSort("thanaAnsSubmit")}
                        >
                          Submit
                          {sortConfig.key === "thanaAnsSubmit" &&
                            (sortConfig.direction === "ascending" ? " ▲" : " ▼")}
                        </TableCell>
                        <TableCell
                          sx={{ textAlign: "center", cursor: "pointer" }}
                          onClick={() => handleSort("thanaAnsUnsubmit")}
                        >
                          Unsubmit
                          {sortConfig.key === "thanaAnsUnsubmit" &&
                            (sortConfig.direction === "ascending" ? " ▲" : " ▼")}
                        </TableCell>
                        {questions?.map((question, index) => (
                          <TableCell
                            sx={{
                              textAlign: "center",
                              cursor: "pointer",
                              minWidth: 140,
                              maxWidth: 200,
                              whiteSpace: "normal",
                              wordBreak: "break-word",
                            }}
                            key={index}
                            onClick={() => handleSort(index)}
                          >
                            {question?.questionText}
                            {sortConfig.key === index &&
                              (sortConfig.direction === "ascending"
                                ? " ▲"
                                : " ▼")}
                          </TableCell>
                        ))}
                        <TableCell sx={{ textAlign: "center" }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow sx={{ bgcolor: "primary.main", textAlign: "center" }}>
                        <TableCell
                          sx={{ color: "common.white", fontWeight: "bold" }}
                          colSpan={5}
                        >
                          Total
                        </TableCell>
                        {branchSumArray?.length
                          ? branchSumArray?.map((value, index) => (
                              <TableCell sx={{ color: "common.white" }} key={index}>
                                {value[index]}
                              </TableCell>
                            ))
                          : questions.map((_, index) => (
                              <TableCell sx={{ color: "common.white" }} key={index}>
                                0
                              </TableCell>
                            ))}
                        <TableCell sx={{ color: "common.white" }} />
                      </TableRow>
                    </TableBody>
                    <TableBody>
                      {sortedData.map((branch, branchIndex) => (
                        <TableRow key={branchIndex} sx={{ textAlign: "center", "&:hover": { bgcolor: "action.hover" } }}>
                          <TableCell sx={{ textAlign: "center" }}>{branch.branchCode}</TableCell>
                          <TableCell sx={{ textAlign: "center" }}>{branch.userName}</TableCell>
                          <TableCell sx={{ textAlign: "center" }}>{branch.totalThana}</TableCell>
                          <TableCell sx={{ textAlign: "center" }}>{branch.thanaAnsSubmit}</TableCell>
                          <TableCell sx={{ textAlign: "center" }}>{branch.thanaAnsUnsubmit}</TableCell>
                          {questions?.map((question, qIndex) => (
                            <TableCell key={`${branchIndex}-${qIndex}`} sx={{ textAlign: "center" }}>
                              {branch?.[qIndex] || 0}
                            </TableCell>
                          ))}
                          <TableCell sx={{ textAlign: "center" }}>
                            <Button
                              variant="contained"
                              color="primary"
                              size="small"
                              component={Link}
                              to={`/dashboard/admin-data-perDayCount/${dayId}/${branch?.zonalCode}/${branch?.branchCode}/${buildNoticeSlug(notice)}`}
                              state={{ id: noticeId }}
                            >
                              বিস্তারিত
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </React.Fragment>
            );
          } else {
            return null;
          }
        })
      )}
      </Box>
    </Paper>
  );
}

export default AdminAllBranchDayCount;
