import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
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
} from "@mui/material";
import { AuthContext } from "../../contexts/AuthContext";
import BASE_URL from "../../auth/dbUrl";
import { buildNoticeSlug } from "../../utils/noticeSlug";

function ThanaEmptyNotice() {
  const { date } = useParams();
  const location = useLocation();
  const id = location.state?.id;
  const { userInfo } = useContext(AuthContext);
  const navigate = useNavigate();

  const [notice, setNotice] = useState(null);
  const [answer, setAnswer] = useState([
    { questionText: "", data: "", questionType: "", required: false },
  ]);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [confirmDialog, setConfirmDialog] = useState({ open: false });

  useEffect(() => {
    if (!id) return;

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
    navigate(`/dashboard/thana-submission/${buildNoticeSlug(notice)}`, { state: { id } });
  };

  const handleDenySave = () => {
    setConfirmDialog({ open: false });
    setSnackbar({ open: true, message: "সাবমিট বাতিল করা হয়েছে", severity: "info" });
  };

  return (
    <>
      <Box sx={{ maxWidth: 720, mx: "auto" }}>
        <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>
          {notice?.document_name || (id ? "Loading..." : "")}
        </Typography>
        {notice?.sub_title && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {notice.sub_title}
          </Typography>
        )}

        {!id ? (
          <Typography color="text.secondary" sx={{ mt: 2 }}>
            দৈনিক রিপোর্ট থেকে সাবমিট বাটনে ক্লিক করে আসুন।
          </Typography>
        ) : (
          <>
            {!notice?.sub_title && <Box sx={{ mb: 2 }} />}

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

            <Box component="form" onSubmit={submitHandler}>
              {notice?.questions?.map((question, qIndex) => (
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
                        label={<Typography variant="body2">{opText.optionsText}</Typography>}
                      />
                    ))
                  )}
                </Box>
              ))}

              <Divider sx={{ my: 3 }} />

              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mb: 3 }}>
                <Button
                  component={Link}
                  to={`/dashboard/thana-submission/${buildNoticeSlug(notice)}`}
                  state={{ id }}
                  variant="outlined"
                >
                  বাতিল
                </Button>
                <Button type="submit" variant="contained" size="large">
                  সাবমিট করুন
                </Button>
              </Box>
            </Box>
          </>
        )}
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
          <Button onClick={handleConfirmSave} variant="contained" size="small">
            সংরক্ষণ করুন
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

export default ThanaEmptyNotice;
