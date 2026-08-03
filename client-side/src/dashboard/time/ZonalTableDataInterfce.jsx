import React, { useEffect, useState, useMemo } from "react";
import BangladayDate from "./BangladayDate";
import { Link } from "react-router-dom";
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
} from "@mui/material";

function ZonalTableDataInterfce({
  startDadeline,
  range,
  totalData,
  questions,
  branchReport,
  id,
  slug,
}) {
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
    branchReport?.forEach((branch) => {
      if (branch.tempThana && Array.isArray(branch.tempThana)) {
        branch?.tempThana?.forEach((thana) => {
          if (thana.answer && Array.isArray(thana.answer)) {
            thana.answer.forEach((ans) => {
              dateList.forEach((date) => {
                const formattedDate = formatDate(date);
                if (formattedDate === formatDate(ans.updatedAt)) {
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
  }, [dateList, branchReport, questions]);

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
  }, [dataListByDate, sortConfig]);

  return (
    <React.Fragment>
      {!sortedDataListByDate?.length ? (
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
                {totalData?.length
                  ? totalData.map((value, index) => (
                      <TableCell sx={{ color: "common.white", textAlign: "center" }} key={index}>
                        {value[index]}
                      </TableCell>
                    ))
                  : questions?.map((_, index) => (
                      <TableCell sx={{ color: "common.white", textAlign: "center" }} key={index}>
                        0
                      </TableCell>
                    ))}
                <TableCell sx={{ textAlign: "center" }} />
              </TableRow>
            </TableBody>
            <TableBody>
              {sortedDataListByDate.map((currentDateData, dateIndex) => {
                return (
                  <TableRow key={dateIndex} sx={{ textAlign: "center", "&:hover": { bgcolor: "action.hover" } }}>
                    <TableCell sx={{ textAlign: "left" }}>
                      <BangladayDate
                        day={currentDateData.day + 1}
                        date={currentDateData.date}
                      />
                    </TableCell>
                    {questions.map((question, questionIndex) => (
                      <TableCell key={questionIndex} sx={{ textAlign: "center" }}>
                        {currentDateData[questionIndex] || "0"}
                      </TableCell>
                    ))}
                    <TableCell sx={{ textAlign: "center" }}>
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        component={Link}
                        to={`/dashboard/zonal-interface/${dateIndex + 1}/${slug}`}
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
      )}
    </React.Fragment>
  );
}

export default ZonalTableDataInterfce;
