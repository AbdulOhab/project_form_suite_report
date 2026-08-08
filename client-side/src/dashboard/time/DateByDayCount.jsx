import React, { useEffect, useState, useMemo } from "react";
import BangladayDate from "./BangladayDate";
import { Link } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
} from "@mui/material";
import LockOutlined from "@mui/icons-material/LockOutlined";

function DateByDayCount({
  startDadeline,
  range,
  timeStart,
  timeEnd,
  thanaReport = [],
  questions = [],
  totalData = [],
  id,
  slug,
}) {
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

  const today = new Date().toISOString().split("T")[0];

  // Notices restrict submission to a daily [timeStart, timeEnd] window (which
  // can cross midnight, e.g. 16:56–02:47) — matching the calendar day alone
  // isn't enough, the clock also has to be inside that window right now.
  const isWithinTimeWindow = (start, end) => {
    if (!start || !end) return true;
    const [startH, startM] = start.split(":").map(Number);
    const [endH, endM] = end.split(":").map(Number);
    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;
    if (startMinutes <= endMinutes) {
      return nowMinutes >= startMinutes && nowMinutes <= endMinutes;
    }
    return nowMinutes >= startMinutes || nowMinutes <= endMinutes;
  };

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

  // Questions can be reordered/inserted after submissions already exist, so
  // an answer's position in its answers[] array no longer lines up with the
  // current question list's position. Match by questionId (stable across
  // edits) and only fall back to position for answers submitted before
  // questionId existed.
  const getAnswerAt = (answersArr, qIndex) => {
    if (!Array.isArray(answersArr)) return undefined;
    const wantedId = questions?.[qIndex]?.questionId;
    if (wantedId) {
      const byId = answersArr.find((a) => a?.questionId === wantedId);
      if (byId) return byId;
      if (answersArr.some((a) => a?.questionId)) return undefined;
    }
    return answersArr[qIndex];
  };

  const sortedData = useMemo(() => {
    if (!dateList.length || !questions.length) return [];

    const dataByDate = dateList.map((date, day) => {
      const formattedDate = formatDate(date);

      const matchingReports = thanaReport.filter((report) => {
        const matchDate = report.reportDate
          ? formatDate(report.reportDate)
          : formatDate(report.createdAt);
        return matchDate === formattedDate;
      });

      const dataForDate = {};
      questions.forEach((q, qIndex) => {
        dataForDate[qIndex] = matchingReports
          .flatMap((report) => {
            const answer = getAnswerAt(report.answers, qIndex);
            return answer ? [answer.data] : [];
          })
          .join("\n");
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
                sx={{ color: "common.white", textAlign: "left", cursor: "pointer" }}
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
                  onClick={() => handleSort(index)}
                >
                  {question.questionText}{" "}
                  {sortConfig.key === index &&
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
                questions.map((_, qIndex) => (
                  <TableCell sx={{ color: "common.white", textAlign: "center" }} key={qIndex}>
                    0
                  </TableCell>
                ))
              )}
              <TableCell sx={{ textAlign: "center" }} />
            </TableRow>
            {sortedDataList.map((data, index) => (
              <TableRow
                key={index}
                sx={{ "&:hover": { bgcolor: "action.hover" } }}
              >
                <TableCell sx={{ textAlign: "left" }}>
                  <BangladayDate day={data.day + 1} date={data.date} />
                </TableCell>
                {questions.map((question, qIndex) => (
                  <TableCell key={qIndex} sx={{ textAlign: "center", whiteSpace: "pre-line" }}>
                    {data[qIndex] || "0"}
                  </TableCell>
                ))}
                <TableCell sx={{ textAlign: "center" }}>
                  {data.answerId ? (
                    <Button
                      variant="outlined"
                      color="inherit"
                      size="small"
                      disabled
                      sx={{ minWidth: 0, px: 1 }}
                    >
                      <LockOutlined fontSize="small" />
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      disabled={data.date !== today || !isWithinTimeWindow(timeStart, timeEnd)}
                      component={Link}
                      to={`/dashboard/thana-empty-answer/${slug}/${data.date}`}
                      state={{ id }}
                    >
                      সাবমিট
                    </Button>
                  )}
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
