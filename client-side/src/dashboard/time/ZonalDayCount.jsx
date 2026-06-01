import React, { useEffect, useState, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import ZonalBangladayDate from "./ZonalBangladayDate";
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

function ZonalDayCount({
  startDadeline,
  range,
  questions,
  branchReport,
  totalData,
}) {
  const { dayId, noticeId } = useParams();

  const [dateList, setDateList] = useState([]);
  const [countUnSubmit, setCountUnSubmit] = useState();
  const [countSubmit, setCountSubmit] = useState();
  const [branchData, setBranchData] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });

  useEffect(() => {
    let count = 0;
    let thanaLength = 0;
    branchReport?.forEach((branch) => {
      if (branch?.tempThana && Array.isArray(branch?.tempThana)) {
        thanaLength += branch?.tempThana?.length;
        branch?.tempThana.forEach((thana) => {
          if (thana?.answer?.length === 0) {
            count += 1;
          }
        });
      }
    });
    setCountUnSubmit(count);
    setCountSubmit(thanaLength - count);
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

  useEffect(() => {
    let tempData = branchReport?.map((branch) => {
      let sums = {};
      branch.tempThana.forEach((thana) => {
        thana?.answer?.forEach((ans) => {
          ans?.answers?.forEach((data) => {
            let questionText = data?.questionText;
            if (data?.questionType === "number") {
              let value = Number(data?.data);
              if (!sums[questionText]) {
                sums[questionText] = 0;
              }
              sums[questionText] += value;
            }
          });
        });
      });
      return { ...branch, sums };
    });
    setBranchData(tempData);
  }, [branchReport]);

  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const sortedData = useMemo(() => {
    let sortableData = Array.isArray(branchData) ? [...branchData] : [];
    if (sortConfig.key !== null) {
      sortableData.sort((a, b) => {
        let aValue = a[sortConfig.key] || a.sums[sortConfig.key];
        let bValue = b[sortConfig.key] || b.sums[sortConfig.key];

        if (!isNaN(aValue) && !isNaN(bValue)) {
          return sortConfig.direction === "ascending"
            ? aValue - bValue
            : bValue - aValue;
        }

        if (aValue < bValue) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableData;
  }, [branchData, sortConfig]);

  return (
    <>
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
                  dataUnSubmit={countUnSubmit}
                  dataSubmit={countSubmit}
                />
                <TableContainer component={Paper} sx={{ overflowX: "auto" }}>
                  <Table size="small" border={1}>
                    <TableHead>
                      <TableRow sx={{ bgcolor: "primary.main", textAlign: "center" }}>
                        <TableCell
                          sx={{ color: "common.white", textAlign: "center", cursor: "pointer" }}
                          onClick={() => handleSort("branchCode")}
                        >
                          Branch Code
                          {sortConfig.key === "branchCode" &&
                            (sortConfig.direction === "ascending" ? " ▲" : " ▼")}
                        </TableCell>
                        <TableCell
                          sx={{ color: "common.white", textAlign: "center", cursor: "pointer" }}
                          onClick={() => handleSort("userName")}
                        >
                          Branch Name
                          {sortConfig.key === "userName" &&
                            (sortConfig.direction === "ascending" ? " ▲" : " ▼")}
                        </TableCell>
                        {questions?.map((question, index) => (
                          <TableCell
                            sx={{ color: "common.white", textAlign: "center", cursor: "pointer" }}
                            key={index}
                            onClick={() => handleSort(question.questionText)}
                          >
                            {question?.questionText}
                            {sortConfig.key === question.questionText &&
                              (sortConfig.direction === "ascending"
                                ? " ▲"
                                : " ▼")}
                          </TableCell>
                        ))}
                        <TableCell sx={{ color: "common.white", textAlign: "center" }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow sx={{ bgcolor: "info.main", textAlign: "center" }}>
                        <TableCell sx={{ color: "error.main", textAlign: "center" }}></TableCell>
                        <TableCell sx={{ color: "error.main", textAlign: "center", fontWeight: "bold" }}>Total</TableCell>
                        {totalData?.map((total, totalIndex) => (
                          <TableCell sx={{ color: "error.main", textAlign: "center" }} key={totalIndex}>
                            {total[totalIndex]}
                          </TableCell>
                        ))}
                        <TableCell sx={{ color: "error.main", textAlign: "center" }}>
                          <Box component="span" sx={{ opacity: 0.5 }}>&#128274;</Box>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                    <TableBody>
                      {sortedData.map((branch, branchIndex) => (
                        <TableRow key={branchIndex} sx={{ textAlign: "center", "&:hover": { bgcolor: "action.hover" } }}>
                          <TableCell sx={{ textAlign: "center" }}>{branch.branchCode}</TableCell>
                          <TableCell sx={{ textAlign: "center" }}>{branch.userName}</TableCell>
                          {questions?.map((question, qIndex) => (
                            <TableCell key={`${branchIndex}-${qIndex}`} sx={{ textAlign: "center" }}>
                              {branch.sums[question.questionText]}
                            </TableCell>
                          ))}
                          <TableCell sx={{ textAlign: "center" }}>
                            <Button
                              variant="contained"
                              color="success"
                              size="small"
                              component={Link}
                              to={`/dashboard/zonal-data-perDayCount/${dayId}/${branch?.branchCode}/${noticeId}`}
                            >
                              +
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
    </>
  );
}

export default ZonalDayCount;
