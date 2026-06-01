import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import AccordionSummary from "@mui/material/AccordionSummary";
import SortTextIcon from "@mui/icons-material/ShortText";
import SortNumericIcon from "@mui/icons-material/NumbersSharp";
import SubjectIcon from "@mui/icons-material/Subject";
import NumericIcon from "@mui/icons-material/Numbers";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import FilterNoneIcon from "@mui/icons-material/FilterNone";
import {
  Typography,
  FormControlLabel,
  AccordionDetails,
  Accordion,
  IconButton,
  MenuItem,
  Switch,
  Select,
  Paper,
  TextField,
  Button,
  Grid,
  Box,
  Checkbox,
  FormControl,
  InputLabel,
} from "@mui/material";
import { BsTrash } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import { Snackbar, Alert } from "@mui/material";
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
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
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
      <div key={i}>
        <Accordion
          key={i}
          expanded={question[i].open}
          onChange={() => {
            handleExpandHandler(i);
          }}
          sx={{
            border: question[i].open ? 2 : 0,
            borderColor: "primary.main",
            my: 1,
          }}
        >
          <AccordionSummary
            aria-controls="panella-content"
            id="panella-header"
            sx={{ width: "100%" }}
          >
            {!question[i].open ? (
              <Box>
                <Typography variant="h6" sx={{ pb: 0.5 }}>
                  {i + 1}.{question[i].questionText}
                  {question[i].required ? "*" : ""}
                </Typography>
                {que.options.map((opText, j) => (
                  <Box key={j} sx={{ display: "flex" }}>
                    <FormControlLabel
                      disabled
                      control={
                        que.questionType !== "text" &&
                        que.questionType !== "number" ? (
                          <input
                            type={que.questionType}
                            required={que.required}
                            disabled
                          />
                        ) : question[i].questionType === "number" ? (
                          <SortNumericIcon sx={{ mr: 1 }} />
                        ) : (
                          <SortTextIcon sx={{ mr: 1 }} />
                        )
                      }
                      label={
                        <Typography variant="body1" sx={{ px: 2 }}>
                          {opText.optionsText}
                        </Typography>
                      }
                    />
                  </Box>
                ))}
              </Box>
            ) : (
              ""
            )}
          </AccordionSummary>
          {question[i].open ? (
            <Box sx={{ display: "flex", flexDirection: "row", justifyContent: "center" }}>
              <AccordionDetails
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  width: "100%",
                  ml: 1,
                  pt: 0,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <TextField
                    fullWidth
                    variant="standard"
                    placeholder="Question"
                    value={que.questionText}
                    onChange={(e) => inputChangeHandler(e.target.value, i)}
                    sx={{ mr: 2 }}
                  />
                  <FormControl size="small">
                    <Select
                      value={selectedType}
                      onChange={handleChange}
                      sx={{ mt: 1 }}
                    >
                      <MenuItem
                        value="text"
                        onClick={() => addQuestionType(i, "text")}
                      >
                        <SubjectIcon sx={{ mr: 1 }} />
                        Paragraph
                      </MenuItem>
                      <MenuItem
                        value="number"
                        onClick={() => addQuestionType(i, "number")}
                      >
                        <NumericIcon sx={{ mr: 1 }} />
                        Number
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                {que.options.map((op, j) => (
                  <Box
                    key={j}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      my: 0.5,
                    }}
                  >
                    {question[i].questionType === "number" ? (
                      <SortNumericIcon sx={{ mr: 1 }} />
                    ) : question[i].questionType === "text" ? (
                      <SortTextIcon sx={{ mr: 1 }} />
                    ) : (
                      ""
                    )}
                    <TextField
                      variant="standard"
                      disabled
                      placeholder={op.optionsText}
                      onChange={(e) => {
                        changeValueHandler(e.target.value, i, j);
                      }}
                      fullWidth
                    />
                  </Box>
                ))}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    mt: 1,
                  }}
                >
                  <IconButton
                    aria-label="copy"
                    title="copy"
                    onClick={() => {
                      copyQuestion(i);
                    }}
                  >
                    <FilterNoneIcon />
                  </IconButton>
                  <IconButton
                    aria-label="delete"
                    title="delete"
                    onClick={() => {
                      deleteQuestion(i);
                    }}
                  >
                    <BsTrash />
                  </IconButton>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Typography variant="body2" sx={{ color: "text.secondary", mr: 1 }}>
                      Required
                    </Typography>
                    <Switch
                      name="checked"
                      color="primary"
                      title="required"
                      onClick={() => requiredQuestion(i)}
                    />
                  </Box>
                </Box>
              </AccordionDetails>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                  ml: 1.5,
                  py: 1.5,
                  px: 1,
                  borderRadius: 1,
                  height: "75%",
                }}
              >
                <AddCircleOutlineIcon
                  sx={{ cursor: "pointer" }}
                  titleAccess="New Question"
                  onClick={() => addMoreQuestion(i)}
                />
              </Box>
            </Box>
          ) : (
            ""
          )}
        </Accordion>
      </div>
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
            <li key={index} style={{ color: "red" }}>
              {e.msg}
            </li>
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
    <Paper
      elevation={3}
      sx={{
        maxWidth: 900,
        mx: "auto",
        my: 3,
        p: 3,
      }}
    >
      <Typography
        variant="h4"
        align="center"
        fontWeight="bold"
        color="primary"
        sx={{ my: 2 }}
      >
        Create Notice
      </Typography>

      {/* Document Header */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          variant="standard"
          placeholder="Name of the Notice"
          value={documentName}
          onChange={(e) => setdocumentName(e.target.value)}
          InputProps={{
            sx: { fontSize: 32, fontWeight: "bold", textTransform: "capitalize" },
          }}
        />
        <Box component="ul" sx={{ listStyle: "none", p: 0, m: 0 }}>
          {error?.document_name}
        </Box>
      </Box>

      {/* Subtitle */}
      <Box sx={{ mb: 3 }}>
        {showSubtitleField ? (
          <TextField
            fullWidth
            variant="standard"
            value={subtitle}
            onChange={handleSubtitleChange}
            onBlur={handleSubtitleFieldBlur}
            placeholder="Enter subtitle"
            InputProps={{
              sx: { fontSize: 20, textTransform: "capitalize" },
            }}
          />
        ) : (
          <AddCircleOutlineIcon
            sx={{ cursor: "pointer" }}
            titleAccess="Add Subtitle"
            onClick={handleAddSubtitleClick}
          />
        )}
      </Box>

      {/* Description */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          multiline
          variant="standard"
          placeholder="Add Short Description"
          value={documentDescription}
          onChange={(e) => setdocumentDescription(e.target.value)}
          InputProps={{
            sx: { fontSize: 20, textTransform: "capitalize" },
          }}
        />
        <Box component="ul" sx={{ listStyle: "none", p: 0, m: 0 }}>
          {error?.doc_desc}
        </Box>
      </Box>

      {/* Notice Type / Deadline / Time Row */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Notice Type</InputLabel>
            <Select
              value={range || ""}
              onChange={rangeHandler}
              label="Notice Type"
              name="noticeType"
            >
              <MenuItem value="">
                <em>Select</em>
              </MenuItem>
              <MenuItem value="1">One</MenuItem>
              <MenuItem value="2">Two</MenuItem>
              <MenuItem value="3">Three</MenuItem>
              <MenuItem value="7">Weekly</MenuItem>
              <MenuItem value="15">Bi-Weekly</MenuItem>
              <MenuItem value="10">Occasion</MenuItem>
            </Select>
          </FormControl>
          <Box component="ul" sx={{ listStyle: "none", p: 0, m: 0 }}>
            {error?.range}
          </Box>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TextField
            fullWidth
            type="date"
            label="Start Deadline"
            size="small"
            InputLabelProps={{ shrink: true }}
            value={startDadeline || ""}
            onChange={(e) => setStartDadeline(e.target.value)}
          />
          <Box component="ul" sx={{ listStyle: "none", p: 0, m: 0 }}>
            {error?.startDadeline}
          </Box>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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
          <Box component="ul" sx={{ listStyle: "none", p: 0, m: 0 }}>
            {error?.timeSelect}
          </Box>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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
          <Box component="ul" sx={{ listStyle: "none", p: 0, m: 0 }}>
            {error?.timeSelect}
          </Box>
        </Grid>
      </Grid>

      {/* Data Permission / Range / End Deadline Row */}
      <Grid container spacing={3} sx={{ mb: 3 }} alignItems="center">
        <Grid size={{ xs: 12, sm: 12, md: 6 }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Notice Data Permission
          </Typography>
          <Box sx={{ display: "flex", gap: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={thana}
                  onChange={(e) => setThana(e.target.checked)}
                />
              }
              label="Thana"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={branch}
                  onChange={(e) => setBranch(e.target.checked)}
                />
              }
              label="Branch"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={zonal}
                  onChange={(e) => setZonal(e.target.checked)}
                />
              }
              label="Zonal"
            />
          </Box>
          <Box component="ul" sx={{ listStyle: "none", p: 0, m: 0 }}>
            {error?.zonal}
          </Box>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TextField
            fullWidth
            label="Notice Range"
            size="small"
            placeholder="No Value"
            value={range || ""}
            disabled
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TextField
            fullWidth
            label="End Deadline"
            size="small"
            value={endDadeline || ""}
            disabled
          />
        </Grid>
      </Grid>

      {/* Question Builder */}
      <Box sx={{ my: 2 }}>{questionUI()}</Box>

      {/* Submit */}
      <Box sx={{ py: 2, px: 1 }}>
        <Button
          variant="contained"
          size="large"
          onClick={submitHandler}
          sx={{ fontWeight: "bold", fontSize: 18 }}
        >
          Save
        </Button>
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
