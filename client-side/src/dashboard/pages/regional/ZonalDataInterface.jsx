import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@mui/material";
import Close from "@mui/icons-material/Close";
import DateDifferenceComponent from "../../time/DateDifferenceComponent";
import TimeDifference from "../../time/TimeDifference";
import ZonalTableDataInterfce from "../../time/ZonalTableDataInterfce";
import BASE_URL from "../../../auth/dbUrl";
import convertToBengaliNumber from "../../time/NumberConverter";

function ZonalDataInterface() {
  const { id } = useParams();

  const [descriptionAlert, setDescriptionAlert] = useState(false);

  const [branchReport, setBranchReport] = useState();
  const [notice, setNotice] = useState();
  const [totalData, setTotalData] = useState();

  useEffect(() => {
    const getZonalUsers = async () => {
      try {
        const response = await fetch(`${BASE_URL}/zonal/data-interface/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + window.localStorage.getItem("gsmToken"),
          },
        });
        const data = await response.json();

        if (response.ok) {
          setBranchReport(data.tempBranch);
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
    getZonalUsers();
  }, [id]);
  const descriptionHandler = () => {
    setDescriptionAlert(true);
  };
  const descriptionCloserHandler = () => {
    setDescriptionAlert(false);
  };

  const validCardData = (endDadeline) => {
    const currentDate = new Date();
    const endDadelineDate = new Date(endDadeline);

    const timeDiff = endDadelineDate - currentDate;
    const diffInDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    return diffInDays;
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
                        {validCardData(notice?.endDadeline) < 0 ? (
                          <p className="text-center fs-4 fw-bold text-danger">
                            নোটিশ শেষ হয়েছে{" "}
                            {convertToBengaliNumber(
                              Math.abs(validCardData(notice?.endDadeline))
                            )}{" "}
                            দিন আগে
                          </p>
                        ) : (
                          <DateDifferenceComponent
                            startDadeline={notice?.startDadeline}
                            range={notice?.range}
                            timeStart={notice?.timeStart}
                            timeEnd={notice?.timeEnd}
                            endDadeline={notice?.endDadeline}
                          />
                        )}
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
                    <Link className="button fs-5 p-2" to={`/dashboard`}>
                      <span>Back</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="card-body shadow my-3 bg-white p-3 rounded">
          <ZonalTableDataInterfce
            startDadeline={notice?.startDadeline}
            range={notice?.range}
            totalData={totalData}
            questions={notice?.questions}
            branchReport={branchReport}
          />
        </div>
      </div>
    </>
  );
}

export default ZonalDataInterface;
