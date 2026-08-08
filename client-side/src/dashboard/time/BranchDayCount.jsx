import React, { useContext, useEffect, useState } from "react";
import BranchBangladayDate from "./BranchBangladayDate";
import { Link, useParams } from "react-router-dom";
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

function BranchDayCount({
  startDadeline,
  range,
  questions,
  thanaReport,
  totalData,
  noticeId,
  timeStart,
  timeEnd,
  documentName,
  slug,
}) {
  const { userInfo } = useContext(AuthContext);
  const { dayId } = useParams();

  // Branch can edit/submit up to 2 hours after the notice's timeEnd.
  const EDIT_GRACE_MINUTES = 120;
  const isWithinTimeWindow = (start, end) => {
    if (!start || !end) return true;
    const [startH, startM] = start.split(":").map(Number);
    const [endH, endM] = end.split(":").map(Number);
    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM + EDIT_GRACE_MINUTES;
    if (startMinutes <= endMinutes) {
      return nowMinutes >= startMinutes && nowMinutes <= endMinutes;
    }
    return nowMinutes >= startMinutes || nowMinutes <= endMinutes;
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

  const [dateList, setDateList] = useState([]);

  const [countUnSubmit, setCountUnSubmit] = useState();
  const [countSubmit, setCountSubmit] = useState();
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });

  useEffect(() => {
    let count = 0;
    thanaReport?.forEach((ans) => {
      if (ans.answer === null) {
        count = count + 1;
      }
    });
    setCountUnSubmit(count);
    setCountSubmit(thanaReport?.length - count);
  }, [thanaReport]);

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

  const sortedData = React.useMemo(() => {
    let sortableData = Array.isArray(thanaReport) ? [...thanaReport] : [];
    if (sortConfig.key !== null) {
      sortableData.sort((a, b) => {
        let aValue, bValue;

        if (sortConfig.key === "thanaCode") {
          aValue = a.thanaCode;
          bValue = b.thanaCode;
        } else if (sortConfig.key === "userName") {
          aValue = a.userName;
          bValue = b.userName;
        } else {
          const aAnswer = getAnswerAt(a?.answer?.answers, sortConfig.key);
          const bAnswer = getAnswerAt(b?.answer?.answers, sortConfig.key);
          aValue = aAnswer ? aAnswer.data : "";
          bValue = bAnswer ? bAnswer.data : "";
        }

        if (!isNaN(aValue) && !isNaN(bValue)) {
          return sortConfig.direction === "ascending"
            ? aValue - bValue
            : bValue - aValue;
        }

        return sortConfig.direction === "ascending"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      });
    }
    return sortableData;
  }, [thanaReport, sortConfig]);

  const exportToExcel = () => {
    const headers = ["থানা কোড", "থানা নাম", ...questions.map((q) => q.questionText)];

    const data = sortedData.map((thana) => [
      thana.thanaCode,
      thana.userName,
      ...questions.map((_, qIndex) => {
        const answer = getAnswerAt(thana?.answer?.answers, qIndex);
        return answer ? answer.data : 0;
      }),
    ]);

    const totalRow = [
      "",
      "Total",
      ...(totalData?.length
        ? totalData.map((value, index) => value[index] || 0)
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
    saveAs(blob, buildExportFileName(userInfo?.userId, "Branch", documentName));
  };

  return (
    <>
      {!dateList?.length ? (
        <Loader />
      ) : (
        dateList?.map((date, index) => {
          if (index + 1 === Number(dayId)) {
            const formattedDate = date.toISOString().split("T")[0];
            const isToday =
              formattedDate === new Date().toISOString().split("T")[0];
            const canEdit = isToday && isWithinTimeWindow(timeStart, timeEnd);

            return (
              <React.Fragment key={index}>
                <BranchBangladayDate
                  day={index + 1}
                  date={date}
                  dataUnSubmit={countUnSubmit}
                  dataSubmit={countSubmit}
                />
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
                          sx={{ color: "common.white", textAlign: "center", cursor: "pointer" }}
                          onClick={() => handleSort("thanaCode")}
                        >
                          থানা কোড{" "}
                          {sortConfig.key === "thanaCode" &&
                            (sortConfig.direction === "ascending" ? " ▲" : " ▼")}
                        </TableCell>
                        <TableCell
                          sx={{ color: "common.white", textAlign: "center", cursor: "pointer" }}
                          onClick={() => handleSort("userName")}
                        >
                          থানা নাম{" "}
                          {sortConfig.key === "userName" &&
                            (sortConfig.direction === "ascending" ? " ▲" : " ▼")}
                        </TableCell>
                        {questions?.map((question, index) => (
                          <TableCell
                            sx={{ color: "common.white", textAlign: "center", cursor: "pointer" }}
                            key={index}
                            onClick={() => handleSort(index)}
                          >
                            {question?.questionText}{" "}
                            {sortConfig.key === index &&
                              (sortConfig.direction === "ascending"
                                ? " ▲"
                                : " ▼")}
                          </TableCell>
                        ))}
                        <TableCell sx={{ color: "common.white", textAlign: "center" }}>একশন</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow sx={{ bgcolor: "primary.main", textAlign: "center" }}>
                        <TableCell sx={{ color: "common.white", textAlign: "center" }}></TableCell>
                        <TableCell sx={{ color: "common.white", textAlign: "center", fontWeight: "bold" }}>Total</TableCell>
                        {totalData.length
                          ? totalData?.map((total, totalIndex) => (
                              <TableCell sx={{ color: "common.white", textAlign: "center" }} key={totalIndex}>
                                {total[totalIndex]}
                              </TableCell>
                            ))
                          : questions?.map((_, index) => (
                              <TableCell sx={{ color: "common.white", textAlign: "center" }} key={index}>
                                0
                              </TableCell>
                            ))}
                        <TableCell sx={{ color: "common.white", textAlign: "center" }} />
                      </TableRow>
                    </TableBody>
                    <TableBody>
                      {sortedData?.map((thana, thanaIndex) => (
                        <TableRow key={thanaIndex} sx={{ textAlign: "center", "&:hover": { bgcolor: "action.hover" } }}>
                          <TableCell sx={{ textAlign: "center" }}>{thana.thanaCode}</TableCell>
                          <TableCell sx={{ textAlign: "center" }}>{thana.userName}</TableCell>
                          {questions?.map((question, qIndex) => {
                            const answer = getAnswerAt(thana?.answer?.answers, qIndex);
                            return (
                              <TableCell key={`${thanaIndex}-${qIndex}`} sx={{ textAlign: "center" }}>
                                {answer ? answer.data : 0}
                              </TableCell>
                            );
                          })}

                          <TableCell sx={{ textAlign: "center" }}>
                            {thana?.answer?._id ? (
                              <Button
                                variant="contained"
                                color="primary"
                                size="small"
                                disabled={!canEdit}
                                component={Link}
                                to={`/dashboard/branch-edit-answer/${slug}/${noticeId}/${thana?.answer?._id}`}
                              >
                                এডিট
                              </Button>
                            ) : (
                              <Button
                                variant="contained"
                                color="primary"
                                size="small"
                                disabled={!canEdit}
                                component={Link}
                                to={`/dashboard/branch-empty-answer/${slug}/${thana.thanaCode}/${noticeId}/${formattedDate}`}
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
              </React.Fragment>
            );
          } else {
            return null;
          }
        })
      )}
    </>
  );
}

export default BranchDayCount;
