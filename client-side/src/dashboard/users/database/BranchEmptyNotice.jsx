import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import BASE_URL from "../../../auth/dbUrl";
import { useContext } from "react";
import { AuthContext } from "../../../contexts/AuthContext";

function BranchEmptyNotice() {
  const { firstId, secondId } = useParams();

  const { userInfo } = useContext(AuthContext);
  const navigate = useNavigate();

  const [notice, setNotice] = useState([]);

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
        let response = await fetch(`${BASE_URL}/get-question/${secondId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + window.localStorage.getItem("gsmToken"),
          },
        });
        let data = await response.json();

        if (!response.status === 200) {
          throw new Error("get notice data failed");
        }
        if (response.status === 200) {
          setNotice(data);
        }
      } catch (error) {
        console.error("Error fetching notice data:", error);
      }
    };
    getQuestionFromDb();
  }, [secondId]);

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

  // data submission by branch
  const submitHandler = async (e) => {
    e.preventDefault();
    const response = await fetch(`${BASE_URL}/create-answer/${secondId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + window.localStorage.getItem("gsmToken"),
      },
      body: JSON.stringify({
        document_name: notice.document_name,
        doc_desc: notice.doc_desc,
        noticeId: notice._id,
        thanaCode: firstId,
        branchCode: userInfo?.branchCode,
        zonalCode: userInfo?.zonalCode,
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
    navigate(`/dashboard/branch-data-interface/${secondId}`);
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

        <Box component="form" onSubmit={submitHandler}>
          {notice?.questions?.map((question, qIndex) => (
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
              {question?.options?.map((opText, index) => (
                <Box key={index} sx={{ display: "flex", alignItems: "center" }}>
                  <Box sx={{ display: "none" }}>{question?.required}</Box>
                  <FormControlLabel
                    control={
                      question.questionType !== "text" &&
                      question.questionType !== "number" ? (
                        question.questionType === "checkbox" ? (
                          <Checkbox
                            name={String(qIndex)}
                            required={question?.required}
                            onChange={() =>
                              selectCheck(
                                question?.questionText,
                                opText.optionsText,
                                question.questionType,
                                qIndex,
                                question?.required
                              )
                            }
                          />
                        ) : (
                          <Radio
                            name={String(qIndex)}
                            required={question?.required}
                            onChange={() =>
                              selectCheck(
                                question?.questionText,
                                opText.optionsText,
                                question.questionType,
                                qIndex,
                                question?.required
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
                          {opText?.optionsText}
                        </Typography>
                      ) : (
                        <TextField
                          type={question.questionType}
                          name={String(qIndex)}
                          size="small"
                          required={question?.required}
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
              ))}
            </Paper>
          ))}
          <Box sx={{ maxWidth: { lg: "50%", md: "66%", sm: "83%" }, mx: "auto" }}>
            <Button
              type="submit"
              variant="contained"
              color="success"
              sx={{
                textTransform: "uppercase",
                my: 1.5,
                mx: 2,
                float: "right",
              }}
            >
              Submit
            </Button>
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

export default BranchEmptyNotice;
