import React, { useMemo, useState } from "react";
import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import BASE_URL from "../../../auth/dbUrl";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
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
import CloseIcon from "@mui/icons-material/Close";
import DateDifferenceComponent from "../../time/DateDifferenceComponent";
import BangladayDate from "../../time/BangladayDate";
import convertToBengaliNumber from "../../time/NumberConverter";

function SumsTotalDayThanaData() {
  const { qId, zId, bId, tId } = useParams();

  const [descriptionAlert, setDescriptionAlert] = useState(false);

  const [answer, setAnswer] = useState();
  const [notice, setNotice] = useState();
  const [totalData, setTotalData] = useState();
  const [dateList, setDateList] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });
  const { questions, startDadeline, range, timeStart, timeEnd, endDadeline } =
    notice || [];

  useEffect(() => {
    const getThanaUsers = async () => {
      try {
        const response = await fetch(
          `${BASE_URL}/sums-Totol-day-thana-data/${qId}/${zId}/${bId}/${tId}`,
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
          setAnswer(data.answer);
          setNotice(data.question);
          setTotalData(data.sumsArray);
        } else {
          throw new Error("Failed to fetch");
        }
      } catch (error) {
        console.error("Error fetching notice data:", error);
      }
    };
    getThanaUsers();
  }, [qId, zId, bId, tId]);

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

  const descriptionHandler = () => {
    setDescriptionAlert(true);
  };
  const descriptionCloserHandler = () => {
    setDescriptionAlert(false);
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

      const matchingReports = answer.filter((report) => {
        const reportDate = formatDate(report.createdAt);

        return reportDate === formattedDate;
      });

      // Aggregate data for this date
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
  }, [dateList, answer, questions]);

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

  const validCardData = (endDadeline) => {
    const currentDate = new Date();
    const endDadelineDate = new Date(endDadeline);

    const timeDiff = endDadelineDate - currentDate;
    const diffInDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    return diffInDays;
  };

  const sortIndicator = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "ascending" ? " ▲" : " ▼";
  };

  return (
    <>
      {/* Description Dialog */}
      <Dialog
        open={descriptionAlert}
        onClose={descriptionCloserHandler}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: "flex", justifyContent: "flex-end", p: 1 }}>
          <IconButton onClick={descriptionCloserHandler}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography>{notice?.doc_desc}</Typography>
        </DialogContent>
      </Dialog>

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
          {/* Left - Date Info */}
          <Paper variant="outlined" sx={{ p: 1.5, flex: "1 1 auto", minWidth: 200 }}>
            {validCardData(endDadeline) < 0 ? (
              <Typography
                sx={{
                  textAlign: "center",
                  fontSize: "1.25rem",
                  fontWeight: "bold",
                  color: "error.main",
                }}
              >
                নোটিশ শেষ হয়েছে{" "}
                {convertToBengaliNumber(Math.abs(validCardData(endDadeline)))}{" "}
                দিন আগে
              </Typography>
            ) : (
              <DateDifferenceComponent
                startDadeline={startDadeline}
                range={range}
                timeStart={timeStart}
                timeEnd={timeEnd}
                endDadeline={endDadeline}
              />
            )}
          </Paper>

          {/* Middle - Title */}
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
            {!descriptionAlert && (
              <Button variant="outlined" onClick={descriptionHandler}>
                Notice
              </Button>
            )}
            <Button
              component={Link}
              variant="contained"
              to={`/dashboard/sums-all-thana-data/${qId}`}
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
                {questions?.map((question, index) => (
                  <TableCell
                    key={index}
                    onClick={() => handleSort(question.questionText)}
                  >
                    {question.questionText}
                    {sortIndicator(question.questionText)}
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
              {sortedDataList?.map((data, index) => (
                <TableRow
                  key={index}
                  hover
                  sx={{ "&:hover": { bgcolor: "action.hover" } }}
                >
                  <TableCell sx={{ textAlign: "center" }}>
                    <BangladayDate day={data.day + 1} date={data.date} />
                  </TableCell>
                  {questions?.map((question, qIndex) => (
                    <TableCell key={qIndex} sx={{ textAlign: "center" }}>
                      {data[question.questionText]
                        ? data[question.questionText]
                        : 0}
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
}

export default SumsTotalDayThanaData;
