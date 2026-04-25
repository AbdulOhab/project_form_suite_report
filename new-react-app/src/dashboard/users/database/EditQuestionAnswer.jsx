import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FormControlLabel, Typography } from "@mui/material";
import SortTextIcon from "@mui/icons-material/ShortText";
import SortNumericIcon from "@mui/icons-material/NumbersSharp";
import Swal from "sweetalert2";
import BASE_URL from "../../../auth/dbUrl";
function EditQuestionAnswer() {
  const { formId, answerId } = useParams();
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

  // get answer form database
  useEffect(() => {
    const getQuestionFromDb = async () => {
      try {
        let response = await fetch(
          `${BASE_URL}/get-answer/${answerId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization:
                "myworld " + window.localStorage.getItem("gsmToken"),
            },
          }
        );
        let data = await response.json();
        // console.log(response.status);
        if (!response.ok) {
          throw new Error("get notice data failed");
        }
        if (response.ok) {
          setNotice(data);
          setAnswer(data?.answers);
        }
      } catch (error) {
        console.error("Error fetching notice data:", error);
        // Handle error
      }
    };
    getQuestionFromDb();
  }, [answerId]);

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

  //update data submission
  const updataHandler = async (e) => {
    e.preventDefault();
    const response = await fetch(
      `${BASE_URL}/update-answer/${answerId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "myworld " + window.localStorage.getItem("gsmToken"),
        },
        body: JSON.stringify({
          document_name: notice.document_name,
          doc_desc: notice.doc_desc,
          noticeId: formId,
          thanaCode: notice.thanaCode,
          answers: answer,
        }),
      }
    );
     await response.json();
    if (!response.status === 200) {
      throw new Error("Network response was not ok");
    }
    if (response.status === 200) {
      Swal.fire({
        title: "Do you want to save the changes?",
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: "Save",
        denyButtonText: `Don't save`,
      }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
          Swal.fire("Update your data successfully", "", "success");
          navigate(`/dashboard/branch-interface/${formId}`);
        } else if (result.isDenied) {
          Swal.fire("Changes are not saved", "", "info");
        }
      });
    }
  };

  return (
    <div className="container">
      <div className="card">
        <div className="card-header">
          <Typography className="text-center">
            {notice?.document_name}
          </Typography>
          <Typography className="text-center">{notice?.doc_desc}</Typography>
        </div>

        <form onSubmit={updataHandler}>
          {notice?.answers?.map((question, qIndex) => (
            <div
              className="card-body col-lg-6 col-md-8 col-sm-12 m-auto border  shadow mt-3"
              key={qIndex}
            >
              <Typography>
                {qIndex + 1}. {question?.questionText}{" "}
              </Typography>

              <div>
                <div className="d-flex align-items-center">
                  <FormControlLabel
                    control={
                      question.questionType !== "text" &&
                      question.questionType !== "number" ? (
                        <input
                          type={question.questionType}
                          name={qIndex}
                          className=" text-primary mx-2"
                          required={question?.required}
                          value={question?.data}
                          onChange={() =>
                            selectCheck(
                              question?.questionText,
                              question.optionsText,
                              qIndex,
                              question?.required,
                              question?.questionType
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
                          {question?.optionsText}
                        </Typography>
                      ) : (
                        <input
                          type={question.questionType}
                          name={qIndex}
                          className="text_input mx-1"
                          required={question?.required}
                          defaultValue={question?.data}
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
            </div>
          ))}
          <div className="col-lg-6 col-md-8 col-sm-10 m-auto">
            <button
              type="submit"
              className="btn btn-sm btn-success text-uppercase text-light hover my-3 mx-5"
            >
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditQuestionAnswer;
