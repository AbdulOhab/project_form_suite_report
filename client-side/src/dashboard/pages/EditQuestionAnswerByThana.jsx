import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Button,
  Paper,
  Typography,
  TextField,
  FormControlLabel,
  Checkbox,
  Radio,
  Snackbar,
  Alert,
  Container,
  Dialog,
  DialogTitle,
  DialogActions,
} from "@mui/material";
import SortTextIcon from "@mui/icons-material/ShortText";
import SortNumericIcon from "@mui/icons-material/NumbersSharp";
import BASE_URL from "../../auth/dbUrl";

function EditQuestionAnswerByThana() {
  const { id, answerId } = useParams();

  const navigate = useNavigate();

  const [notice, setNotice] = useState([]);
  console.log(notice);

  const [answer, setAnswer] = useState([
    {
      questionText: "",
      data: "",
      questionType: "",
      required: false,
    },
  ]);

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
  });

  const handleSnackbarClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // get answer form database
  useEffect(() => {
    const getQuestionFromDb = async () => {
      try {
        let response = await fetch(`${BASE_URL}/get-answer/${answerId}`, {
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
          setAnswer(data?.answers);
        }
      } catch (error) {
        console.error("Error fetching notice data:", error);
      }
    };
    getQuestionFromDb();
  }, [answerId]);

  const selectInput = (qText, value, qIndex, required, questionType) => {
    setAnswer((prevAnswer) => {
      const newAnswer = [...prevAnswer];

      // Check if the index exists, if not, add a new object
      if (qIndex >= newAnswer.length) {
        newAnswer[qIndex] = {
          questionText: qText,
          data: value,
          questionType: questionType,
          required: required,
        };
      } else {
        // Update the existing object
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

  const selectCheck = (qText, value, qIndex, required, questionType) => {
    const newAnswer = [...answer]; // Shallow copy of the answer array
    if (!Array.isArray(newAnswer[qIndex])) {
      newAnswer[qIndex] = []; // Initialize as an array if not already
    }
    newAnswer[qIndex].push({
      questionText: qText,
      data: value,
      required: required,
      questionType: questionType,
    });

    setAnswer(newAnswer); // Update the state with the modified newAnswer
  };

  //update data submission
  const updataHandler = async (e) => {
    e.preventDefault();
    const response = await fetch(`${BASE_URL}/update-answer/${answerId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + window.localStorage.getItem("gsmToken"),
      },
      body: JSON.stringify({
        document_name: notice.document_name,
        doc_desc: notice.doc_desc,
        noticeId: id,
        thanaCode: notice.thanaCode,
        zonalCode: notice.zonalCode,
        answers: answer,
      }),
    });
    await response.json();
    if (!response.status === 200) {
      throw new Error("Network response was not ok");
    }
    if (response.status === 200) {
      setConfirmDialog({ open: true });
    }
  };

  const handleConfirmSave = () => {
    setConfirmDialog({ open: false });
    setSnackbar({
      open: true,
      message: "Update your data successfully",
      severity: "success",
    });
    navigate(`/dashboard/thana-submission/${id}`);
  };

  const handleDenySave = () => {
    setConfirmDialog({ open: false });
    setSnackbar({
      open: true,
      message: "Changes are not saved",
      severity: "info",
    });
  };

  return (
    <Container maxWidth="md">
      <Paper>
        <Paper
          elevation={0}
          sx={{ p: 2, bgcolor: "grey.100", borderRadius: "4px 4px 0 0" }}
        >
          <Typography align="center">{notice?.document_name}</Typography>
          <Typography align="center">{notice?.doc_desc}</Typography>
        </Paper>

        <Box component="form" onSubmit={updataHandler}>
          {notice?.answers?.map((question, qIndex) => (
            <Paper
              key={qIndex}
              variant="outlined"
              elevation={2}
              sx={{
                maxWidth: { lg: "50%", md: "66%", sm: "100%" },
                mx: "auto",
                p: 2,
                mt: 1.5,
              }}
            >
              <Typography>
                {qIndex + 1}. {question?.questionText}
              </Typography>

              <Box>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <FormControlLabel
                    control={
                      question.questionType !== "text" &&
                      question.questionType !== "number" ? (
                        question.questionType === "checkbox" ? (
                          <Checkbox
                            name={String(qIndex)}
                            required={question?.required}
                            value={question?.data}
                            onChange={() =>
                              selectCheck(
                                question?.questionText,
                                question.optionsText,
                                qIndex,
                                question?.required,
                                question?.questionType
                              )
                            }
                          />
                        ) : (
                          <Radio
                            name={String(qIndex)}
                            required={question?.required}
                            value={question?.data}
                            onChange={() =>
                              selectCheck(
                                question?.questionText,
                                question.optionsText,
                                qIndex,
                                question?.required,
                                question?.questionType
                              )
                            }
                          />
                        )
                      ) : question?.questionType === "number" ? (
                        <SortNumericIcon sx={{ mr: 0.5 }} />
                      ) : (
                        <SortTextIcon sx={{ mr: 0.5 }} />
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
                          {question?.optionsText}
                        </Typography>
                      ) : (
                        <TextField
                          type={question.questionType}
                          name={String(qIndex)}
                          size="small"
                          required={question?.required}
                          defaultValue={question?.data}
                          onChange={(e) =>
                            selectInput(
                              question?.questionText,
                              e.target.value,
                              qIndex,
                              question?.required,
                              question?.questionType
                            )
                          }
                        />
                      )
                    }
                  />
                </Box>
              </Box>
            </Paper>
          ))}
          <Box sx={{ maxWidth: { lg: "50%", md: "66%", sm: "83%" }, mx: "auto" }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-around",
                alignItems: "center",
                my: 2,
              }}
            >
              <Button type="submit" variant="contained" color="error">
                Update
              </Button>
              <Button
                component={Link}
                to={`/dashboard/thana-submission/${id}`}
                variant="contained"
                color="success"
                sx={{ mx: 1.5 }}
              >
                Back
              </Button>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.open} onClose={handleDenySave}>
        <DialogTitle>Do you want to save the changes?</DialogTitle>
        <DialogActions>
          <Button onClick={handleDenySave} color="inherit">
            Don&apos;t save
          </Button>
          <Button onClick={handleConfirmSave} variant="contained" color="success">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default EditQuestionAnswerByThana;
