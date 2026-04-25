import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
// import moment from "moment";
import { FormControlLabel, Typography } from "@mui/material";
import SortTextIcon from "@mui/icons-material/ShortText";
import SortNumericIcon from "@mui/icons-material/NumbersSharp";
import Swal from "sweetalert2";
import BASE_URL from "../../../auth/dbUrl";
import { useContext } from "react";
import { AuthContext } from "../../../contexts/AuthContext";
function BranchEmptyNotice() {
  const { firstId, secondId } = useParams();

  const { userInfo } = useContext(AuthContext);
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
        let response = await fetch(`${BASE_URL}/get-question/${secondId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "myworld " + window.localStorage.getItem("gsmToken"),
          },
        });
        let data = await response.json();

        if (!response.status === 200) {
          throw new Error("get notice data failed");
        }
        if (response.status === 200) {
          setNotice(data);
        }
      } catch (error) {
        console.error("Error fetching notice data:", error);
        // Handle error
      }
    };
    getQuestionFromDb();
  }, [secondId]);
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

  // data submission by branch
  const submitHandler = async (e) => {
    e.preventDefault();
    const response = await fetch(`${BASE_URL}/create-answer/${secondId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "myworld " + window.localStorage.getItem("gsmToken"),
      },
      body: JSON.stringify({
        document_name: notice.document_name,
        doc_desc: notice.doc_desc,
        noticeId: notice._id,
        thanaCode: firstId,
        branchCode: userInfo?.branchCode,
        zonalCode: userInfo?.zonalCode,

        answers: answer,
      }),
    });
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
          navigate(`/dashboard/branch-data-interface/${secondId}`);
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

        <form onSubmit={submitHandler}>
          {notice?.questions?.map((question, qIndex) => (
            <div
              className="card-body col-lg-6 col-md-8 col-sm-12 m-auto border  shadow mt-3"
              key={qIndex}
            >
              <Typography>
                {qIndex + 1}. {question?.questionText}{" "}
              </Typography>
              {question?.options?.map((opText, index) => (
                <div key={index}>
                  <div className="d-flex align-items-center">
                    <div className=" bg-danger">{question?.required}</div>
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
                                opText.optionsText,
                                question.questionType,
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
                            // placeholder={opText?.optionsText}
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
            <button className="btn  btn-success text-uppercase text-ligh my-3 mx-5 float-end">
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BranchEmptyNotice;
