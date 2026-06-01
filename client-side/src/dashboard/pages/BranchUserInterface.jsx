import React, { useState } from "react";
import { useEffect } from "react";
// import { AuthContext } from "../../../contexts/AuthContext";
import { Link, useParams } from "react-router-dom";
import { Button } from "@mui/material";
import Close from "@mui/icons-material/Close";
import DateDifferenceComponent from "../time/DateDifferenceComponent";
import TimeDifference from "../time/TimeDifference";
import BranchDayCount from "../time/BranchDayCount";
import BASE_URL from "../../auth/dbUrl";

function BranchUserInterface() {
  const { dayId, noticeId } = useParams();

  const [descriptionAlert, setDescriptionAlert] = useState(false);

  const [thanaReport, setThanaReport] = useState();
  const [notice, setNotice] = useState();
  const [totalData, setTotalData] = useState();

  useEffect(() => {
    const getBranchUsers = async () => {
      try {
        const response = await fetch(
          `${BASE_URL}/branch/data-checkout/${dayId}/${noticeId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization:
                "Bearer " + window.localStorage.getItem("gsmToken"),
            },
          }
        );
        const data = await response.json();

        if (response.ok) {
          setThanaReport(data.tempThana);
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
    getBranchUsers();
  }, [noticeId, dayId]);

  const descriptionHandler = () => {
    setDescriptionAlert(true);
  };
  const descriptionCloserHandler = () => {
    setDescriptionAlert(false);
  };

  return (
    <>
      <div className="table-responsive">
        <button className="btn btn-danger">dsffgsd</button>
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
              <div className="row">
                <div className="answerLeft col-lg-3 col-md-3 col-sm-12 m-auto">
                  <table
                    className="text-center table table-bordered border border-success"
                    border={1}
                  >
                    <thead>
                      <tr>
                        <DateDifferenceComponent
                          startDadeline={notice?.startDadeline}
                          endDadeline={notice?.endDadeline}
                          range={notice?.range}
                        />
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <TimeDifference
                          timeStart={notice?.timeStart}
                          timeEnd={notice?.timeEnd}
                          endDadeline={notice?.endDadeline}
                          startDadeline={notice?.startDadeline}
                        />
                      </tr>
                    </tbody>
                  </table>
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
                  <div className="d-flex align-items-end justify-content-end flex-column">
                    {!descriptionAlert && (
                      <Button
                        onClick={descriptionHandler}
                        className="text-center border border-success fw-semibold w-50"
                      >
                        Notice
                      </Button>
                    )}
                    <Link
                      className="button p-2 fs-5 "
                      to={`/dashboard/branch-data-interface/${noticeId}`}
                    >
                      <span>Back</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="card-body shadow my-3 bg-white p-3">
          <BranchDayCount
            startDadeline={notice?.startDadeline}
            range={notice?.range}
            questions={notice?.questions}
            thanaReport={thanaReport}
            totalData={totalData}
            endDadeline={notice?.endDadeline}
          />
        </div>
      </div>
    </>
  );
}

export default BranchUserInterface;
