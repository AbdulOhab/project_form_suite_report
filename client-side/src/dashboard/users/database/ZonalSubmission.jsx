import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import DateDifferenceComponent from "../../time/DateDifferenceComponent";
import Close from "@mui/icons-material/Close";
import { Button } from "@mui/material";
import TimeDifference from "../../time/TimeDifference";
import BASE_URL from "../../../auth/dbUrl";

function ZonalSubmission() {
  const { id } = useParams();
  const [branchTotalData, setBranchTotolData] = useState();
  const [totalData, setTotalData] = useState();
  const [notice, setNotice] = useState();
  const [branch, setBranch] = useState();
  const [descriptionAlert, setDescriptionAlert] = useState(false);
  useEffect(() => {
    const getBranchUsers = async () => {
      try {
        const response = await fetch(
          `${BASE_URL}/zonal/data-checkout/${id}`,
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
          setNotice(data.question);
          setBranch(data.tempBranch);
          setBranchTotolData(data.tempData);
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
    <div>
      <div className="card">
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
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-striped table-hover table-bordered table-sm table-responsive-sm text-center  align-middle">
              <thead className="">
                <tr className="text-capitalize bg-info">
                  <th>Branch Name</th>
                  {notice?.questions?.map((question, index) => (
                    <th key={index}>{question?.questionText}</th>
                  ))}
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
              <tbody className="table-group-divider">
                {branch?.map((user, userIndex) => (
                  <tr key={userIndex}>
                    <td>{user.userName}</td>
                    {Object.keys(branchTotalData[userIndex]).map(
                      (key, answerIndex) => (
                        <td key={answerIndex}>
                          {branchTotalData[userIndex][key]}
                        </td>
                      )
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ZonalSubmission;
