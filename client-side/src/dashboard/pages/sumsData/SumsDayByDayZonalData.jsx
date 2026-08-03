import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { buildNoticeSlug } from "../../../utils/noticeSlug";
import BASE_URL from "../../../auth/dbUrl";
import {
  Box,
  Button,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import BangladayDate from "../../time/BangladayDate";

const SumsDayByDayZonalData = () => {
  const { qId, zId } = useParams();

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

  return (
    <>
      <Paper elevation={2} sx={{ p: 2, my: 1 }}>
        {/* Header Section */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2,
            mb: 2,
          }}
        >
          {/* Title */}
          <Box sx={{ textAlign: "center", flex: "2 1 auto" }}>
            <Typography
              variant="h5"
              sx={{
                textAlign: "center",
                fontWeight: 600,
                color: "primary.main",
              }}
            >
              {notice?.document_name}
            </Typography>
            {notice?.sub_title && (
              <Typography variant="body2" sx={{ textAlign: "center" }}>
                {notice?.sub_title}
              </Typography>
            )}
          </Box>

          {/* Right - Actions */}
          <Stack
            direction="column"
            alignItems="flex-end"
            justifyContent="flex-end"
            spacing={1}
            sx={{ flex: "1 1 auto", minWidth: 120 }}
          >
            <Button
              component={Link}
              variant="contained"
              to={`/dashboard/sums-all-zonal-data/${buildNoticeSlug(notice)}`}
              state={{ id: qId }}
            >
              Back
            </Button>
          </Stack>
        </Box>
      </Paper>

      {/* Day-by-Day Table */}
      <Paper elevation={2} sx={{ p: 2, my: 2 }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow
                sx={{
                  bgcolor: "primary.main",
                  "& th": {
                    color: "white",
                    fontWeight: "bold",
                    cursor: "pointer",
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
                  "& th, & td": { color: "white", fontWeight: "bold" },
                }}
              >
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Total
                </TableCell>
                {totalData?.length ? (
                  totalData?.map((sum, sIndex) => (
                    <TableCell
                      sx={{ color: "white", fontWeight: "bold" }}
                      key={sIndex}
                    >
                      {sum ? sum[sIndex] : 0}
                    </TableCell>
                  ))
                ) : (
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>
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
      </Paper>
    </>
  );
};

export default SumsDayByDayZonalData;
