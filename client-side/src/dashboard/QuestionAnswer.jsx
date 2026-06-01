import React, { useContext } from "react";
import moment from "moment";
import { useState } from "react";
import { useEffect } from "react";
import { useParams } from "react-router";
import {
  Button,
  Typography,
  FormControlLabel,
  Paper,
  Grid,
  Box,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from "@mui/material";
import SortTextIcon from "@mui/icons-material/ShortText";
import SortNumericIcon from "@mui/icons-material/NumbersSharp";
import Close from "@mui/icons-material/Close";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import DateDifferenceComponent from "./time/DateDifferenceComponent";
import BASE_URL from "../auth/dbUrl";
import SweetAlert from "./time/SweetAlert";

const QuestionAnswer = () => {
  const { id } = useParams();
  const { userInfo } = useContext(AuthContext);

  const navigate = useNavigate();
  const [formDisabled, setFormDisabled] = useState(false);
  const [descriptionAlert, setDescriptionAlert] = useState(false);

  const [notice, setNotice] = useState([]);
  const [answer, setAnswer] = useState([]);
  const [currentDay, setCurrentDay] = useState(null);
  const [answerFind, setAnswerFind] = useState([]);

  // get notice from database
  useEffect(() => {
    const getQuestionFromDb = async () => {
      try {
        let response = await fetch(`${BASE_URL}/get-notice/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + window.localStorage.getItem("gsmToken"),
          },
        });
        let data = await response.json();
        if (!response.ok) {
          throw new Error("get notice data failed");
        }
        if (response.ok) {
          setNotice(data);
        }
      } catch (error) {
        console.error("Error fetching notice data:", error);
      }
    };
    getQuestionFromDb();
  }, [id]);

  const selectCheck = (qText, value, qIndex, required, questionType) => {
    const newAnswer = [...answer];
    if (!Array.isArray(newAnswer[qIndex])) {
      newAnswer[qIndex] = [];
    }
    newAnswer[qIndex].push({
      questionText: qText,
      data: value,
      required: required,
      questionType: questionType,
    });
    setAnswer(newAnswer);
  };

  const selectInput = (qText, value, qIndex, required, questionType) => {
    setAnswer((prevAnswer) => {
      const newAnswer = [...prevAnswer];

      if (qIndex >= newAnswer.length) {
        newAnswer[qIndex] = {
          questionText: qText,
          data: value,
          questionType: questionType,
          required: required,
        };
      } else {
        newAnswer[qIndex] = {
          ...newAnswer[qIndex],
          questionText: qText,
          data: value,
          required: required,
          questionType: questionType,
        };
      }

      return newAnswer;
    });
  };

  // data submission
  const submitHnadler = async (e) => {
    e.preventDefault();
    const response = await fetch(`${BASE_URL}/create-answer/${id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + window.localStorage.getItem("gsmToken"),
      },
      body: JSON.stringify({
        document_name: notice.document_name,
        doc_desc: notice.doc_desc,
        noticeId: id,
        thanaCode: userInfo.thanaCode,
        zonalCode: userInfo.zonalCode,
        branchCode: userInfo.branchCode,
        submitId: userInfo.userId,
        answers: answer,
      }),
    });
    await response.json();
    if (!response.status === 200) {
      throw new Error("Network response was not ok");
    }
    if (response.status === 200) {
      SweetAlert({
        icon: "success",
        message: "Form Submitted Successfully",
      });
      navigate(`/dashboard/thana-submission/${notice?._id}`);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const todayStartTime =
        moment().format("YYYY-MM-DD") + " " + notice.timeStart;
      const todayEndTime = moment().format("YYYY-MM-DD") + " " + notice.timeEnd;

      const now = moment();
      const startTime = moment(todayStartTime);
      const endTime = moment(todayEndTime);

      if (now.isBefore(startTime)) {
        setFormDisabled(true);
      } else if (now.isBetween(startTime, endTime)) {
        setFormDisabled(false);
      } else {
        clearInterval(interval);
        setFormDisabled(true);
      }
    });

    return () => clearInterval(interval);
  }, [notice]);

  const descriptionHandler = () => {
    setDescriptionAlert(true);
  };
  const descriptionCloserHandler = () => {
    setDescriptionAlert(false);
  };

  // get answer from database
  useEffect(() => {
    const findAnswerByDay = async () => {
      try {
        const response = await fetch(
          `${BASE_URL}/thana/find-data-checkout/${id}/${currentDay?.day}`,
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
          setAnswerFind(data.answer);
        } else {
          throw new Error("Failed to fetch");
        }
      } catch (error) {
        console.error("Error fetching notice data:", error);
      }
    };
    findAnswerByDay();
  }, [id, currentDay]);

  // get current day
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

    const checkDateStatus = (startDeadline, range) => {
      const startDate = new Date(startDeadline);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + range - 1);

      const today = new Date();

      if (today < startDate) {
        return 1;
      } else if (today >= startDate && today <= endDate) {
        return 0;
      } else {
        return -1;
      }
    };

    const findCurrentDay = (dates) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayIndex = dates.findIndex((date) => {
        const dateWithoutTime = new Date(date);
        dateWithoutTime.setHours(0, 0, 0, 0);
        return dateWithoutTime.getTime() === today.getTime();
      });
      return todayIndex !== -1
        ? { day: todayIndex + 1, date: dates[todayIndex].toDateString() }
        : null;
    };

    if (notice?.startDadeline && notice?.range) {
      const dates = generateDateList(notice?.startDadeline, notice?.range);
      const currentDayInfo = findCurrentDay(dates);
      setCurrentDay(currentDayInfo);
    }
    if (notice?.startDadeline) {
      checkDateStatus(notice?.startDadeline, notice?.range);
    }
  }, [notice?.startDadeline, notice?.range]);

  // send data to answer[]
  useEffect(() => {
    if (answerFind.length) {
      const newAnswer = [...answer];
      answerFind.forEach((ans) =>
        ans.answers.forEach((a, i) => {
          newAnswer[i] = a;
        })
      );
      setAnswer(newAnswer);
    }
  }, [answerFind]);

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", my: 2, px: 2 }}>
      {/* Description Dialog */}
      <Dialog
        open={descriptionAlert}
        onClose={descriptionCloserHandler}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Description
          <IconButton
            aria-label="close"
            onClick={descriptionCloserHandler}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Typography>{notice?.doc_desc}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={descriptionCloserHandler} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Header Section */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 3 }}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <DateDifferenceComponent
                startDadeline={notice?.startDadeline}
                range={notice?.range}
                timeStart={notice?.timeStart}
                timeEnd={notice?.timeEnd}
                endDadeline={notice?.endDadeline}
              />
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Typography
              variant="h4"
              align="center"
              fontWeight="bold"
              color="primary"
            >
              {notice?.document_name}
            </Typography>
            {notice?.sub_title && (
              <Typography variant="body1" align="center">
                {notice?.sub_title}
              </Typography>
            )}
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                {!descriptionAlert && (
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={descriptionHandler}
                    sx={{ fontWeight: "bold", width: "50%" }}
                  >
                    Notice
                  </Button>
                )}
                <Button
                  variant="contained"
                  color="primary"
                  component={Link}
                  to="/dashboard"
                  sx={{ px: 2, py: 1 }}
                >
                  Back
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Paper>

      {/* Questions Form */}
      <Paper elevation={3} sx={{ my: 2, p: 2 }}>
        <form onSubmit={submitHnadler}>
          {notice?.questions?.map((question, qIndex) => (
            <Paper
              key={qIndex}
              elevation={1}
              sx={{
                maxWidth: 700,
                mx: "auto",
                p: 2,
                mt: 2,
              }}
            >
              <Box>
                <Typography variant="body1" sx={{ fontWeight: "medium" }}>
                  {qIndex + 1}. {question?.questionText}
                  {question?.required ? (
                    <Typography
                      component="span"
                      color="error"
                      sx={{ fontSize: 24 }}
                    >
                      *
                    </Typography>
                  ) : (
                    ""
                  )}
                </Typography>
              </Box>
              {question?.options?.map((opText, index) => (
                <Box key={index} sx={{ display: "flex", alignItems: "center" }}>
                  <FormControlLabel
                    control={
                      question.questionType !== "text" &&
                      question.questionType !== "number" ? (
                        <input
                          type={question.questionType}
                          name={qIndex}
                          required={question?.required}
                          onChange={() =>
                            selectCheck(
                              question?.questionText,
                              opText?.optionsText,
                              question?.questionType,
                              qIndex,
                              question?.required
                            )
                          }
                        />
                      ) : question?.questionType === "number" ? (
                        <SortNumericIcon sx={{ mr: 1 }} />
                      ) : (
                        <SortTextIcon sx={{ mr: 1 }} />
                      )
                    }
                    label={
                      question.questionType !== "text" &&
                      question.questionType !== "number" ? (
                        <Typography
                          sx={{
                            textTransform: "capitalize",
                            textAlign: "center",
                          }}
                        >
                          {opText?.optionsText}
                        </Typography>
                      ) : (
                        <TextField
                          variant="standard"
                          type={question.questionType}
                          name={qIndex}
                          required={question?.required}
                          value={answer[qIndex]?.data || ""}
                          onChange={(e) =>
                            selectInput(
                              question?.questionText,
                              e.target.value,
                              qIndex,
                              question?.required,
                              question?.questionType
                            )
                          }
                          sx={{ mx: 1 }}
                        />
                      )
                    }
                  />
                </Box>
              ))}
            </Paper>
          ))}
          <Box sx={{ maxWidth: 700, mx: "auto" }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={formDisabled || answerFind.length ? true : false}
              sx={{
                textTransform: "uppercase",
                my: 2,
                mx: 2,
                fontWeight: "bold",
              }}
            >
              Submit
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default QuestionAnswer;
