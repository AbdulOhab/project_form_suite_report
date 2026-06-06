import React, { useEffect, useState } from "react";
import BranchBangladayDate from "./BranchBangladayDate";
import { Link, useParams } from "react-router-dom";
import Loader from "./Loader";
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

function BranchDayCount({
  startDadeline,
  range,
  questions,
  thanaReport,
  totalData,
  endDadeline,
}) {
  const [formDisabled, setFormDisabled] = useState();

  const { dayId, noticeId } = useParams();

  const [dateList, setDateList] = useState([]);

  const [countUnSubmit, setCountUnSubmit] = useState();
  const [countSubmit, setCountSubmit] = useState();
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });

  useEffect(() => {
    const calculateDisabledState = ({ endDadeline, startDadeline }) => {
      const endDate = new Date(endDadeline);
      const startDate = new Date(startDadeline);
      const today = new Date();

      const timeDiff = endDate - today;
      const totalDays = endDate - startDate;

      const difference = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
      const dayDifference = Math.ceil(totalDays / (1000 * 60 * 60 * 24));

      if (
        (dayDifference === 0 && difference > 0) ||
        (difference >= 0 && dayDifference > 0)
      ) {
        return false;
      } else {
        return true;
      }
    };

    let isDisabled = calculateDisabledState({
      endDadeline,
      startDadeline,
    });
    setFormDisabled(isDisabled);
  }, [endDadeline, startDadeline]);

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
          const aAnswer = a?.answer?.answers?.find(
            (ans) => ans.questionText === sortConfig.key
          );
          const bAnswer = b?.answer?.answers?.find(
            (ans) => ans.questionText === sortConfig.key
          );
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

  return (
    <>
      {!dateList?.length ? (
        <Loader />
      ) : (
        dateList?.map((date, index) => {
          if (index + 1 === Number(dayId)) {
            return (
              <React.Fragment key={index}>
                <BranchBangladayDate
                  day={index + 1}
                  date={date}
                  dataUnSubmit={countUnSubmit}
                  dataSubmit={countSubmit}
                />
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
                            onClick={() => handleSort(question.questionText)}
                          >
                            {question?.questionText}{" "}
                            {sortConfig.key === question.questionText &&
                              (sortConfig.direction === "ascending"
                                ? " ▲"
                                : " ▼")}
                          </TableCell>
                        ))}
                        <TableCell sx={{ color: "common.white", textAlign: "center" }}>একশন</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow sx={{ bgcolor: "info.main", textAlign: "center" }}>
                        <TableCell sx={{ color: "error.main", textAlign: "center" }}></TableCell>
                        <TableCell sx={{ color: "error.main", textAlign: "center", fontWeight: "bold" }}>Total</TableCell>
                        {totalData.length
                          ? totalData?.map((total, totalIndex) => (
                              <TableCell sx={{ color: "error.main", textAlign: "center" }} key={totalIndex}>
                                {total[totalIndex]}
                              </TableCell>
                            ))
                          : questions?.map((_, index) => (
                              <TableCell sx={{ color: "error.main", textAlign: "center" }} key={index}>
                                0
                              </TableCell>
                            ))}
                        <TableCell sx={{ color: "error.main", textAlign: "center" }}>
                          <Box component="span" sx={{ opacity: 0.5 }}>&#128274;</Box>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                    <TableBody>
                      {sortedData?.map((thana, thanaIndex) => (
                        <TableRow key={thanaIndex} sx={{ textAlign: "center", "&:hover": { bgcolor: "action.hover" } }}>
                          <TableCell sx={{ textAlign: "center" }}>{thana.thanaCode}</TableCell>
                          <TableCell sx={{ textAlign: "center" }}>{thana.userName}</TableCell>
                          {questions?.map((question, qIndex) => {
                            const answer = thana?.answer?.answers?.find(
                              (ans) => ans.questionText === question.questionText
                            );
                            return (
                              <TableCell key={`${thanaIndex}-${qIndex}`} sx={{ textAlign: "center" }}>
                                {answer ? answer.data : 0}
                              </TableCell>
                            );
                          })}

                          <TableCell sx={{ textAlign: "center" }}>
                            {thana?.answer?._id ? (
                              <Button
                                variant="outlined"
                                color="success"
                                size="small"
                                component={Link}
                                to={`/dashboard/branch-edit-answer/${noticeId}/${thana?.answer?._id}`}
                              >
                                &#9998;
                              </Button>
                            ) : (
                              <Button
                                variant="contained"
                                color="primary"
                                size="small"
                                disabled={formDisabled}
                                component={Link}
                                to={`/dashboard/branch-empty-answer/${thana.thanaCode}/${noticeId}`}
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
