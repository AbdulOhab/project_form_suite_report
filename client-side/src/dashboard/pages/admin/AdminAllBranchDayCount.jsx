import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ZonalBangladayDate from "../../time/ZonalBangladayDate";
import Loader from "../../time/Loader";
import BASE_URL from "../../../auth/dbUrl";
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

function AdminAllBranchDayCount() {
  const { dayId, noticeId } = useParams();

  const [notice, setNotice] = useState();
  const [branchReport, setBranchReport] = useState([]);
  const [tempBranchData, setTempBranchData] = useState([]);
  const [branchSumArray, setBranchSumArray] = useState([]);
  const [questions, setQuestions] = useState();

  const [dateList, setDateList] = useState([]);
  const [countUnSubmit, setCountUnSubmit] = useState();
  const [countSubmit, setCountSubmit] = useState();

  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });

  const { startDadeline, range } = notice || {};

  useEffect(() => {
    const getAllBranches = async () => {
      try {
        const response = await fetch(
          `${BASE_URL}/admin/get-all-branches/${noticeId}/${dayId}/`,
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
          setNotice(data.question);
          setQuestions(data?.question?.questions);
          setBranchReport(data.tempBranch);
          setTempBranchData(data.tempData);
          setBranchSumArray(data.sumsArray);
        } else {
          throw new Error("Failed to fetch");
        }
      } catch (error) {
        console.error("Error fetching notice data:", error);
      }
    };
    getAllBranches();
  }, [noticeId, dayId]);

  useEffect(() => {
    const data = branchReport?.reduce(
      (acc, branch) => {
        if (Array.isArray(branch?.tempThana)) {
          acc.total += branch.tempThana?.length;
          acc.unsubmitted += branch.tempThana.filter(
            (thana) => thana?.answers?.length === 0
          )?.length;
        }
        return acc;
      },
      { unsubmitted: 0, total: 0 }
    );

    setCountUnSubmit(data?.unsubmitted);
    setCountSubmit(data?.total - data?.unsubmitted);
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

  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const sortedData = useMemo(() => {
    let sortableData = Array.isArray(tempBranchData) ? [...tempBranchData] : [];

    if (sortConfig.key !== null) {
      sortableData.sort((a, b) => {
        let aValue, bValue;

        if (
          sortConfig.key === "branchCode" ||
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
  }, [tempBranchData, sortConfig]);

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
                  totalUnsubmitted={countUnSubmit}
                  totalSubmitted={countSubmit}
                />
                <TableContainer component={Paper} sx={{ overflowX: "auto" }}>
                  <Table size="small" border={1}>
                    <TableHead>
                      <TableRow sx={{ bgcolor: "grey.100", textAlign: "center" }}>
                        <TableCell
                          sx={{ textAlign: "center", cursor: "pointer" }}
                          onClick={() => handleSort("branchCode")}
                        >
                          Branch Code
                          {sortConfig.key === "zonalCode" &&
                            (sortConfig.direction === "ascending" ? " ▲" : " ▼")}
                        </TableCell>
                        <TableCell
                          sx={{ textAlign: "center", cursor: "pointer" }}
                          onClick={() => handleSort("userName")}
                        >
                          Branch Name
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
                        <TableCell
                          sx={{ color: "common.white", fontWeight: "bold" }}
                          colSpan={5}
                        >
                          Total
                        </TableCell>
                        {branchSumArray?.length
                          ? branchSumArray?.map((value, index) => (
                              <TableCell sx={{ color: "common.white" }} key={index}>
                                {value[index]}
                              </TableCell>
                            ))
                          : questions.map((_, index) => (
                              <TableCell sx={{ color: "common.white" }} key={index}>
                                0
                              </TableCell>
                            ))}
                        <TableCell sx={{ color: "error.main" }}>
                          <Box component="span" sx={{ opacity: 0.5 }}>&#128274;</Box>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                    <TableBody>
                      {sortedData.map((branch, branchIndex) => (
                        <TableRow key={branchIndex} sx={{ textAlign: "center", "&:hover": { bgcolor: "action.hover" } }}>
                          <TableCell sx={{ textAlign: "center" }}>{branch.branchCode}</TableCell>
                          <TableCell sx={{ textAlign: "center" }}>{branch.userName}</TableCell>
                          <TableCell sx={{ textAlign: "center" }}>{branch.totalThana}</TableCell>
                          <TableCell sx={{ textAlign: "center" }}>{branch.thanaAnsSubmit}</TableCell>
                          <TableCell sx={{ textAlign: "center" }}>{branch.thanaAnsUnsubmit}</TableCell>
                          {questions?.map((question, qIndex) => (
                            <TableCell key={`${branchIndex}-${qIndex}`} sx={{ textAlign: "center" }}>
                              {branch?.[question.questionText] || 0}
                            </TableCell>
                          ))}
                          <TableCell sx={{ textAlign: "center" }}>
                            <Button
                              variant="contained"
                              color="success"
                              size="small"
                              component={Link}
                              to={`/dashboard/admin-data-perDayCount/${dayId}/${branch?.zonalCode}/${branch?.branchCode}/${noticeId}`}
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

export default AdminAllBranchDayCount;
