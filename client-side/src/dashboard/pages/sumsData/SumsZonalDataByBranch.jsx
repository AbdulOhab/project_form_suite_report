import React, { useEffect, useMemo, useState } from "react";
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
import convertToBengaliNumber from "../../time/NumberConverter";
import DateDifferenceComponent from "../../time/DateDifferenceComponent";

const SumsZonalDataByBranch = () => {
  const { qId, zId } = useParams();
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });
  const [descriptionAlert, setDescriptionAlert] = useState(false);

  const [tempData, setTempData] = useState();
  const [notice, setNotice] = useState();
  const [questions, setQuestions] = useState();
  const [totalData, setTotalData] = useState();

  useEffect(() => {
    const getZonalaDataByBranch = async () => {
      const response = await fetch(
        `${BASE_URL}/sums-zonal-data-by-branch/${qId}/${zId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + window.localStorage.getItem("gsmToken"),
          },
        }
      );
      const data = await response.json();
      if (response.ok) {
        setTempData(data.tempData);
        setNotice(data.question);
        setQuestions(data.question);

        setTotalData(data.sumsArray);
      } else {
        throw new Error("Failed to fetch");
      }
    };

    getZonalaDataByBranch();
  }, [zId, qId]);

  const descriptionHandler = () => {
    setDescriptionAlert(true);
  };
  const descriptionCloserHandler = () => {
    setDescriptionAlert(false);
  };

  const validCardData = (endDadeline) => {
    const currentDate = new Date();
    const endDadelineDate = new Date(endDadeline);

    const timeDiff = endDadelineDate - currentDate;
    const diffInDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    return diffInDays;
  };
  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const sortedData = useMemo(() => {
    let sortableData = Array.isArray(tempData) ? [...tempData] : [];

    if (sortConfig.key !== null) {
      sortableData.sort((a, b) => {
        let aValue, bValue;

        // Check if sorting key is a predefined column or dynamic question
        if (sortConfig.key === "zonalCode" || sortConfig.key === "userName") {
          aValue = a[sortConfig.key];
          bValue = b[sortConfig.key];
        } else {
          // Sort by question values dynamically
          aValue = a[sortConfig.key] || 0; // Default to 0 if key doesn't exist
          bValue = b[sortConfig.key] || 0;
        }

        // Handle numeric sorting
        if (!isNaN(aValue) && !isNaN(bValue)) {
          return sortConfig.direction === "ascending"
            ? aValue - bValue
            : bValue - aValue;
        }

        // Handle string sorting
        if (typeof aValue === "string" && typeof bValue === "string") {
          return sortConfig.direction === "ascending"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        return 0; // Default case for undefined or mixed data
      });
    }

    return sortableData;
  }, [tempData, sortConfig]);

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
            {validCardData(notice?.endDadeline) < 0 ? (
              <Typography
                sx={{
                  textAlign: "center",
                  fontSize: "1.25rem",
                  fontWeight: "bold",
                  color: "error.main",
                }}
              >
                নোটিশ শেষ হয়েছে{" "}
                {convertToBengaliNumber(
                  Math.abs(validCardData(notice?.endDadeline))
                )}{" "}
                দিন আগে
              </Typography>
            ) : (
              <DateDifferenceComponent
                startDadeline={notice?.startDadeline}
                range={notice?.range}
                timeStart={notice?.timeStart}
                timeEnd={notice?.timeEnd}
                endDadeline={notice?.endDadeline}
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
              to={`/dashboard/sums-all-zonal-data/${qId}`}
            >
              Back
            </Button>
          </Stack>
        </Box>

        {/* Table Section */}
        <TableContainer component={Paper} variant="outlined">
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
                <TableCell onClick={() => handleSort("zonalCode")}>
                  Branch Code{sortIndicator("zonalCode")}
                </TableCell>
                <TableCell onClick={() => handleSort("userName")}>
                  Branch name{sortIndicator("userName")}
                </TableCell>
                {questions?.questions?.map((question, index) => (
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
                <TableCell
                  colSpan={2}
                  sx={{ color: "white", fontWeight: "bold" }}
                >
                  Total
                </TableCell>
                {totalData?.length
                  ? totalData?.map((value, index) => (
                      <TableCell
                        sx={{ color: "white", fontWeight: "bold" }}
                        key={index}
                      >
                        {value[index]}
                      </TableCell>
                    ))
                  : notice?.questions?.map((value, index) => (
                      <TableCell
                        sx={{ color: "white", fontWeight: "bold" }}
                        key={index}
                      >
                        0
                      </TableCell>
                    ))}
              </TableRow>

              {/* Data Rows */}
              {sortedData?.map((branch, zonalIndex) => (
                <TableRow
                  key={zonalIndex}
                  hover
                  sx={{ "&:hover": { bgcolor: "action.hover" } }}
                >
                  <TableCell sx={{ textAlign: "center" }}>
                    {branch.branchCode}
                  </TableCell>
                  <TableCell sx={{ textAlign: "center" }}>
                    {branch.userName}
                  </TableCell>
                  {notice?.questions?.map((question, questionIndex) => (
                    <TableCell
                      key={`${zonalIndex}-${questionIndex}`}
                      sx={{ textAlign: "center" }}
                    >
                      {branch[question.questionText] || 0}
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

export default SumsZonalDataByBranch;
