import React, { useContext, useEffect, useState } from "react";
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
import BangladayDate from "../../time/BangladayDate";

const SumsDayByDayZonalData = () => {
  const { userInfo } = useContext(AuthContext);
  const { zId } = useParams();
  const location = useLocation();
  const qId = location.state?.id;

  const [tempBranch, setTempBranch] = useState();
  const [notice, setNotice] = useState();
  const [questions, setQuestions] = useState();
  const [totalData, setTotalData] = useState();
  const [dateList, setDateList] = useState([]);
  const [dataListByDate, setDataListByDate] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });

  useEffect(() => {
    if (!qId) return;

    const getThanaUsers = async () => {
      try {
        const response = await fetch(
          `${BASE_URL}/sums-day-by-day-zonal-data/${qId}/${zId}`,
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
          setTempBranch(data.tempBranch);
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
    getThanaUsers();
  }, [qId, zId]);

  useEffect(() => {
    const dayData = {};

    tempBranch?.forEach((branch) => {
      branch?.tempThana?.forEach((thana) => {
        if (thana.answer && Array.isArray(thana.answer)) {
          thana.answer.forEach((ans, i) => {
            dateList.forEach((date) => {
              const formattedDate = formatDate(date);
              if (formattedDate === formatDate(ans.createdAt)) {
                if (!dayData[formattedDate]) {
                  dayData[formattedDate] = {};
                }

                let sums = dayData[formattedDate];
                ans.answers.forEach((data, index) => {
                  let value = 0;
                  if (data?.questionType === "number") {
                    value = Number(data.data);
                  }

                  if (!sums[index]) {
                    sums[index] = 0;
                  }
                  sums[index] += value;
                });
              }
            });
          });
        }
      });
    });

    const sumsArray = dateList.map((date, day) => {
      const formattedDate = formatDate(date);
      const dateData = dayData[formattedDate] || {};
      const result = { date: formattedDate, day };

      questions?.questions?.forEach((_, index) => {
        result[index] = dateData[index] || 0;
      });

      return result;
    });

    setDataListByDate(sumsArray);
  }, [dateList, tempBranch, questions]);

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

    if (notice?.startDadeline && notice?.range) {
      const dates = generateDateList(notice?.startDadeline, notice?.range);

      setDateList(dates);
    }
  }, [notice?.startDadeline, notice?.range]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date)) return null;
    return date.toISOString().split("T")[0];
  };

  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const sortIndicator = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "ascending" ? " ▲" : " ▼";
  };

  const exportToExcel = () => {
    const questionList = questions?.questions || [];
    const headers = ["দিন ও তারিখ", ...questionList.map((q) => q.questionText)];

    const data = dataListByDate.map((row) => [
      row.date,
      ...questionList.map((_, index) => row[index] || 0),
    ]);

    const totalRow = [
      "Total",
      ...(totalData?.length
        ? totalData.map((sum, index) => (sum ? sum[index] : 0))
        : questionList.map(() => 0)),
    ];
    data.unshift(totalRow);

    const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Zonal Day Report");

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
          এক নজরে অঞ্চল থেকে দিনভিত্তিক বাটনে ক্লিক করে আসুন।
        </Typography>
      ) : (
        <Paper elevation={0} sx={{ borderRadius: 2, border: "1px solid", borderColor: "divider", overflow: "hidden" }}>
          <Box sx={{
            px: 2, py: 1.5, bgcolor: "grey.50", borderBottom: "1px solid", borderColor: "divider",
            display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1
          }}>
            <Typography variant="subtitle2" fontWeight={600} color="text.secondary">
              দিনভিত্তিক সারসংক্ষেপ · অঞ্চল কোড {zId}
            </Typography>
            {!!dataListByDate.length && (
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
            {dataListByDate.length ? (
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
                      <TableCell onClick={() => handleSort("date")}>
                        দিন ও তারিখ{sortIndicator("date")}
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
                      <TableCell sx={{ color: "white", fontWeight: "bold", textAlign: "center" }}>
                        Total
                      </TableCell>
                      {totalData?.length ? (
                        totalData?.map((sum, sIndex) => (
                          <TableCell
                            sx={{ color: "white", fontWeight: "bold", textAlign: "center" }}
                            key={sIndex}
                          >
                            {sum ? sum[sIndex] : 0}
                          </TableCell>
                        ))
                      ) : (
                        <TableCell sx={{ color: "white", fontWeight: "bold", textAlign: "center" }}>
                          0
                        </TableCell>
                      )}
                    </TableRow>

                    {/* Data Rows */}
                    {dataListByDate?.map((data, index) => (
                      <TableRow
                        key={index}
                        hover
                        sx={{ "&:hover": { bgcolor: "action.hover" } }}
                      >
                        <TableCell sx={{ textAlign: "center" }}>
                          <BangladayDate day={data.day + 1} date={data.date} />
                        </TableCell>
                        {questions?.questions?.map((question, qIndex) => (
                          <TableCell key={qIndex} sx={{ textAlign: "center" }}>
                            {data[qIndex] ? data[qIndex] : 0}
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

export default SumsDayByDayZonalData;
