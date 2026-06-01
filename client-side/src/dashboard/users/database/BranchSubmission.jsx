import React, { useState } from "react";
import { useEffect } from "react";
// import { AuthContext } from "../../../contexts/AuthContext";
import { Link, useParams } from "react-router-dom";
import { Button} from "@mui/material";
import DateDifferenceComponent from "../../time/DateDifferenceComponent";
import Close from "@mui/icons-material/Close";
import TimeDifference from "../../time/TimeDifference";
import BASE_URL from "../../../auth/dbUrl";

function BranchSubmission() {
  const { id } = useParams();

  const [descriptionAlert, setDescriptionAlert] = useState(false);

  const [thanaReport, setThanaReport] = useState();
  const [notice, setNotice] = useState();
  const [totalData, setTotalData] = useState();
  useEffect(() => {
    const getBranchUsers = async () => {
      try {
        const response = await fetch(
          `${BASE_URL}/branch/data-checkout/${id}`,
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
              <div className="row">
                <div className="answerLeft col-lg-3 col-md-3 col-sm-12 m-auto">
                  <table className="text-center table table-bordered border border-success">
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
                  {!descriptionAlert && (
                    <Button
                      onClick={descriptionHandler}
                      className="text-center border border-success fw-medium fw-semibold "
                    >
                      Notice Description
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="card-body shadow my-3">
          <table className="table table-striped table-hover table-bordered table-sm table-responsive-sm text-center border border-success">
            <thead>
              <tr className="text-capitalize bg-info">
                <th>Thana Name</th>
                {notice?.questions?.map((question, index) => (
                  <th key={index}>{question?.questionText}</th>
                ))}
                <th>Action</th>
              </tr>
            </thead>
            <thead>
              <tr>
                <th>Total</th>
                {totalData?.map((sum, index) => (
                  <th key={index}>{sum[index]}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {thanaReport?.map((thana, index) => (
                <tr key={index} className="text-capitalize">
                  <th>{thana?.userName}</th>
                  {thana?.answer?.answers ? (
                    <React.Fragment>
                      {thana.answer.answers.map((ans, ansIndex) => (
                        <td key={`${index}-${ansIndex}`}>{ans?.data}</td>
                      ))}
                      <td key={`edit-${index}`}>
                        <Link
                          to={`/dashboard/branch-edit-answer/${id}/${thana?.answer?._id}`}
                        >
                          <i
                            className="fa fa-edit text-danger"
                            aria-hidden="true"
                          ></i>
                        </Link>
                      </td>
                    </React.Fragment>
                  ) : (
                    <React.Fragment>
                      {
                        <td key={index}>
                          <Link
                            to={`/dashboard/branch-empty-answer/${thana?.thanaCode}/${notice?._id}`}
                          >
                            <i className="fa fa-edit" aria-hidden="true"></i>
                          </Link>
                        </td>
                      }
                    </React.Fragment>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default BranchSubmission;
