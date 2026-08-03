import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Loader from "../../time/Loader";
import BangladayForOnce from "../../time/BangladayForOnce";
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

function AdminTableDataInterfce({
  startDadeline,
  range,
  totalData,
  questions,
  zonalReport,
  id,
}) {
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
                    if (formattedDate === formatDate(ans.updatedAt)) {
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

  return (
    <React.Fragment>
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
                      color="success"
                      size="small"
                      component={Link}
                      to={`/dashboard/admin-interface/${dateIndex + 1}/${id}`}
                    >
                      +
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </React.Fragment>
  );
}

export default AdminTableDataInterfce;
