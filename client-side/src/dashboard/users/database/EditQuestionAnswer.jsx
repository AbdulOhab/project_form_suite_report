import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Button,
  Typography,
  TextField,
  FormControlLabel,
  Checkbox,
  Radio,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Divider,
  Stack,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import BASE_URL from "../../../auth/dbUrl";
import { toEnglishDigits } from "../../../utils/convertDigits";

function EditQuestionAnswer() {
  const { formId, answerId } = useParams();
  const navigate = useNavigate();

  const [notice, setNotice] = useState(null);
  const [answer, setAnswer] = useState([
    { questionText: "", data: "", questionType: "", required: false },
  ]);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [confirmDialog, setConfirmDialog] = useState({ open: false });

  useEffect(() => {
    if (!answerId) return;

    const getAnswerFromDb = async () => {
      try {
        const response = await fetch(`${BASE_URL}/get-answer/${answerId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + window.localStorage.getItem("gsmToken"),
          },
        });
        const data = await response.json();
        if (response.ok) {
          setNotice(data);
          setAnswer(data?.answers);
        }
      } catch (error) {
        console.error("Error fetching answer data:", error);
      }
    };
    getAnswerFromDb();
  }, [answerId]);

  const selectInput = (qText, value, qIndex, required, questionType) => {
    const data = questionType === "number" ? toEnglishDigits(value) : value;
    setAnswer((prev) => {
      const updated = [...prev];
      updated[qIndex] = { questionText: qText, data, questionType, required };
      return updated;
    });
  };

  const selectCheck = (qText, value, qIndex, required, questionType) => {
    const updated = [...answer];
    if (!Array.isArray(updated[qIndex])) updated[qIndex] = [];
    updated[qIndex].push({ questionText: qText, data: value, required, questionType });
    setAnswer(updated);
  };

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
        noticeId: formId,
        thanaCode: notice.thanaCode,
        answers: answer,
      }),
    });
    await response.json();
    if (response.status === 200) setConfirmDialog({ open: true });
  };

  const handleConfirmSave = () => {
    setConfirmDialog({ open: false });
    setSnackbar({ open: true, message: "তথ্য সফলভাবে আপডেট হয়েছে", severity: "success" });
    navigate(`/dashboard/branch-interface/${formId}`);
  };

  const handleDenySave = () => {
    setConfirmDialog({ open: false });
    setSnackbar({ open: true, message: "আপডেট বাতিল করা হয়েছে", severity: "info" });
  };

  return (
    <>
      <Box sx={{ maxWidth: 720, mx: "auto" }}>
        <Stack direction="row" alignItems="center" sx={{ mb: 2 }}>
          <Button
            startIcon={<ArrowBackIcon fontSize="small" />}
            onClick={() => navigate(-1)}
            size="small"
            variant="outlined"
            sx={{
              color: "text.secondary",
              borderColor: "divider",
              bgcolor: "#ffffff",
              fontWeight: 600,
              "&:hover": { bgcolor: "action.hover", borderColor: "divider" },
            }}
          >
            Back
          </Button>
        </Stack>

        <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>
          {notice?.document_name || (answerId ? "Loading..." : "")}
        </Typography>

        {!answerId ? (
          <Typography color="text.secondary" sx={{ mt: 2 }}>
            রিপোর্ট থেকে Edit বাটনে ক্লিক করে আসুন।
          </Typography>
        ) : (
          <>
            <Box sx={{ mb: 2 }} />

            {notice?.doc_desc && (
              <>
                <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
                  Description
                </Typography>
                <Box
                  sx={{
                    color: "text.primary",
                    mb: 3,
                    overflowWrap: "break-word",
                    wordBreak: "break-word",
                    "& p": { m: 0 },
                  }}
                  dangerouslySetInnerHTML={{ __html: notice.doc_desc }}
                />
              </>
            )}

            <Divider sx={{ my: 3 }} />

            <Typography variant="subtitle2" fontWeight={600} color="text.secondary" sx={{ mb: 1.5 }}>
              Questions
            </Typography>

            <Box component="form" onSubmit={updataHandler}>
              {notice?.answers?.map((question, qIndex) => (
                <Box key={qIndex} sx={{ mb: 2.5 }}>
                  <Typography variant="body2" fontWeight={500} sx={{ mb: 1 }}>
                    {qIndex + 1}. {question.questionText}
                    {question.required && (
                      <Typography component="span" color="error.main" sx={{ ml: 0.3 }}>*</Typography>
                    )}
                  </Typography>

                  {question.questionType === "text" || question.questionType === "number" ? (
                    <TextField
                      type={question.questionType === "number" ? "number" : "text"}
                      size="small"
                      fullWidth
                      variant="outlined"
                      required={question.required}
                      value={
                        typeof answer[qIndex]?.data === "string" ||
                        typeof answer[qIndex]?.data === "number"
                          ? answer[qIndex].data
                          : ""
                      }
                      multiline={question.questionType === "text"}
                      rows={question.questionType === "text" ? 3 : undefined}
                      onChange={(e) =>
                        selectInput(
                          question.questionText,
                          e.target.value,
                          qIndex,
                          question.required,
                          question.questionType
                        )
                      }
                    />
                  ) : (
                    question.options?.map((opText, oIndex) => (
                      <FormControlLabel
                        key={oIndex}
                        control={
                          question.questionType === "checkbox" ? (
                            <Checkbox
                              size="small"
                              name={String(qIndex)}
                              required={question.required}
                              onChange={() =>
                                selectCheck(
                                  question.questionText,
                                  opText.optionsText,
                                  qIndex,
                                  question.required,
                                  question.questionType
                                )
                              }
                            />
                          ) : (
                            <Radio
                              size="small"
                              name={String(qIndex)}
                              required={question.required}
                              onChange={() =>
                                selectCheck(
                                  question.questionText,
                                  opText.optionsText,
                                  qIndex,
                                  question.required,
                                  question.questionType
                                )
                              }
                            />
                          )
                        }
                        label={<Typography variant="body2">{opText?.optionsText}</Typography>}
                      />
                    ))
                  )}
                </Box>
              ))}

              <Divider sx={{ my: 3 }} />

              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mb: 3 }}>
                <Button onClick={() => navigate(-1)} variant="outlined">
                  বাতিল
                </Button>
                <Button type="submit" variant="contained" size="large">
                  আপডেট করুন
                </Button>
              </Box>
            </Box>
          </>
        )}
      </Box>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.open} onClose={handleDenySave} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>তথ্য আপডেট করবেন?</DialogTitle>
        <DialogContent>
          <DialogContentText variant="body2">
            আপডেট করলে আগের তথ্য পরিবর্তন হয়ে যাবে।
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleDenySave} color="inherit" size="small">বাতিল</Button>
          <Button onClick={handleConfirmSave} variant="contained" size="small">
            আপডেট করুন
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}

export default EditQuestionAnswer;
