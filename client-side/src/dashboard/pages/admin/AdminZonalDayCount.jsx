import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ZonalBangladayDate from "../../time/ZonalBangladayDate";
import Loader from "../../time/Loader";
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

function AdminZonalDayCount({
  startDadeline,
  range,
  questions,
  totalData,
  branchData,
  countUnSubmit,
  countSubmit,
}) {
  const { dayId, noticeId } = useParams();

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
        let aValue, bValue;

        if (
          sortConfig.key === "zonalCode" ||
          sortConfig.key === "userName" ||
          sortConfig.key === "totalThana" ||
          sortConfig.key === "thanaAnsSubmit" ||
          sortConfig.key === "thanaAnsUnsubmit"
        ) {
          aValue = a[sortConfig.key];
          bValue = b[sortConfig.key];
        } else {
          aValue = a[sortConfig.key] || 0;
          bValue = b[sortConfig.key] || 0;
        }

        if (!isNaN(aValue) && !isNaN(bValue)) {
          return sortConfig.direction === "ascending"
            ? aValue - bValue
            : bValue - aValue;
        }

        if (typeof aValue === "string" && typeof bValue === "string") {
          return sortConfig.direction === "ascending"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
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
        dateList.map((date, index) => {
          if (index + 1 === Number(dayId)) {
            return (
              <React.Fragment key={index}>
                <ZonalBangladayDate
                  day={index + 1}
                  date={date}
                  totalSubmitted={countSubmit}
                  totalUnsubmitted={countUnSubmit}
                />
                <TableContainer component={Paper} sx={{ overflowX: "auto" }}>
                  <Table size="small" border={1}>
                    <TableHead>
                      <TableRow sx={{ bgcolor: "grey.100", textAlign: "center" }}>
                        <TableCell
                          sx={{ textAlign: "center", cursor: "pointer" }}
                          onClick={() => handleSort("zonalCode")}
                        >
                          Zonal Code
                          {sortConfig.key === "zonalCode" &&
                            (sortConfig.direction === "ascending" ? " ▲" : " ▼")}
                        </TableCell>
                        <TableCell
                          sx={{ textAlign: "center", cursor: "pointer" }}
                          onClick={() => handleSort("userName")}
                        >
                          Zonal Name
                          {sortConfig.key === "userName" &&
                            (sortConfig.direction === "ascending" ? " ▲" : " ▼")}
                        </TableCell>
                        <TableCell
                          sx={{ textAlign: "center", cursor: "pointer" }}
                          onClick={() => handleSort("totalThana")}
                        >
                          Total Thana
                          {sortConfig.key === "totalThana" &&
                            (sortConfig.direction === "ascending" ? " ▲" : " ▼")}
                        </TableCell>
                        <TableCell
                          sx={{ textAlign: "center", cursor: "pointer" }}
                          onClick={() => handleSort("thanaAnsSubmit")}
                        >
                          Submit
                          {sortConfig.key === "thanaAnsSubmit" &&
                            (sortConfig.direction === "ascending" ? " ▲" : " ▼")}
                        </TableCell>
                        <TableCell
                          sx={{ textAlign: "center", cursor: "pointer" }}
                          onClick={() => handleSort("thanaAnsUnsubmit")}
                        >
                          Unsubmit
                          {sortConfig.key === "thanaAnsUnsubmit" &&
                            (sortConfig.direction === "ascending" ? " ▲" : " ▼")}
                        </TableCell>
                        {questions?.map((question, index) => (
                          <TableCell
                            sx={{ textAlign: "center", cursor: "pointer" }}
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
                        <TableCell sx={{ textAlign: "center" }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow sx={{ bgcolor: "primary.main", textAlign: "center" }}>
                        <TableCell sx={{ color: "common.white" }}></TableCell>
                        <TableCell
                          sx={{ color: "common.white", fontWeight: "bold" }}
                          colSpan={4}
                        >
                          Total
                        </TableCell>
                        {totalData.length
                          ? totalData?.map((value, index) => (
                              <TableCell sx={{ color: "common.white" }} key={index}>
                                {value[index]}
                              </TableCell>
                            ))
                          : questions.map((_, index) => (
                              <TableCell sx={{ color: "common.white" }} key={index}>
                                0
                              </TableCell>
                            ))}
                        <TableCell sx={{ color: "common.white" }}>
                          <Box component="span" sx={{ opacity: 0.5 }}>&#128274;</Box>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                    <TableBody>
                      {sortedData.map((zonal, zonalIndex) => (
                        <TableRow key={zonalIndex} sx={{ textAlign: "center", "&:hover": { bgcolor: "action.hover" } }}>
                          <TableCell sx={{ textAlign: "center" }}>{zonal.zonalCode}</TableCell>
                          <TableCell sx={{ textAlign: "center" }}>{zonal.userName}</TableCell>
                          <TableCell sx={{ textAlign: "center" }}>{zonal.totalThana}</TableCell>
                          <TableCell sx={{ textAlign: "center" }}>{zonal.thanaAnsSubmit}</TableCell>
                          <TableCell sx={{ textAlign: "center" }}>{zonal.thanaAnsUnsubmit}</TableCell>
                          {questions?.map((question, questionIndex) => (
                            <TableCell key={`${zonalIndex}-${questionIndex}`} sx={{ textAlign: "center" }}>
                              {zonal[question.questionText] || 0}
                            </TableCell>
                          ))}
                          <TableCell sx={{ textAlign: "center" }}>
                            <Button
                              variant="contained"
                              color="success"
                              size="small"
                              component={Link}
                              to={`/dashboard/admin-branch-interface/${dayId}/${zonal?.zonalCode}/${noticeId}`}
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

export default AdminZonalDayCount;
