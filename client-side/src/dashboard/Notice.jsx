import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import {
  Typography,
  FormControlLabel,
  AccordionSummary,
  AccordionDetails,
  Accordion,
  IconButton,
  MenuItem,
  Switch,
  Select,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
  Tooltip,
  Divider,
} from "@mui/material";
import SortNumericIcon from "@mui/icons-material/NumbersSharp";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import FilterNoneIcon from "@mui/icons-material/FilterNone";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { useNavigate } from "react-router-dom";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import BASE_URL from "../auth/dbUrl";

const Notice = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [documentDescription, setdocumentDescription] = useState();
  const [documentName, setdocumentName] = useState();
  const [range, setRange] = useState(null);
  const [startDadeline, setStartDadeline] = useState(null);
  const [endDadeline, setEndDadeline] = useState(null);
  const [error, setError] = useState();
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [timeEnd, setTimeEnd] = useState("00:00:00");
  const [timeStart, setTimeStart] = useState("00:00:00");
  const [subtitle, setSubtitle] = useState("");

  const [question, setQuestion] = useState([
    {
      questionText: "",
      questionType: "number",
      options: [{ optionsText: "Value must be number" }],
      open: true,
      required: false,
    },
  ]);

  const handleSubtitleChange = (event) => {
    setSubtitle(event.target.value);
  };

  useEffect(() => {
    const dateHandler = () => {
      const date = new Date(startDadeline);
      let day = date.getDate();
      let newDate = +day + (+range - 1);
      date.setDate(newDate);
      const viewDate = new Date(date);
      const months = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
      ];
      const formattedDate = `${viewDate.getDate()}-${
        months[viewDate.getMonth()]
      }-${viewDate.getFullYear()}`;
      setEndDadeline(formattedDate);
    };
    dateHandler();
  }, [range, startDadeline]);

  const rangeHandler = (e) => {
    setRange(e.target.value);
  };

  function inputChangeHandler(text, i) {
    let newQuestion = [...question];
    newQuestion[i].questionText = text;
    setQuestion(newQuestion);
  }

  function changeValueHandler(text, i, j) {
    const newOption = JSON.parse(JSON.stringify(question));
    newOption[i].options[j].optionsText = text;
    setQuestion(newOption);
  }

  function copyQuestion(i) {
    expandcloseAll();
    let copyQ = [...question];
    let newCopy = { ...copyQ[i] };
    setQuestion([...question, newCopy]);
  }

  function deleteQuestion(i) {
    if (question.length > 1) {
      let delQuestion = [...question];
      delQuestion.splice(i, 1);
      setQuestion(delQuestion);
    }
  }

  function requiredQuestion(i) {
    let reqQuestion = [...question];
    reqQuestion[i].required = !reqQuestion[i].required;
    setQuestion(reqQuestion);
  }

  function moveQuestion(i, direction) {
    const newIndex = i + direction;
    if (newIndex < 0 || newIndex >= question.length) return;
    const updated = [...question];
    [updated[i], updated[newIndex]] = [updated[newIndex], updated[i]];
    expandcloseAll();
    updated[newIndex].open = true;
    setQuestion(updated);
  }

  function addMoreQuestion(i) {
    expandcloseAll();
    let newQuestion = [
      ...question,
      {
        questionText: "",
        questionType: "number",
        options: [{ optionsText: "Value must be number" }],
        open: true,
        required: false,
      },
    ];
    setQuestion(newQuestion);
  }

  function expandcloseAll() {
    let expandsQuestion = [...question];
    for (let index = 0; index < expandsQuestion.length; index++) {
      expandsQuestion[index].open = false;
    }
    setQuestion(expandsQuestion);
  }

  function handleExpandHandler(i) {
    const handleQuestion = [...question];
    for (let index = 0; index < handleQuestion.length; index++) {
      if (index === i) {
        handleQuestion[i].open = true;
      } else {
        handleQuestion[index].open = false;
      }
    }
    setQuestion(handleQuestion);
  }

  function questionUI() {
    return question.map((que, i) => (
      <Accordion
        key={i}
        expanded={question[i].open}
        onChange={() => handleExpandHandler(i)}
        sx={{
          border: 1,
          borderColor: question[i].open ? "primary.main" : "divider",
          bgcolor: question[i].open ? "action.hover" : "transparent",
          boxShadow: "none",
          my: 1,
          borderRadius: 1,
          "&:before": { display: "none" },
          transition: "all 0.2s ease",
        }}
      >
        <AccordionSummary
          aria-controls="panella-content"
          id="panella-header"
          sx={{ width: "100%" }}
        >
          {!question[i].open ? (
            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
              <Box sx={{ display: "flex", flexDirection: "column" }}>
                <span>
                  <Tooltip title="উপরে সরান">
                    <IconButton size="small" disabled={i === 0} onClick={(e) => { e.stopPropagation(); moveQuestion(i, -1); }}>
                      <ArrowUpwardIcon fontSize="inherit" />
                    </IconButton>
                  </Tooltip>
                </span>
                <span>
                  <Tooltip title="নিচে সরান">
                    <IconButton size="small" disabled={i === question.length - 1} onClick={(e) => { e.stopPropagation(); moveQuestion(i, 1); }}>
                      <ArrowDownwardIcon fontSize="inherit" />
                    </IconButton>
                  </Tooltip>
                </span>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body1" fontWeight={500} sx={{ pb: 0.5 }}>
                  {i + 1}. {question[i].questionText}
                  {question[i].required ? "*" : ""}
                </Typography>
              {que.options.map((opText, j) => (
                <Box key={j} sx={{ display: "flex" }}>
                  <FormControlLabel
                    disabled
                    control={<SortNumericIcon sx={{ mr: 1 }} fontSize="small" />}
                    label={
                      <Typography variant="body2" color="text.secondary">
                        {opText.optionsText}
                      </Typography>
                    }
                  />
                </Box>
              ))}
              </Box>
            </Box>
          ) : null}
        </AccordionSummary>
        {question[i].open ? (
          <Box sx={{ display: "flex", flexDirection: "row", alignItems: "flex-start" }}>
            <AccordionDetails
              sx={{ display: "flex", flexDirection: "column", width: "100%", pt: 0 }}
            >
              <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 1 }}>
                <TextField
                  fullWidth
                  size="small"
                  variant="outlined"
                  placeholder="Question"
                  value={que.questionText}
                  onChange={(e) => inputChangeHandler(e.target.value, i)}
                />
              </Box>
              {que.options.map((op, j) => (
                <Box key={j} sx={{ display: "flex", alignItems: "center", my: 0.5 }}>
                  <SortNumericIcon sx={{ mr: 1 }} fontSize="small" />
                  <TextField
                    variant="standard"
                    disabled
                    placeholder={op.optionsText}
                    onChange={(e) => changeValueHandler(e.target.value, i, j)}
                    fullWidth
                  />
                </Box>
              ))}
              <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", mt: 1, gap: 0.5 }}>
                <Tooltip title="প্রশ্ন কপি করুন">
                  <IconButton size="small" onClick={() => copyQuestion(i)}>
                    <FilterNoneIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="প্রশ্ন মুছুন">
                  <IconButton size="small" onClick={() => deleteQuestion(i)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Box sx={{ display: "flex", alignItems: "center", ml: 1 }}>
                  <Typography variant="caption" color="text.secondary">Required</Typography>
                  <Switch size="small" color="primary" onClick={() => requiredQuestion(i)} />
                </Box>
              </Box>
            </AccordionDetails>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, px: 0.5 }}>
              <Tooltip title="নতুন প্রশ্ন যোগ করুন">
                <IconButton size="small" onClick={() => addMoreQuestion(i)}>
                  <AddCircleOutlineIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        ) : null}
      </Accordion>
    ));
  }

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${BASE_URL}/create-notice/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + window.localStorage.getItem("gsmToken"),
        },
        body: JSON.stringify({
          document_name: documentName,
          sub_title: subtitle,
          doc_desc: documentDescription,
          question: question,
          range: range,
          timeStart: timeStart,
          timeEnd: timeEnd,
          startDadeline: startDadeline,
          endDadeline: endDadeline,
        }),
      });
      let data = await response.json();
      if (response.status === 422) {
        setError({});
        let tempErrors = {
          questions: [],
          range: [],
          startDedeline: [],
          endDadeline: [],
          timeStart: [],
          timeEnd: [],
        };
        data.errors.forEach((e, index) => {
          if (!tempErrors[e.path]) {
            tempErrors[e.path] = [];
          }
          tempErrors[e.path].push(
            <li key={index} style={{ color: "red" }}>{e.msg}</li>
          );
        });
        setError(tempErrors);
      }
      if (response.ok) {
        setSnackbar({ open: true, message: "নোটিশ সফলভাবে সেভ হয়েছে", severity: "success" });
        setTimeout(() => navigate("/dashboard"), 1500);
      }
    } catch (error) {
      console.error("Error:", error.message);
    }
  };

  return (
    <>
      <Box sx={{ maxWidth: 900, mx: "auto" }}>
        <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
          Create Notice
        </Typography>

        <Box>
          {/* Notice Name */}
          <TextField
            fullWidth
            size="small"
            variant="outlined"
            label="Notice Title"
            placeholder="Enter notice title"
            value={documentName}
            onChange={(e) => setdocumentName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Box component="ul" sx={{ listStyle: "none", p: 0, m: 0 }}>
            {error?.document_name}
          </Box>

          {/* Subtitle */}
          <TextField
            fullWidth
            size="small"
            variant="outlined"
            multiline
            minRows={3}
            label="Subtitle"
            value={subtitle}
            onChange={handleSubtitleChange}
            placeholder="Enter subtitle"
            sx={{ mb: 2 }}
          />

          {/* Description */}
          <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
            Description
          </Typography>
          <Box sx={{ mb: 8 }}>
            <ReactQuill
              theme="snow"
              value={documentDescription || ""}
              onChange={setdocumentDescription}
              placeholder="Add short description"
              style={{ height: "150px" }}
            />
          </Box>
          <Box component="ul" sx={{ listStyle: "none", p: 0, m: 0 }}>
            {error?.doc_desc}
          </Box>

          {/* Notice Type / Date / Time */}
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 2, mb: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Notice Type</InputLabel>
              <Select value={range || ""} onChange={rangeHandler} label="Notice Type" name="noticeType">
                <MenuItem value=""><em>Select</em></MenuItem>
                <MenuItem value="1">One Day</MenuItem>
                <MenuItem value="2">Two Days</MenuItem>
                <MenuItem value="3">Three Days</MenuItem>
                <MenuItem value="7">Weekly</MenuItem>
                <MenuItem value="15">Bi-Weekly</MenuItem>
                <MenuItem value="10">Occasion</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              type="date"
              label="Start Deadline"
              size="small"
              InputLabelProps={{ shrink: true }}
              value={startDadeline || ""}
              onChange={(e) => setStartDadeline(e.target.value)}
            />
            <TextField
              fullWidth
              type="time"
              label="Time Start"
              size="small"
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: "00:00", max: "22:00" }}
              value={timeStart}
              onChange={(e) => setTimeStart(e.target.value)}
            />
            <TextField
              fullWidth
              type="time"
              label="Time End"
              size="small"
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: "00:00", max: "22:00" }}
              value={timeEnd}
              onChange={(e) => setTimeEnd(e.target.value)}
            />
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* End Info */}
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 4, mb: 1 }}>
            <Box>
              <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
                Notice Range
              </Typography>
              <Typography variant="body2" fontWeight={500} sx={{ py: 1 }}>
                {range ? `${range} day${range > 1 ? "s" : ""}` : "—"}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
                End Deadline
              </Typography>
              <Typography variant="body2" fontWeight={500} sx={{ py: 1 }}>
                {endDadeline || "—"}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Question Builder */}
          <Typography variant="subtitle2" fontWeight={600} color="text.secondary" sx={{ mb: 1.5 }}>
            Questions
          </Typography>
          <Box sx={{ mb: 2 }}>{questionUI()}</Box>

          <Divider sx={{ my: 3 }} />

          {/* Submit */}
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mb: 3 }}>
            <Button variant="outlined" onClick={() => navigate("/dashboard")}>
              Cancel
            </Button>
            <Button variant="contained" size="large" onClick={submitHandler}>
              Save Notice
            </Button>
          </Box>
        </Box>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Notice;
