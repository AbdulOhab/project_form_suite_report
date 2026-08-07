import React, { useContext, useEffect, useState, useMemo } from "react";
import BangladayDate from "./BangladayDate";
import { Link } from "react-router-dom";
import Loader from "./Loader";
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
} from "@mui/material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { AuthContext } from "../../contexts/AuthContext";
import { buildExportFileName } from "../../utils/exportFileName";

function TableDataInterfce({
  startDadeline,
  range,
  totalData,
  questions,
  thanaReport,
  id,
  slug,
  documentName,
}) {
  const { userInfo } = useContext(AuthContext);
  const [dateList, setDateList] = useState([]);
  const [dataListByDate, setDataListByDate] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    key: null,
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

    thanaReport?.forEach((thana) => {
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
                if (data.questionType === "number") {
                  value = Number(data.data);
                } else {
                  value = 0;
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
  }, [dateList, thanaReport, questions]);

  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const sortedDataListByDate = useMemo(() => {
    let sortableData = [...dataListByDate];
    if (sortConfig.key !== null) {
      sortableData.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (!isNaN(aValue) && !isNaN(bValue)) {
          return sortConfig.direction === "ascending"
            ? aValue - bValue
            : bValue - aValue;
        }

        return sortConfig.direction === "ascending"
          ? String(aValue).localeCompare(String(bValue))
          : String(bValue).localeCompare(String(aValue));
      });
    }
    return sortableData;
  }, [dataListByDate, sortConfig]);

  const exportToExcel = () => {
    const headers = ["দিন ও তারিখ", ...questions.map((q) => q.questionText)];

    const data = sortedDataListByDate.map((row) => [
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
    saveAs(blob, buildExportFileName(userInfo?.userId, "Branch", documentName));
  };

  return (
    <React.Fragment>
      {!sortedDataListByDate?.length ? (
        <Loader />
      ) : (
        <>
          <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1 }}>
            <Button
              size="small"
              variant="contained"
              startIcon={<FileDownloadIcon />}
              onClick={exportToExcel}
            >
              Export to Excel
            </Button>
          </Box>
        <TableContainer component={Paper} sx={{ overflowX: "auto" }}>
          <Table size="small" border={1}>
            <TableHead>
              <TableRow sx={{ bgcolor: "primary.main", textAlign: "center" }}>
                <TableCell
                  sx={{ color: "common.white", textAlign: "left", cursor: "pointer", fontWeight: "bold" }}
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
                    {question?.questionText}{" "}
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
                  ? totalData?.map((total, totalIndex) => (
                      <TableCell sx={{ color: "common.white", textAlign: "center" }} key={totalIndex}>
                        {total[totalIndex]}
                      </TableCell>
                    ))
                  : questions?.map((_, index) => (
                      <TableCell sx={{ color: "common.white", textAlign: "center" }} key={index}>0</TableCell>
                    ))}
                <TableCell sx={{ textAlign: "center" }} />
              </TableRow>
            </TableBody>
            <TableBody>
              {sortedDataListByDate?.map((data, dateIndex) => {
                return (
                  <TableRow key={dateIndex} sx={{ textAlign: "center", "&:hover": { bgcolor: "action.hover" } }}>
                    <TableCell sx={{ textAlign: "left" }}>
                      <BangladayDate day={data.day + 1} date={data.date} />
                    </TableCell>
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
                        to={`/dashboard/branch-interface/${dateIndex + 1}/${slug}`}
                        state={{ id }}
                      >
                        বিস্তারিত
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        </>
      )}
    </React.Fragment>
  );
}

export default TableDataInterfce;
