import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import AccordionSummary from "@mui/material/AccordionSummary";
// import CropOriginalIcon from "@mui/icons-material/CropOriginal";
import SortTextIcon from "@mui/icons-material/ShortText";
import SortNumericIcon from "@mui/icons-material/NumbersSharp";
import SubjectIcon from "@mui/icons-material/Subject";
import NumericIcon from "@mui/icons-material/Numbers";
// import CloseIcon from "@mui/icons-material/Close";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import FilterNoneIcon from "@mui/icons-material/FilterNone";
import { Typography } from "@mui/material";
import Swal from "sweetalert2";
import FormControlLabel from "@mui/material/FormControlLabel";
import AccordionDetails from "@mui/material/AccordionDetails";
// import Checkbox from "@mui/material/Checkbox";
import Accordion from "@mui/material/Accordion";
import { BsTrash } from "react-icons/bs";
import { IconButton, MenuItem, Switch } from "@mui/material";
import Select from "@mui/material/Select";
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
    // let newOption = [...question];
    // console.log(text);
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
        options: [{ optionsText: selectedType ==='text'? "Sort answer text" : "Value must be number" }],
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
          className={question[i].open ? "add_border" : ""}
          onChange={() => {
            handleExpandHandler(i);
          }}
        >
          <AccordionSummary
            arrial-controlls="panella-centent"
            id="panella-header"
            elevation={1}
            className="w-100 my-3"
          >
            {!question[i].open ? (
              <div className="saved_question">
                <Typography className="fs-5 lh-base pb-1">
                  {i + 1}.{question[i].questionText}
                  {question[i].required ? "*" : ""}
                </Typography>
                {que.options.map((opText, j) => (
                  <div key={j}>
                    <div className="d-flex">
                      <FormControlLabel
                        disabled
                        control={
                          que.questionType !== "text" &&
                          que.questionType !== "number" ? (
                            <input
                              type={que.questionType}
                              className="text-primary mx-1"
                              inputProps={{
                                "arial-label": "secondary checkbox",
                              }}
                              required={que.required}
                              disabled
                            />
                          ) : question[i].questionType === "number" ? (
                            <SortNumericIcon className="me-1" />
                          ) : (
                            <SortTextIcon className="me-1" />
                          )
                        }
                        label={
                          <Typography className="fs-6 fw-medium lh-1 text-dark px-2">
                            {opText.optionsText}
                          </Typography>
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              ""
            )}
          </AccordionSummary>
          {question[i].open ? (
            <div className="questionBox d-flex flex-row justify-content-center">
              <AccordionDetails className="addQuestion text-light border rounded p-3 text-capitalize d-flex flex-column pt-0 w-100 ms-1">
                <div className="addQuestionTop d-flex flex-row align-items-center justify-content-between">
                  <input
                    type="text"
                    className="questionCSS fw-medium text-black "
                    onChange={(e) => inputChangeHandler(e.target.value, i)}
                    placeholder="Question"
                    value={que.questionText}
                  />
                  {/* <CropOriginalIcon className="text-primary fs-4 mx-2" /> */}
                  <Select
                    value={selectedType}
                    onChange={handleChange}
                    className="select mt-2 "
                  >
                    <MenuItem
                      id="text"
                      value="text"
                      selected
                      onClick={() => addQuestionType(i, "text")}
                    >
                      <SubjectIcon className="me-1" />
                      Paragraph
                    </MenuItem>

                    <MenuItem
                      id="number"
                      value="number"
                      onClick={() => addQuestionType(i, "number")}
                    >
                      <NumericIcon className="me-1" />
                      Number
                    </MenuItem>
                  
                   
                  </Select>
                </div>
                {que.options.map((op, j) => (
                  <div
                    key={j}
                    className="add_questions_body fw-medium text-dark d-flex align-items-center"
                  >
                    {question[i].questionType === "number" ? (
                      <SortNumericIcon className="me-1" />
                    ) : question[i].questionType === "text" ? (
                      <SortTextIcon className="me-1" />
                    ) : (
                      ""
                    )}
                    <div>
                      <input
                        type="text"
                        disabled
                        className="text_input"
                        placeholder={op.optionsText}
                        onChange={(e) => {
                          changeValueHandler(e.target.value, i, j);
                        }}
                      />
                    </div>
                    
                  </div>
                ))}
               
                <div className="add_footer d-flex justify-content-between align-items-center">
                  <div className="add_question_bottom_left">
                   
                  </div>
                  <div className="add_question_bottom">
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
                    <button aria-label="copy" className="border-0 rounded-3">
                      <span className="text-secondary fs-4">required</span>
                      <Switch
                        name="checked"
                        color="primary"
                        title="required"
                        onClick={() => requiredQuestion(i)}
                      />
                    </button>
                  
                  </div>
                </div>
              </AccordionDetails>
              <div className="question_edit d-flex flex-column gap-3 ms-3 h-75 py-3 px-2 rounded">
                <AddCircleOutlineIcon
                  className="edit"
                  titleAccess="New Question"
                  onClick={() => addMoreQuestion(i)}
                />
               
              </div>
            </div>
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
      const response = await fetch(
        `${BASE_URL}/create-notice/${id}`,
        {
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
        }
      );
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
        // console.log(data);
        data.errors.forEach((e, index) => {
          // console.log(e.path);
          if (!tempErrors[e.path]) {
            tempErrors[e.path] = []; // Initialize the array if it doesn't exist
          }
          tempErrors[e.path].push(
            <li key={index} className="text-danger">
              {e.msg}
            </li>
          );
        });
        setError(tempErrors);
      }

      if (response.ok) {
        Swal.fire({
          position: "top-end",
          icon: "success",
          title: "Your Notice has been saved",
          showConfirmButton: false,
          timer: 3000,
        });
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Error:", error.message);
    }
  };

  return (
    <>
      <div className="card shadow col-md-8 m-auto ">
        <h2 className="text-center fw-bold text-success my-3">Create Notice</h2>
        <div className="card-header">
          <div className="document-header">
            <div className="mb-3">
              <input
                type="text"
                className="fw-bold form-control fs-1 border-0 text-capitalize"
                name="form"
                id="form"
                value={documentName}
                placeholder="Name of then Notice"
                onChange={(e) => setdocumentName(e.target.value)}
              />

              <ul className="list-unstyled">{error?.document_name}</ul>
            </div>
            <div className="mb-3">
              {showSubtitleField && (
                <input
                  type="text"
                  value={subtitle}
                  className="form-control w-100 fs-5 border-0 text-capitalize"
                  onChange={handleSubtitleChange}
                  onBlur={handleSubtitleFieldBlur}
                  placeholder="Enter subtitle"
                />
              )}
              {!showSubtitleField && (
                <AddCircleOutlineIcon
                  className="edit"
                  titleAccess="Add Subtitle"
                  onClick={handleAddSubtitleClick}
                />
              )}
            </div>
            <div className="mb-3">
              <textarea
                type="text"
                className="form-control w-100 fs-5 border-0 text-capitalize"
                name="description"
                id="description"
                // value={documentDescription}
                placeholder="Add Sort Desctiption"
                onChange={(e) => setdocumentDescription(e.target.value)}
              />
              <ul className="list-unstyled">{error?.doc_desc}</ul>
            </div>
          </div>
          <div className="notice-type-range-dadeline">
            <div className="d-flex justify-content-around align-items-center gap-3">
              <div className="mb-3 w-25">
                <label htmlFor="noticeType" className="form-label">
                  Notice Type
                </label>
                <select
                  className="form-select"
                  onChange={rangeHandler}
                  name="noticeType"
                  id="noticeType"
                >
                  <option defaultValue={''} >Select</option>
                  <option value="1">One</option>
                  <option value="2">Two</option>
                  <option value="3">Three</option>
                  <option value="7">Weeckly</option>
                  <option value="15">De-Weeckly</option>
                  <option value="10">Occation</option>
                </select>

                <ul className="list-unstyled">{error?.range}</ul>
              </div>
              <div className="mb-3 w-25">
                <label htmlFor="startDadeline" className="form-label">
                  Start Dadeline
                </label>
                <input
                  type="Date"
                  className="form-control"
                  name="startDadeline"
                  id="startDadeline"
                  value={startDadeline}
                  onChange={(e) => setStartDadeline(e.target.value)}
                />
                <ul className="list-unstyled">{error?.startDadeline}</ul>
              </div>
              <div className="mb-3 w-25">
                <label htmlFor="timeStart" className="form-label">
                  Time Start
                </label>
                <input
                  type="time"
                  className="form-control"
                  name="timeStart"
                  id="timeStart"
                  min="00:00"
                  max="22:00"
                  value={timeStart}
                  onChange={(e) => setTimeStart(e.target.value)}
                />
                <ul className="list-unstyled">{error?.timeSelect}</ul>
              </div>
              <div className="mb-3 w-25">
                <label htmlFor="timeEnd" className="form-label">
                  Time End
                </label>
                <input
                  type="time"
                  className="form-control"
                  name="timeEnd"
                  id="timeEnd"
                  min="00:00"
                  max="22:00"
                  value={timeEnd}
                  onChange={(e) => setTimeEnd(e.target.value)}
                />
                <ul className="list-unstyled">{error?.timeSelect}</ul>
              </div>
            </div>
          </div>
          <div className="notice-dadeline-show">
            <div className="d-flex justify-content-around align-items-center gap-3">
              <div className="data-permission">
                <div className="notice-data-permission">
                  <label className="form-label">Notice Data permission</label>
                </div>
                <div className="form-check form-check-inline">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="thana"
                    name="thana"
                    value={thana}
                    onChange={(e) => setThana(e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="thana">
                    Thana
                  </label>
                </div>
                <div className="form-check form-check-inline">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="branch"
                    name="branch"
                    value={branch}
                    onChange={(e) => setBranch(e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="branch">
                    Branch
                  </label>
                </div>
                <div className="form-check form-check-inline">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="zonal"
                    name="zonal"
                    value={zonal}
                    onChange={(e) => setZonal(e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="zonal">
                    Zonal
                  </label>
                </div>
                <ul>{error?.zonal}</ul>
              </div>

              <div className="mb-3 w-25">
                <label htmlFor="" className="form-label">
                  Notice Range
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="No Value"
                  value={range}
                  disabled
                />
              </div>

              <div className="mb-3 w-25">
                <label htmlFor="endDadeline" className="form-label">
                  End Dadeline
                </label>
                <input
                  type="text"
                  className="form-control"
                  name="endDadeline"
                  id="endDadeline"
                  disabled
                  value={endDadeline}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="card-body ">{questionUI()}</div>
        <div className=" py-3 px-3">
          <button
            className="btn btn-primary fw-bold fs-5"
            onClick={submitHandler}
          >
            Save
          </button>
        </div>
      </div>
    </>
  );
};

export default Notice;
