import React, { useContext, useEffect, useState } from "react";
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Chip,
  Divider,
} from "@mui/material";
import {
  ArrowBack,
  SendOutlined,
  AssignmentOutlined,
  NumbersSharp as SortNumericIcon,
  ShortText as SortTextIcon,
} from "@mui/icons-material";
import { AuthContext } from "../../contexts/AuthContext";
import BASE_URL from "../../auth/dbUrl";

function ThanaEmptyNotice() {
  const { id, date } = useParams();
  const { userInfo } = useContext(AuthContext);
  const navigate = useNavigate();

  const [notice, setNotice] = useState(null);
  const [answer, setAnswer] = useState([
    { questionText: "", data: "", questionType: "", required: false },
  ]);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [confirmDialog, setConfirmDialog] = useState({ open: false });

  useEffect(() => {
    const getQuestionFromDb = async () => {
      try {
        const response = await fetch(`${BASE_URL}/get-question/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + window.localStorage.getItem("gsmToken"),
          },
        });
        const data = await response.json();
        if (response.status === 200) setNotice(data);
      } catch (error) {
        console.error("Error fetching notice data:", error);
      }
    };
    getQuestionFromDb();
  }, [id]);

  const selectInput = (qText, value, qIndex, required, questionType) => {
    setAnswer((prev) => {
      const updated = [...prev];
      updated[qIndex] = { questionText: qText, data: value, questionType, required };
      return updated;
    });
  };

  const selectCheck = (qText, value, qIndex, required, questionType) => {
    const updated = [...answer];
    if (!Array.isArray(updated[qIndex])) updated[qIndex] = [];
    updated[qIndex].push({ questionText: qText, data: value, required, questionType });
    setAnswer(updated);
  };

  const submitHandler = async (e) => {
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
        noticeId: notice._id,
        thanaCode: userInfo.thanaCode,
        branchCode: userInfo.branchCode,
        zonalCode: userInfo.zonalCode,
        reportDate: date,
        answers: answer,
      }),
    });
    await response.json();
    if (response.status === 200) setConfirmDialog({ open: true });
  };

  const handleConfirmSave = () => {
    setConfirmDialog({ open: false });
    setSnackbar({ open: true, message: "তথ্য সফলভাবে সাবমিট হয়েছে", severity: "success" });
    navigate(`/dashboard/thana-submission/${id}`);
  };

  const handleDenySave = () => {
    setConfirmDialog({ open: false });
    setSnackbar({ open: true, message: "সাবমিট বাতিল করা হয়েছে", severity: "info" });
  };

  return (
    <>
      <Box sx={{ px: { xs: 1, sm: 2, md: 3 }, py: 2, maxWidth: 720, mx: "auto" }}>

        {/* Compact top bar */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2,
            flexWrap: "wrap",
            gap: 1,
          }}
        >
          <Button
            component={Link}
            to={`/dashboard/thana-submission/${id}`}
            size="small"
            startIcon={<ArrowBack />}
            variant="text"
            sx={{ fontWeight: 600 }}
          >
            ফিরে যান
          </Button>
          <Box sx={{ textAlign: "center", flex: 1, minWidth: 0 }}>
            <Typography variant="h6" fontWeight="bold" noWrap>
              {notice?.document_name || "Loading..."}
            </Typography>
            {notice?.sub_title && (
              <Typography variant="caption" color="text.secondary">
                {notice.sub_title}
              </Typography>
            )}
          </Box>
          <Box sx={{ minWidth: 90 }} />
        </Box>

        {/* Notice description card */}
        {notice?.doc_desc && (
          <Paper
            elevation={0}
            sx={{ borderRadius: 2, border: "1px solid", borderColor: "divider", overflow: "hidden", mb: 3 }}
          >
            <Box
              sx={{
                px: 2,
                py: 1.5,
                bgcolor: "primary.main",
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <AssignmentOutlined fontSize="small" sx={{ color: "white" }} />
              <Typography variant="subtitle2" fontWeight={600} color="white">
                নোটিশের বিবরণ
              </Typography>
            </Box>
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography variant="body2" color="text.secondary">
                {notice.doc_desc}
              </Typography>
            </Box>
          </Paper>
        )}

        {/* Form */}
        <Box component="form" onSubmit={submitHandler}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
            <Typography variant="subtitle2" fontWeight={600} color="text.secondary">
              প্রশ্নসমূহ
            </Typography>
            {notice?.questions?.length > 0 && (
              <Chip
                label={`${notice.questions.length} টি`}
                size="small"
                variant="outlined"
                sx={{ fontSize: "0.72rem" }}
              />
            )}
          </Box>

          {notice?.questions?.map((question, qIndex) => (
            <Paper
              key={qIndex}
              elevation={0}
              sx={{
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
                p: 2,
                mb: 1.5,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1, mb: 1.5 }}>
                <Chip
                  label={qIndex + 1}
                  size="small"
                  color="primary"
                  sx={{ minWidth: 28, height: 22, fontSize: "0.72rem", fontWeight: 700 }}
                />
                <Typography variant="body2" fontWeight={500} sx={{ pt: 0.2 }}>
                  {question.questionText}
                  {question.required && (
                    <Typography component="span" color="error.main" sx={{ ml: 0.3 }}>*</Typography>
                  )}
                </Typography>
              </Box>

              {question.questionType === "text" || question.questionType === "number" ? (
                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                  {question.questionType === "number" ? (
                    <SortNumericIcon fontSize="small" color="action" sx={{ mt: 1 }} />
                  ) : (
                    <SortTextIcon fontSize="small" color="action" sx={{ mt: 1 }} />
                  )}
                  <TextField
                    type={question.questionType === "number" ? "number" : "text"}
                    size="small"
                    fullWidth
                    required={question.required}
                    placeholder={question.questionType === "number" ? "সংখ্যা লিখুন" : "উত্তর লিখুন"}
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
                </Box>
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
                    label={
                      <Typography variant="body2">{opText.optionsText}</Typography>
                    }
                  />
                ))
              )}
            </Paper>
          ))}

          <Divider sx={{ my: 2 }} />

          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              type="submit"
              variant="contained"
              color="success"
              startIcon={<SendOutlined />}
              sx={{ fontWeight: 600, px: 3 }}
            >
              সাবমিট করুন
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.open} onClose={handleDenySave} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>তথ্য সংরক্ষণ করবেন?</DialogTitle>
        <DialogContent>
          <DialogContentText variant="body2">
            সাবমিট করলে আজকের রিপোর্ট সংরক্ষিত হবে। এটি পরে সম্পাদনা করা যাবে।
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleDenySave} color="inherit" size="small">বাতিল</Button>
          <Button onClick={handleConfirmSave} variant="contained" color="success" size="small">
            সংরক্ষণ করুন
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}

export default ThanaEmptyNotice;
