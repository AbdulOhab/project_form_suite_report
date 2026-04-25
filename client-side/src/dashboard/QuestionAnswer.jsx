import React, { useContext } from "react";
import moment from "moment";
import { useState } from "react";
import { useEffect } from "react";
import { useParams } from "react-router";
import { Button, Typography } from "@mui/material";
import SortTextIcon from "@mui/icons-material/ShortText";
import SortNumericIcon from "@mui/icons-material/NumbersSharp";
import FormControlLabel from "@mui/material/FormControlLabel";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import DateDifferenceComponent from "./time/DateDifferenceComponent";
import Close from "@mui/icons-material/Close";
import BASE_URL from "../auth/dbUrl";
import SweetAlert from "./time/SweetAlert";
const QuestionAnswer = () => {
  const { id } = useParams();
  const { userInfo } = useContext(AuthContext);
  

  const navigate = useNavigate();
  const [formDisabled, setFormDisabled] = useState(false);
  const [descriptionAlert, setDescriptionAlert] = useState(false);

  const [notice, setNotice] = useState([]);
  const [answer, setAnswer] = useState([]);
  const [currentDay, setCurrentDay] = useState(null);
  const [answerFind, setAnswerFind] = useState([]);

  // get notice form database
  useEffect(() => {
    const getQuestionFromDb = async () => {
      try {
        let response = await fetch(`${BASE_URL}/get-notice/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "myworld " + window.localStorage.getItem("gsmToken"),
          },
        });
        let data = await response.json();
        if (!response.ok) {
          throw new Error("get notice data failed");
        }
        if (response.ok) {
          setNotice(data);
        }
      } catch (error) {
        console.error("Error fetching notice data:", error);
        // Handle error
      }
    };
    getQuestionFromDb();
  }, [id]);

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

  // data submission
  const submitHnadler = async (e) => {
    e.preventDefault();
    const response = await fetch(`${BASE_URL}/create-answer/${id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "myworld " + window.localStorage.getItem("gsmToken"),
      },
      body: JSON.stringify({
        document_name: notice.document_name,
        doc_desc: notice.doc_desc,
        noticeId: id,
        thanaCode: userInfo.thanaCode,
        zonalCode: userInfo.zonalCode,
        branchCode: userInfo.branchCode,
        submitId: userInfo.userId,
        answers: answer,
      }),
    });
    await response.json();
    if (!response.status === 200) {
      throw new Error("Network response was not ok");
    }
    if (response.status === 200) {
      SweetAlert({
        icon: "success",
        message: "Form Submitted Successfully",
      });
      navigate(`/dashboard/thana-submission/${notice?._id}`);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const todayStartTime =
        moment().format("YYYY-MM-DD") + " " + notice.timeStart;
      const todayEndTime = moment().format("YYYY-MM-DD") + " " + notice.timeEnd;

      const now = moment();
      const startTime = moment(todayStartTime);
      const endTime = moment(todayEndTime);

      // If current time is before start time, calculate countdown to start time
      if (now.isBefore(startTime)) {
        setFormDisabled(true);
      }
      // If current time is between start and end time, calculate countdown to end time
      else if (now.isBetween(startTime, endTime)) {
        setFormDisabled(false);
      }
      // If current time is after end time, set time remaining to 0
      else {
        clearInterval(interval);

        setFormDisabled(true);
      }
    });

    // Clean up timerInterval on component unmount
    return () => clearInterval(interval);
  }, [notice]);
  const descriptionHandler = () => {
    setDescriptionAlert(true);
  };
  const descriptionCloserHandler = () => {
    setDescriptionAlert(false);
  };

  // get answer from database
  useEffect(() => {
    const findAnswerByDay = async () => {
      try {
        const response = await fetch(
          `${BASE_URL}/thana/find-data-checkout/${id}/${currentDay?.day}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization:
                "myworld " + window.localStorage.getItem("gsmToken"),
            },
          }
        );
        const data = await response.json();

        if (response.ok) {
          setAnswerFind(data.answer);
        } else {
          throw new Error("Failed to fetch");
        }
      } catch (error) {
        // Handle error
        console.error("Error fetching notice data:", error);
      }
    };
    findAnswerByDay();
  }, [id, currentDay]);

  // get current day
  useEffect(() => {
    const generateDateList = (start, range) => {
      const startDate = new Date(start);
      const dates = [];
      for (let i = 0; i < range; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        dates.push(currentDate);
      }
      return dates;
    };

    const checkDateStatus = (startDeadline, range) => {
      const startDate = new Date(startDeadline);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + range - 1);

      const today = new Date();
      // today.setHours(0, 0, 0, 0);

      if (today < startDate) {
        return 1;
      } else if (today >= startDate && today <= endDate) {
        return 0;
      } else {
        return -1;
      }
    };

    const findCurrentDay = (dates) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayIndex = dates.findIndex((date) => {
        const dateWithoutTime = new Date(date);
        dateWithoutTime.setHours(0, 0, 0, 0);
        return dateWithoutTime.getTime() === today.getTime();
      });
      return todayIndex !== -1
        ? { day: todayIndex + 1, date: dates[todayIndex].toDateString() }
        : null;
    };

    if (notice?.startDadeline && notice?.range) {
      const dates = generateDateList(notice?.startDadeline, notice?.range);
      const currentDayInfo = findCurrentDay(dates);
      setCurrentDay(currentDayInfo);
    }
    if (notice?.startDadeline) {
      checkDateStatus(notice?.startDadeline, notice?.range);
    }
  }, [notice?.startDadeline, notice?.range]);

  // send data to answer[]

  useEffect(() => {
    if (answerFind.length) {
      const newAnswer = [...answer]; // Create a shallow copy of the answer array
      answerFind.forEach((ans) =>
        ans.answers.forEach((a, i) => {
          newAnswer[i] = a;
        })
      );
      setAnswer(newAnswer); // Update state after processing all answers
    }
  }, [answerFind]);

  return (
    <div className="container">
      {/* <div className="hp my-5">{JSON.stringify(notice)}</div> */}
      <div className="card border-0">
        <div className="card-header border-0">
          <div className="myTopCard col-lg-8 col-md-6 col-sm-12 m-auto">
            {descriptionAlert && (
              <div className="docsPopUp">
                <Button
                  onClick={descriptionCloserHandler}
                  className=" float-end"
                >
                  <Close />
                </Button>
                {notice?.doc_desc}
              </div>
            )}
          </div>
          <div className="card-header">
            <div className="row">
              <div className="answerLeft col-lg-3 col-md-3 col-sm-12 m-auto">
                <div className="border p-3 rounded">
                  <DateDifferenceComponent
                    startDadeline={notice?.startDadeline}
                    range={notice?.range}
                    timeStart={notice?.timeStart}
                    timeEnd={notice?.timeEnd}
                    endDadeline={notice?.endDadeline}
                  />
                </div>
              </div>

              <div className="answerMiddle col-lg-6 col-md-6 col-sm-12 m-auto mt-0">
                <p className="text-center fs-2 fw-semibold text-success">
                  {notice?.document_name}
                </p>
                {notice?.sub_title && (
                  <p className="text-center fs-6">{notice?.sub_title}</p>
                )}
              </div>
              <div className="answerRight col-lg-3 col-md-3 col-sm-12 m-auto mt-0">
                <div className="border p-3 rounded">
                  <div className="d-flex justify-content-center align-items-center flex-column">
                    {!descriptionAlert && (
                      <Button
                        onClick={descriptionHandler}
                        className="text-center border border-success fw-semibold w-50"
                      >
                        Notice
                      </Button>
                    )}
                    <Link
                      className="button btn btn-success p-2"
                      to={`/dashboard`}
                    >
                      <span>Back</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="card-body shadow my-3">
          <form onSubmit={submitHnadler}>
            {notice?.questions?.map((question, qIndex) => (
              <div
                className="card-body col-lg-6 col-md-8 col-sm-12 m-auto  shadow mt-3"
                key={qIndex}
              >
                <div>
                  {qIndex + 1}. {question?.questionText}
                  <span className="text-danger fs-2">
                    {question?.required ? "*" : ""}
                  </span>
                </div>
                {question?.options?.map((opText, index) => (
                  <div key={index}>
                    <div className="d-flex align-items-center">
                      <div className="bg-danger">{question?.required}</div>
                      <FormControlLabel
                        control={
                          question.questionType !== "text" &&
                          question.questionType !== "number" ? (
                            <input
                              type={question.questionType}
                              name={qIndex}
                              className=" text-primary mx-2"
                              required={question?.required}
                              onChange={() =>
                                selectCheck(
                                  question?.questionText,
                                  opText?.optionsText,
                                  question?.questionType,
                                  qIndex,
                                  question?.required
                                )
                              }
                            />
                          ) : question?.questionType === "number" ? (
                            <SortNumericIcon className="me-1" />
                          ) : (
                            <SortTextIcon className="me-1" />
                          )
                        }
                        label={
                          question.questionType !== "text" &&
                          question.questionType !== "number" ? (
                            <Typography className="text-capitalize text-center">
                              {opText?.optionsText}
                            </Typography>
                          ) : (
                            <input
                              type={question.questionType}
                              name={qIndex}
                              className="text_input mx-1"
                              required={question?.required}
                              value={answer[qIndex]?.data}
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
                    </div>
                  </div>
                ))}
              </div>
            ))}
            <div className="col-lg-6 col-md-8 col-sm-10 m-auto">
              <button
                className="btn btn-success text-uppercase text-light hover my-3 mx-5"
                disabled={formDisabled || answerFind.length ? true : false}
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default QuestionAnswer;
