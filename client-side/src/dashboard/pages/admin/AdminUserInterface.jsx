import React, { useState } from "react";
import { useEffect } from "react";
// import { AuthContext } from "../../../contexts/AuthContext";
import { Link, useParams } from "react-router-dom";
import { Button } from "@mui/material";
import Close from "@mui/icons-material/Close";
import DateDifferenceComponent from "../../time/DateDifferenceComponent";
import AdminZonalDayCount from "./AdminZonalDayCount";
import BASE_URL from "../../../auth/dbUrl";
import AdminAllBranchDayCount from "./AdminAllBranchDayCount";
import convertToBengaliNumber from "../../time/NumberConverter";

function AdminUserInterface() {
  const { dayId, noticeId } = useParams();

  const [descriptionAlert, setDescriptionAlert] = useState(false);

  const [zonalReport, setZonalReport] = useState();
  const [notice, setNotice] = useState();
  const [totalData, setTotalData] = useState();
  const [totalSubmitted, setTotalSummitted] = useState();
  const [totalUnsubmitted, setTotalUnsubmitted] = useState();
  const [tempData, setTempData] = useState();
  const [branchShow, setBranchShow] = useState(false);
  const [zonalShow, setZonalShow] = useState(true);

  // zonal data fetch
  useEffect(() => {
    const getZonalUsers = async () => {
      try {
        const response = await fetch(
          `${BASE_URL}/admin/data-checkout/${dayId}/${noticeId}`,
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
          setZonalReport(data.tempZonal);
          setNotice(data.question);
          setTotalData(data.sumsArray);
          setTempData(data.tempData);
          setTotalSummitted(data.totalSubmitted);
          setTotalUnsubmitted(data.totalUnsubmitted);
        } else {
          throw new Error("Failed to fetch");
        }
      } catch (error) {
        // Handle error
        console.error("Error fetching notice data:", error);
      }
    };
    getZonalUsers();
  }, [noticeId, dayId]);


  const descriptionHandler = () => {
    setDescriptionAlert(true);
  };
  const descriptionCloserHandler = () => {
    setDescriptionAlert(false);
  };

  const handleBranch = () => {
    setBranchShow(true);
    setZonalShow(false);
  };
  const handleZonal = () => {
    setBranchShow(false);
    setZonalShow(true);
  };

  const validCardData = (endDadeline) => {
    const currentDate = new Date();
    const endDadelineDate = new Date(endDadeline);

    const timeDiff = endDadelineDate - currentDate;
    const diffInDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    return diffInDays;
  };

  return (
    <div className="card border-0 my-1">
      <div className="card-header border-0">
        <div className="myTopCard col-lg-8 col-md-6 col-sm-12 m-auto">
          {descriptionAlert && (
            <div className="docsPopUp">
              <Button onClick={descriptionCloserHandler} className=" float-end">
                <Close />
              </Button>
              {notice?.doc_desc}
            </div>
          )}
        </div>
        <div className="card-header">
          <div className="row">
            <div className="answerLeft col-lg-3 col-md-3 col-sm-12 m-auto">
              <div className="border p-2">
                {validCardData(notice?.endDadeline) < 0 ? (
                  <p className="text-center fs-6 fw-bold text-danger">
                    নোটিশ প্রদানের সময় শেষ হয়েছে{" "}
                    {convertToBengaliNumber(
                      Math.abs(validCardData(notice?.endDadeline))
                    )}{" "}
                    দিন পূর্বে
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
              </div>
            </div>

            <div className="answerMiddle col-lg-6 col-md-6 col-sm-12 m-auto mt-0">
              <p className="text-center fs-2 fw-semibold text-success">
                {notice?.document_name}
              </p>
              {notice?.sub_title && (
                <p className="text-center fs-6">{notice?.sub_title}</p>
              )}

              <p className="text-center">
                <span className="fs-3 fw-bold text-highlight bg-success rounded px-2">
                  এক নজরে অঞ্চল ও শাখা সমূহের রিপোর্ট
                </span>
              </p>
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
                  className="button fs-5 p-2"
                  to={`/dashboard/admin-data-interface/${noticeId}`}
                >
                  <span>Back</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="card-body d-flex gap-5">
        <button
          className={`btn btn-success ${zonalShow ? "text-highlight" : ""}`}
          onClick={handleZonal}
        >
          জোন ডাটা
        </button>
        <button
          className={`btn btn-success ${branchShow ? "text-highlight" : ""}`}
          onClick={handleBranch}
        >
          ব্রাঞ্চ ডাটা
        </button>
      </div>
      {/* এক নজরে অঞ্চল সমূহের রিপোর্ট table */}
      <div
        className={`card-body shadow p-3 rounded ${
          zonalShow ? "d-block" : "d-none"
        }`}
      >
        <div className="card-header">
          <h5 className="card-title text-center ">
            <span className="bg-primary px-3 py-2 rounded text-light">
              এক নজরে অঞ্চল সমূহের রিপোর্ট
            </span>
          </h5>
        </div>
        <div className="card-body">
          <AdminZonalDayCount
            startDadeline={notice?.startDadeline}
            range={notice?.range}
            questions={notice?.questions}
            zonalReport={zonalReport}
            totalData={totalData}
            branchData={tempData}
            countUnSubmit={totalUnsubmitted}
            countSubmit={totalSubmitted}
          />
        </div>
      </div>

      {/* এক নজরে জেলা সমূহের রিপোর্ট table */}
      <div className={`card-body shadow ${branchShow ? "d-block" : "d-none"}`}>
        <div className="card-header">
          <h5 className="card-title text-center">
            <span className="bg-primary px-3 py-2 rounded text-light">
              এক নজরে শাখা সমূহের রিপোর্ট
            </span>
          </h5>
        </div>
        <div className="card-body">
          <AdminAllBranchDayCount />
        </div>
      </div>
    </div>
  );
}

export default AdminUserInterface;
