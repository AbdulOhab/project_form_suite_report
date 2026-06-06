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
import DateDifferenceComponent from "../../time/DateDifferenceComponent";
import convertToBengaliNumber from "../../time/NumberConverter";

const SumsThanaByBranches = () => {
  const { qId, bId } = useParams();
  const [notice, setNotice] = useState("");
  const [totalData, setTotalData] = useState();
  const [branchName, setBranchName] = useState("");
  const [questions, setQuestions] = useState();
  const [sumsThanaData, setSumsThanaData] = useState();

  const [descriptionAlert, setDescriptionAlert] = useState(false);

  useEffect(() => {
    const sumsthanadata = async () => {
      try {
        const response = await fetch(
          `${BASE_URL}/sums-thana-by-branch-data/${qId}/${bId}`,
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
          setTotalData(data?.sumsArray);
          setBranchName(data?.branch);
          setSumsThanaData(data?.sumsThanaData);
        } else {
          return console.log("Failed to fetch");
        }
      } catch (error) {
        // Handle error
        console.error("Error fetching notice data:", error);
      }
    };
    sumsthanadata();
  }, [qId, bId]);

  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });
  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const sortedData = useMemo(() => {
    let sortableData = Array.isArray(sumsThanaData) ? [...sumsThanaData] : [];
    if (sortConfig.key !== null) {
      sortableData.sort((a, b) => {
        let aValue, bValue;

        // Check if sorting key is a predefined column or dynamic question
        if (sortConfig.key === "branchCode" || sortConfig.key === "userName") {
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
  }, [sumsThanaData, sortConfig]);

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

      <Paper elevation={2} sx={{ p: 2 }}>
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
            <Typography
              sx={{
                textAlign: "center",
                color: "primary.main",
                fontWeight: "bold",
                mt: 1,
              }}
            >
              ব্রাঞ্চের নামঃ{branchName?.userName}
            </Typography>
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
            <Typography sx={{ textAlign: "center", mt: 1 }}>
              <Typography
                component="span"
                sx={{
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                  bgcolor: "primary.main",
                  color: "white",
                  borderRadius: 1,
                  px: 1.5,
                }}
              >
                এক নজরে{" "}
                <Typography
                  component="span"
                  sx={{
                    bgcolor: "error.main",
                    color: "white",
                    px: 0.5,
                  }}
                >
                  শাখা ভিত্তিক
                </Typography>{" "}
                থানার পূর্ণাঙ্গ রিপোর্ট
              </Typography>
            </Typography>
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
              to={`/dashboard/sums-all-branches-data/${qId}`}
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
                <TableCell onClick={() => handleSort("thanaCode")}>
                  Thana Code{sortIndicator("thanaCode")}
                </TableCell>
                <TableCell onClick={() => handleSort("userName")}>
                  Thana Name{sortIndicator("userName")}
                </TableCell>
                {questions?.map((question, index) => (
                  <TableCell
                    key={index}
                    onClick={() => handleSort(question.questionText)}
                  >
                    {question?.questionText}
                    {sortIndicator(question.questionText)}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {/* Total Row */}
              <TableRow
                sx={{
                  bgcolor: "info.main",
                  "& th, & td": { color: "error.main", fontWeight: "bold" },
                }}
              >
                <TableCell colSpan={2} sx={{ fontWeight: "bold" }}>
                  Total
                </TableCell>
                {totalData?.map((element, index) => (
                  <TableCell key={index} sx={{ fontWeight: "bold" }}>
                    {element ? element[index] : "0"}
                  </TableCell>
                ))}
              </TableRow>

              {/* Data Rows */}
              {sortedData.map((thana, thanaIndex) => (
                <TableRow
                  key={thanaIndex}
                  hover
                  sx={{
                    bgcolor: "background.paper",
                    "&:hover": { bgcolor: "action.hover" },
                  }}
                >
                  <TableCell sx={{ textAlign: "center" }}>
                    {thana.thanaCode}
                  </TableCell>
                  <TableCell sx={{ textAlign: "center" }}>
                    {thana.userName}
                  </TableCell>
                  {questions?.map((question, qIndex) => (
                    <TableCell
                      key={`${thanaIndex}-${qIndex}`}
                      sx={{ textAlign: "center" }}
                    >
                      {thana?.[question.questionText] || 0}
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

export default SumsThanaByBranches;
