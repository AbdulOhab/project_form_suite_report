import { useContext, useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Loader from "../../time/Loader";
import BangladayForOnce from "../../time/BangladayForOnce";
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
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import TableChartOutlined from "@mui/icons-material/TableChartOutlined";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { AuthContext } from "../../../contexts/AuthContext";
import { buildExportFileName } from "../../../utils/exportFileName";

function AdminTableDataInterfce({
  startDadeline,
  range,
  totalData,
  questions,
  zonalReport,
  id,
  slug,
  documentName,
}) {
  const { userInfo } = useContext(AuthContext);
  const [dateList, setDateList] = useState([]);
  const [dataListByDate, setDataListByDate] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    key: "date",
    direction: "ascending",
  });

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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date)) return null;
    return date.toISOString().split("T")[0];
  };

  useEffect(() => {
    const dayData = {};

    zonalReport?.forEach((zonal) => {
      if (zonal?.tempBranch && Array.isArray(zonal?.tempBranch)) {
        zonal?.tempBranch?.forEach((branch) => {
          if (branch.tempThana && Array.isArray(branch.tempThana)) {
            branch?.tempThana?.forEach((thana) => {
              if (thana.answer && Array.isArray(thana.answer)) {
                thana.answer.forEach((ans) => {
                  dateList.forEach((date) => {
                    const formattedDate = formatDate(date);
                    const ansDate = ans.reportDate
                      ? formatDate(ans.reportDate)
                      : formatDate(ans.createdAt);
                    if (formattedDate === ansDate) {
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
          }
        });
      }
    });

    const sumsArray = dateList.map((date, day) => {
      const formattedDate = formatDate(date);
      const dateData = dayData[formattedDate] || {};
      const result = { date: formattedDate, day };

      questions?.forEach((_, index) => {
        result[index] = dateData[index] || 0;
      });

      return result;
    });

    setDataListByDate(sumsArray);
  }, [dateList, zonalReport, questions]);

  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const sortedData = useMemo(() => {
    let sortableData = [...dataListByDate];
    if (sortConfig.key !== null) {
      sortableData.sort((a, b) => {
        if (sortConfig.key === "date") {
          const dateA = new Date(a[sortConfig.key]);
          const dateB = new Date(b[sortConfig.key]);
          return (
            (dateA - dateB) * (sortConfig.direction === "ascending" ? 1 : -1)
          );
        } else {
          if (a[sortConfig.key] < b[sortConfig.key]) {
            return sortConfig.direction === "ascending" ? -1 : 1;
          }
          if (a[sortConfig.key] > b[sortConfig.key]) {
            return sortConfig.direction === "ascending" ? 1 : -1;
          }
          return 0;
        }
      });
    }
    return sortableData;
  }, [dataListByDate, sortConfig]);

  const exportToExcel = () => {
    const headers = ["দিন ও তারিখ", ...questions.map((q) => q.questionText)];

    const data = sortedData.map((row) => [
      row.date,
      ...questions.map((_, index) => row[index] || 0),
    ]);

    const totalRow = [
      "Total",
      ...(totalData?.length
        ? totalData.map((value, index) => value[index] || 0)
        : questions.map(() => 0)),
    ];
    data.unshift(totalRow);

    const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Daily Report");

    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, buildExportFileName(userInfo?.userId, "Admin", documentName));
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
          <Typography variant="subtitle2" fontWeight={600} color="text.secondary">দৈনিক রিপোর্ট সারসংক্ষেপ</Typography>
        </Box>
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
      {!sortedData.length ? (
        <Loader />
      ) : (
        <TableContainer component={Paper} sx={{ overflowX: "auto" }}>
          <Table size="small" border={1}>
            <TableHead>
              <TableRow sx={{ bgcolor: "primary.main", textAlign: "center" }}>
                <TableCell
                  sx={{ color: "common.white", textAlign: "left", cursor: "pointer" }}
                  onClick={() => handleSort("date")}
                >
                  দিন ও তারিখ
                  {sortConfig.key === "date" &&
                    (sortConfig.direction === "ascending" ? " ▲" : " ▼")}
                </TableCell>
                {questions?.map((question, index) => (
                  <TableCell
                    sx={{
                      color: "common.white",
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
                      (sortConfig.direction === "ascending" ? " ▲" : " ▼")}
                  </TableCell>
                ))}
                <TableCell sx={{ color: "common.white", textAlign: "center" }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow sx={{ bgcolor: "primary.main", textAlign: "center" }}>
                <TableCell sx={{ color: "common.white", textAlign: "center", fontWeight: "bold" }}>Total</TableCell>
                {totalData.length
                  ? totalData?.map((value, index) => (
                      <TableCell sx={{ color: "common.white", textAlign: "center" }} key={index}>
                        {value[index]}
                      </TableCell>
                    ))
                  : questions.map((_, index) => (
                      <TableCell sx={{ color: "common.white", textAlign: "center" }} key={index}>
                        0
                      </TableCell>
                    ))}
                <TableCell sx={{ textAlign: "center" }} />
              </TableRow>
            </TableBody>
            <TableBody>
              {sortedData.map((data, dateIndex) => (
                <TableRow key={dateIndex} sx={{ textAlign: "center", "&:hover": { bgcolor: "action.hover" } }}>
                  <BangladayForOnce day={data.day + 1} date={data.date} />
                  {questions.map((question, questionIndex) => (
                    <TableCell key={questionIndex} sx={{ textAlign: "center" }}>
                      {data[questionIndex] || "0"}
                    </TableCell>
                  ))}
                  <TableCell sx={{ textAlign: "center" }}>
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      component={Link}
                      to={`/dashboard/admin-interface/${dateIndex + 1}/${slug}`}
                      state={{ id }}
                    >
                      বিস্তারিত
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      </Box>
    </Paper>
  );
}

export default AdminTableDataInterfce;
