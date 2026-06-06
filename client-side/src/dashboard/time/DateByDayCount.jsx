import React, { useEffect, useState, useMemo } from "react";
import BangladayDate from "./BangladayDate";
import { Link, useParams } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Box,
} from "@mui/material";

function DateByDayCount({
  startDadeline,
  range,
  thanaReport = [],
  questions = [],
  totalData = [],
}) {
  const { id } = useParams();
  const [dateList, setDateList] = useState([]);
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

  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const sortedData = useMemo(() => {
    if (!dateList.length || !questions.length) return [];

    const dataByDate = dateList.map((date, day) => {
      const formattedDate = formatDate(date);

      const matchingReports = thanaReport.filter((report) => {
        const reportDate = formatDate(report.createdAt);
        return reportDate === formattedDate;
      });

      const dataForDate = {};
      questions.forEach((q) => {
        dataForDate[q.questionText] = matchingReports
          .flatMap((report) =>
            report.answers
              .filter((answer) => answer.questionText === q.questionText)
              .map((answer) => answer.data)
          )
          .join(", ");
      });

      return {
        date: formattedDate,
        day,
        answerId: matchingReports.length ? matchingReports[0]._id : null,
        ...dataForDate,
      };
    });

    return dataByDate;
  }, [dateList, thanaReport, questions]);

  const sortedDataList = useMemo(() => {
    let sortableData = [...sortedData];
    if (sortConfig.key !== null) {
      sortableData.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (sortConfig.key === "date") {
          const aDate = new Date(aValue);
          const bDate = new Date(bValue);
          return sortConfig.direction === "ascending"
            ? aDate - bDate
            : bDate - aDate;
        }

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
  }, [sortedData, sortConfig]);

  return (
    <>
      <TableContainer component={Paper} sx={{ overflowX: "auto" }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: "primary.main", textTransform: "capitalize" }}>
              <TableCell
                sx={{ color: "common.white", textAlign: "center", cursor: "pointer" }}
                onClick={() => handleSort("date")}
              >
                দিন ও তারিখ{" "}
                {sortConfig.key === "date" &&
                  (sortConfig.direction === "ascending" ? "▲" : "▼")}
              </TableCell>
              {questions.map((question, index) => (
                <TableCell
                  sx={{ color: "common.white", textAlign: "center", cursor: "pointer" }}
                  key={index}
                  onClick={() => handleSort(question.questionText)}
                >
                  {question.questionText}{" "}
                  {sortConfig.key === question.questionText &&
                    (sortConfig.direction === "ascending" ? "▲" : "▼")}
                </TableCell>
              ))}
              <TableCell sx={{ color: "common.white", textAlign: "center" }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow sx={{ bgcolor: "primary.main" }}>
              <TableCell sx={{ color: "common.white", textAlign: "center", fontWeight: "bold" }}>Total</TableCell>
              {totalData?.length ? (
                totalData?.map((sum, sIndex) => (
                  <TableCell sx={{ color: "common.white", textAlign: "center" }} key={sIndex}>
                    {Object.values(sum)[0]}
                  </TableCell>
                ))
              ) : (
                <TableCell sx={{ color: "common.white", textAlign: "center" }}>0</TableCell>
              )}
              <TableCell sx={{ color: "error.main", textAlign: "center" }}>
                <Box component="span" sx={{ opacity: 0.5 }}>&#128274;</Box>
              </TableCell>
            </TableRow>
            {sortedDataList.map((data, index) => (
              <TableRow
                key={index}
                sx={{ "&:hover": { bgcolor: "action.hover" } }}
              >
                <TableCell sx={{ textAlign: "center" }}>
                  <BangladayDate day={data.day + 1} date={data.date} />
                </TableCell>
                {questions.map((question, qIndex) => (
                  <TableCell key={qIndex} sx={{ textAlign: "center" }}>
                    {data[question.questionText]}
                  </TableCell>
                ))}
                <TableCell sx={{ textAlign: "center" }}>
                  <Button
                    variant="contained"
                    color="success"
                    size="small"
                    disabled={!data.answerId}
                    component={Link}
                    to={`/dashboard/thana-edit-answer/${id}/${data.answerId}`}
                  >
                    &#9998;
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}

export default DateByDayCount;
