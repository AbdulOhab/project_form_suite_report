import React, { useState } from "react";
import { useEffect } from "react";
// import { AuthContext } from "../../../contexts/AuthContext";
import { Link, useParams } from "react-router-dom";
import { Button } from "@mui/material";
import Close from "@mui/icons-material/Close";
import DateDifferenceComponent from "../../time/DateDifferenceComponent";
import AdminBranchDayCount from "./AdminBranchDayCount";
import BASE_URL from "../../../auth/dbUrl";
import convertToBengaliNumber from "../../time/NumberConverter";

function AdminBranchUserInterface() {
  const { dayId, noticeId, zonalId } = useParams();

  const [descriptionAlert, setDescriptionAlert] = useState(false);
  const [notice, setNotice] = useState();
  const [totalData, setTotalData] = useState();
  const [tempData, setTempData] = useState();
  const [totalSubmit, setTotalSubmit] = useState();
  const [totalUnsubmit, setTotalUnsubmit] = useState();

  useEffect(() => {
    const getBranchUsers = async () => {
      try {
        const response = await fetch(
          `${BASE_URL}/admin/branch/data-checkout/${dayId}/${zonalId}/${noticeId}`,
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
          setNotice(data.question);
          setTotalData(data.sumsArray);
          setTempData(data.tempData);
          setTotalSubmit(data.totalSubmit);
          setTotalUnsubmit(data.totalUnsubmit);
        } else {
          throw new Error("Failed to fetch");
        }
      } catch (error) {
        // Handle error
        console.error("Error fetching notice data:", error);
      }
    };
    getBranchUsers();
  }, [noticeId, dayId, zonalId]);

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
                  <div className="border p-2">
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
                      এক নজরে ব্রাঞ্চ সমূহের রিপোর্ট
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
                      to={`/dashboard/admin-interface/${dayId}/${noticeId}`}
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
          <AdminBranchDayCount
            startDadeline={notice?.startDadeline}
            range={notice?.range}
            questions={notice?.questions}
            totalData={totalData}
            tempData={tempData}
            totalSubmit={totalSubmit}
            totalUnsubmit={totalUnsubmit}
          />
        </div>
      </div>
    </>
  );
}

export default AdminBranchUserInterface;
