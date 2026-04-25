import React, { useState } from "react";
import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@mui/material";
import Close from "@mui/icons-material/Close";
import DateDifferenceComponent from "../time/DateDifferenceComponent";
import DateByDayCount from "../time/DateByDayCount";
import BASE_URL from "../../auth/dbUrl";

function ThanaUserInterface() {
  const { id } = useParams();

  const [descriptionAlert, setDescriptionAlert] = useState(false);

  const [answer, setAnswer] = useState();
  const [notice, setNotice] = useState();
  const [totalData, setTotalData] = useState();

  useEffect(() => {
    const getThanaUsers = async () => {
      try {
        const response = await fetch(`${BASE_URL}/thana/data-checkout/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "myworld " + window.localStorage.getItem("gsmToken"),
          },
        });
        const data = await response.json();

        if (response.ok) {
          setAnswer(data.answers);
          setNotice(data.question);
          setTotalData(data.sumsArray);
        } else {
          throw new Error("Failed to fetch");
        }
      } catch (error) {
        // Handle error
        console.error("Error fetching notice data:", error);
      }
    };
    getThanaUsers();
  }, [id]);

  const descriptionHandler = () => {
    setDescriptionAlert(true);
  };
  const descriptionCloserHandler = () => {
    setDescriptionAlert(false);
  };

  return (
    <>
      <div className="table-responsive">
        <div className="card border-0 my-1">
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
              <div className="d-flex justify-content-between align-items-center">
                <div className="answerLeft border p-3">
                  <DateDifferenceComponent
                    startDadeline={notice?.startDadeline}
                    endDadeline={notice?.endDadeline}
                    range={notice?.range}
                    timeStart={notice?.timeStart}
                    timeEnd={notice?.timeEnd}
                  />
                </div>

                <div className="answerMiddle">
                  <p className="text-center fs-2 fw-semibold text-success">
                    {notice?.document_name}
                  </p>
                  {notice?.sub_title && (
                    <p className="text-center fs-6">{notice?.sub_title}</p>
                  )}
                </div>
                <div className="answerRight">
                  <div className="d-flex align-items-end justify-content-center flex-column">
                    {!descriptionAlert && (
                      <Button
                        onClick={descriptionHandler}
                        className="text-center border border-success fw-semibold "
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
        <div className="card-body shadow my-3 bg-white p-3 rounded">
          <DateByDayCount
            startDadeline={notice?.startDadeline}
            range={notice?.range}
            thanaReport={answer}
            questions={notice?.questions}
            totalData={totalData}
          />
        </div>
      </div>
    </>
  );
}

export default ThanaUserInterface;
