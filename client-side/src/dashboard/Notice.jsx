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
  Paper,
  TextField,
  Button,
  Box,
  Checkbox,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
} from "@mui/material";
import SubjectIcon from "@mui/icons-material/Subject";
import NumericIcon from "@mui/icons-material/Numbers";
import SortTextIcon from "@mui/icons-material/ShortText";
import SortNumericIcon from "@mui/icons-material/NumbersSharp";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import FilterNoneIcon from "@mui/icons-material/FilterNone";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { useNavigate } from "react-router-dom";
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
  const [thana, setThana] = useState(false);
  const [branch, setBranch] = useState(false);
  const [zonal, setZonal] = useState(false);
  const [selectedType, setSelectedType] = useState("text");
  const [showSubtitleField, setShowSubtitleField] = useState(false);
  const [subtitle, setSubtitle] = useState("");

  const [question, setQuestion] = useState([
    {
      questionText: "",
      questionType: "text",
      options: [{ optionsText: "Sort answer text" }],
      open: true,
      required: false,
    },
  ]);

  const handleAddSubtitleClick = () => {
    setShowSubtitleField(true);
  };

  const handleSubtitleChange = (event) => {
    setSubtitle(event.target.value);
  };

  const handleSubtitleFieldBlur = () => {
    setShowSubtitleField(true);
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

  function addQuestionType(i, type) {
    let newType = [...question];
    newType[i].questionType = type;
    if (newType[i].questionType === "text") {
      newType[i].options = [{ optionsText: "Sort answer text" }];
      setQuestion(newType);
    }
    if (newType[i].questionType === "number") {
      newType[i].options = [{ optionsText: "Value must be number" }];
      setQuestion(newType);
    }
  }

  const handleChange = (event) => {
    setSelectedType(event.target.value);
  };

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
        questionType: selectedType,
        options: [
          {
            optionsText:
              selectedType === "text"
                ? "Sort answer text"
                : "Value must be number",
          },
        ],
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
          border: question[i].open ? 2 : 0,
          borderColor: "primary.main",
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
                <IconButton size="small" disabled={i === 0} onClick={(e) => { e.stopPropagation(); moveQuestion(i, -1); }}>
                  <ArrowUpwardIcon fontSize="inherit" />
                </IconButton>
                <IconButton size="small" disabled={i === question.length - 1} onClick={(e) => { e.stopPropagation(); moveQuestion(i, 1); }}>
                  <ArrowDownwardIcon fontSize="inherit" />
                </IconButton>
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
                    control={
                      que.questionType !== "text" &&
                      que.questionType !== "number" ? (
                        <input type={que.questionType} required={que.required} disabled />
                      ) : question[i].questionType === "number" ? (
                        <SortNumericIcon sx={{ mr: 1 }} fontSize="small" />
                      ) : (
                        <SortTextIcon sx={{ mr: 1 }} fontSize="small" />
                      )
                    }
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
          <Box sx={{ display: "flex", flexDirection: "row" }}>
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
                <FormControl size="small">
                  <Select value={selectedType} onChange={handleChange}>
                    <MenuItem value="text" onClick={() => addQuestionType(i, "text")}>
                      <SubjectIcon sx={{ mr: 1 }} fontSize="small" />
                      Paragraph
                    </MenuItem>
                    <MenuItem value="number" onClick={() => addQuestionType(i, "number")}>
                      <NumericIcon sx={{ mr: 1 }} fontSize="small" />
                      Number
                    </MenuItem>
                  </Select>
                </FormControl>
              </Box>
              {que.options.map((op, j) => (
                <Box key={j} sx={{ display: "flex", alignItems: "center", my: 0.5 }}>
                  {question[i].questionType === "number" ? (
                    <SortNumericIcon sx={{ mr: 1 }} fontSize="small" />
                  ) : question[i].questionType === "text" ? (
                    <SortTextIcon sx={{ mr: 1 }} fontSize="small" />
                  ) : null}
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
                <IconButton size="small" title="Copy" onClick={() => copyQuestion(i)}>
                  <FilterNoneIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" title="Delete" onClick={() => deleteQuestion(i)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
                <Box sx={{ display: "flex", alignItems: "center", ml: 1 }}>
                  <Typography variant="caption" color="text.secondary">Required</Typography>
                  <Switch size="small" color="primary" onClick={() => requiredQuestion(i)} />
                </Box>
              </Box>
            </AccordionDetails>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, py: 1.5, px: 0.5 }}>
              <AddCircleOutlineIcon
                sx={{ cursor: "pointer" }}
                titleAccess="New Question"
                onClick={() => addMoreQuestion(i)}
                fontSize="small"
              />
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
          thana: thana,
          branch: branch,
          zonal: zonal,
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
      <Paper elevation={2} sx={{ maxWidth: 1000, mx: "auto", my: 3, borderRadius: 2, overflow: "hidden" }}>
        <Box sx={{ bgcolor: "primary.main", px: 3, py: 2 }}>
          <Typography variant="h5" sx={{ color: "#fff", fontWeight: "bold", textAlign: "center" }}>
            Create Notice
          </Typography>
        </Box>

        <Box sx={{ p: 3 }}>
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
          {showSubtitleField ? (
            <TextField
              fullWidth
              size="small"
              variant="outlined"
              label="Subtitle"
              value={subtitle}
              onChange={handleSubtitleChange}
              onBlur={handleSubtitleFieldBlur}
              placeholder="Enter subtitle"
              sx={{ mb: 2 }}
            />
          ) : (
            <Button
              size="small"
              startIcon={<AddCircleOutlineIcon />}
              onClick={handleAddSubtitleClick}
              sx={{ mb: 2 }}
            >
              Add Subtitle
            </Button>
          )}

          {/* Description */}
          <TextField
            fullWidth
            size="small"
            variant="outlined"
            multiline
            minRows={2}
            label="Description"
            placeholder="Add short description"
            value={documentDescription}
            onChange={(e) => setdocumentDescription(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Box component="ul" sx={{ listStyle: "none", p: 0, m: 0 }}>
            {error?.doc_desc}
          </Box>

          {/* Notice Type / Date / Time */}
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr 1fr" }, gap: 2, mb: 2 }}>
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

          {/* Permission + End Info */}
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" }, gap: 2, mb: 2, alignItems: "start" }}>
            <Box>
              <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
                Data Permission
              </Typography>
              <Box sx={{ display: "flex", gap: 1 }}>
                <FormControlLabel
                  control={<Checkbox size="small" checked={thana} onChange={(e) => setThana(e.target.checked)} />}
                  label={<Typography variant="body2">Thana</Typography>}
                />
                <FormControlLabel
                  control={<Checkbox size="small" checked={branch} onChange={(e) => setBranch(e.target.checked)} />}
                  label={<Typography variant="body2">Branch</Typography>}
                />
                <FormControlLabel
                  control={<Checkbox size="small" checked={zonal} onChange={(e) => setZonal(e.target.checked)} />}
                  label={<Typography variant="body2">Zonal</Typography>}
                />
              </Box>
            </Box>
            <TextField
              fullWidth
              size="small"
              label="Notice Range"
              value={range ? `${range} day${range > 1 ? "s" : ""}` : "—"}
              disabled
            />
            <TextField
              fullWidth
              size="small"
              label="End Deadline"
              value={endDadeline || "—"}
              disabled
            />
          </Box>

          {/* Question Builder */}
          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
            Questions
          </Typography>
          <Box sx={{ mb: 2 }}>{questionUI()}</Box>

          {/* Submit */}
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
            <Button variant="outlined" onClick={() => navigate("/dashboard")}>
              Cancel
            </Button>
            <Button variant="contained" size="large" onClick={submitHandler}>
              Save Notice
            </Button>
          </Box>
        </Box>
      </Paper>

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
