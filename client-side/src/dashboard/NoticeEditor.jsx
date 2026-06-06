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

const NoticeEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [documentDescription, setdocumentDescription] = useState("");
  const [documentName, setdocumentName] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [range, setRange] = useState(null);
  const [startDadeline, setStartDadeline] = useState(null);
  const [endDadeline, setEndDadeline] = useState(null);
  const [error, setError] = useState();
  const [timeEnd, setTimeEnd] = useState("00:00:00");
  const [timeStart, setTimeStart] = useState("00:00:00");
  const [thana, setThana] = useState(false);
  const [branch, setBranch] = useState(false);
  const [zonal, setZonal] = useState(false);
  const [selectedType, setSelectedType] = useState("text");
  const [showSubtitleField, setShowSubtitleField] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [question, setQuestion] = useState([]);

  // Load existing notice
  useEffect(() => {
    const getQuestionFromDb = async () => {
      try {
        const response = await fetch(`${BASE_URL}/get-notice/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + window.localStorage.getItem("gsmToken"),
          },
        });
        const data = await response.json();
        if (!response.ok) throw new Error("Failed to load notice");
        setQuestion(data.questions);
        setdocumentName(data?.document_name || "");
        setdocumentDescription(data?.doc_desc || "");
        setSubtitle(data?.sub_title || "");
        if (data?.sub_title) setShowSubtitleField(true);
        setRange(data?.range);
        setStartDadeline(data?.startDadeline);
        setEndDadeline(data?.endDadeline);
        setTimeStart(data?.timeStart);
        setTimeEnd(data?.timeEnd);
        setThana(data?.thana);
        setBranch(data?.branch);
        setZonal(data?.zonal);
      } catch (error) {
        console.error("Error fetching notice data:", error);
      }
    };
    getQuestionFromDb();
  }, [id]);

  // Auto-compute endDadeline from startDadeline + range
  useEffect(() => {
    if (!startDadeline || !range) return;
    const date = new Date(startDadeline);
    date.setDate(date.getDate() + (+range - 1));
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    setEndDadeline(`${date.getDate()}-${months[date.getMonth()]}-${date.getFullYear()}`);
  }, [range, startDadeline]);

  const rangeHandler = (e) => setRange(e.target.value);

  const updateHandler = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${BASE_URL}/update-notice/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + window.localStorage.getItem("gsmToken"),
        },
        body: JSON.stringify({
          document_name: documentName,
          sub_title: subtitle,
          doc_desc: documentDescription,
          question,
          range,
          timeStart,
          timeEnd,
          startDadeline,
          endDadeline,
          thana,
          branch,
          zonal,
        }),
      });
      const data = await response.json();
      if (response.status === 422) {
        const tempErrors = { questions: [], range: [], startDedeline: [], endDadeline: [], timeStart: [], timeEnd: [] };
        data.errors.forEach((e, index) => {
          if (!tempErrors[e.path]) tempErrors[e.path] = [];
          tempErrors[e.path].push(<li key={index} style={{ color: "red" }}>{e.msg}</li>);
        });
        setError(tempErrors);
        return;
      }
      if (response.ok) {
        setSnackbar({ open: true, message: "নোটিশ সফলভাবে আপডেট হয়েছে", severity: "success" });
        setTimeout(() => navigate("/dashboard"), 1500);
      }
    } catch (error) {
      console.error("Error:", error.message);
      setSnackbar({ open: true, message: "আপডেট ব্যর্থ হয়েছে", severity: "error" });
    }
  };

  // ─── Question helpers ────────────────────────────────────────────────────────
  function inputChangeHandler(text, i) {
    const updated = [...question];
    updated[i].questionText = text;
    setQuestion(updated);
  }

  function addQuestionType(i, type) {
    const updated = [...question];
    updated[i].questionType = type;
    updated[i].options = [{ optionsText: type === "text" ? "Sort answer text" : "Value must be number" }];
    setQuestion(updated);
  }

  function changeValueHandler(text, i, j) {
    const updated = JSON.parse(JSON.stringify(question));
    updated[i].options[j].optionsText = text;
    setQuestion(updated);
  }

  function copyQuestion(i) {
    expandcloseAll();
    setQuestion([...question, { ...question[i] }]);
  }

  function deleteQuestion(i) {
    if (question.length > 1) {
      const updated = [...question];
      updated.splice(i, 1);
      setQuestion(updated);
    }
  }

  function requiredQuestion(i) {
    const updated = [...question];
    updated[i].required = !updated[i].required;
    setQuestion(updated);
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

  function addMoreQuestion() {
    expandcloseAll();
    setQuestion([
      ...question,
      {
        questionText: "",
        questionType: selectedType,
        options: [{ optionsText: selectedType === "text" ? "Sort answer text" : "Value must be number" }],
        open: true,
        required: false,
      },
    ]);
  }

  function expandcloseAll() {
    setQuestion(question.map((q) => ({ ...q, open: false })));
  }

  function handleExpandHandler(i) {
    setQuestion(question.map((q, idx) => ({ ...q, open: idx === i })));
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
        <AccordionSummary aria-controls="panella-content" id="panella-header" sx={{ width: "100%" }}>
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
                        que.questionType !== "text" && que.questionType !== "number" ? (
                          <input type={que.questionType} required={que.required} disabled />
                        ) : question[i].questionType === "number" ? (
                          <SortNumericIcon sx={{ mr: 1 }} fontSize="small" />
                        ) : (
                          <SortTextIcon sx={{ mr: 1 }} fontSize="small" />
                        )
                      }
                      label={<Typography variant="body2" color="text.secondary">{opText.optionsText}</Typography>}
                    />
                  </Box>
                ))}
              </Box>
            </Box>
          ) : null}
        </AccordionSummary>

        {question[i].open ? (
          <Box sx={{ display: "flex", flexDirection: "row" }}>
            <AccordionDetails sx={{ display: "flex", flexDirection: "column", width: "100%", pt: 0 }}>
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
                  <Select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
                    <MenuItem value="text" onClick={() => addQuestionType(i, "text")}>
                      <SubjectIcon sx={{ mr: 1 }} fontSize="small" /> Paragraph
                    </MenuItem>
                    <MenuItem value="number" onClick={() => addQuestionType(i, "number")}>
                      <NumericIcon sx={{ mr: 1 }} fontSize="small" /> Number
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
                  <Switch size="small" color="primary" checked={!!que.required} onClick={() => requiredQuestion(i)} />
                </Box>
              </Box>
            </AccordionDetails>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, py: 1.5, px: 0.5 }}>
              <AddCircleOutlineIcon
                sx={{ cursor: "pointer" }}
                titleAccess="New Question"
                onClick={addMoreQuestion}
                fontSize="small"
              />
            </Box>
          </Box>
        ) : null}
      </Accordion>
    ));
  }

  return (
    <>
      <Paper elevation={2} sx={{ maxWidth: 1000, mx: "auto", my: 3, borderRadius: 2, overflow: "hidden" }}>
        {/* Colored header — same as Notice.jsx */}
        <Box sx={{ bgcolor: "primary.main", px: 3, py: 2 }}>
          <Typography variant="h5" sx={{ color: "#fff", fontWeight: "bold", textAlign: "center" }}>
            Edit Notice
          </Typography>
        </Box>

        <Box sx={{ p: 3 }}>
          {/* Notice Title */}
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
          <Box component="ul" sx={{ listStyle: "none", p: 0, m: 0 }}>{error?.document_name}</Box>

          {/* Subtitle */}
          {showSubtitleField ? (
            <TextField
              fullWidth
              size="small"
              variant="outlined"
              label="Subtitle"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Enter subtitle"
              sx={{ mb: 2 }}
            />
          ) : (
            <Button size="small" startIcon={<AddCircleOutlineIcon />} onClick={() => setShowSubtitleField(true)} sx={{ mb: 2 }}>
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
          <Box component="ul" sx={{ listStyle: "none", p: 0, m: 0 }}>{error?.doc_desc}</Box>

          {/* Notice Type / Date / Time */}
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr 1fr" }, gap: 2, mb: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Notice Type</InputLabel>
              <Select value={range || ""} onChange={rangeHandler} label="Notice Type">
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
            <Box component="ul" sx={{ listStyle: "none", p: 0, m: 0 }}>{error?.startDadeline}</Box>
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

          {/* Permission + Range + End Deadline */}
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" }, gap: 2, mb: 2, alignItems: "start" }}>
            <Box>
              <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>Data Permission</Typography>
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
              <Box component="ul" sx={{ listStyle: "none", p: 0, m: 0 }}>{error?.zonal}</Box>
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
          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>Questions</Typography>
          <Box sx={{ mb: 2 }}>{questionUI()}</Box>

          {/* Actions */}
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
            <Button variant="outlined" onClick={() => navigate("/dashboard")}>
              Cancel
            </Button>
            <Button variant="contained" size="large" onClick={updateHandler}>
              Update Notice
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

export default NoticeEditor;
