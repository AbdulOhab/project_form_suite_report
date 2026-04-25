import React, { useEffect, useState } from "react";
import AdminTableDataInterfce from "./AdminTableDataInterfce";
import { Link, useParams } from "react-router-dom";
import { Button } from "@mui/material";
import DateDifferenceComponent from "../../time/DateDifferenceComponent";
import { Close } from "@mui/icons-material";
import BASE_URL from "../../../auth/dbUrl";
import convertToBengaliNumber from "../../time/NumberConverter";

function AdminDataInterface() {
  const { id } = useParams();

  const [descriptionAlert, setDescriptionAlert] = useState(false);

  const [zonalReport, setZonalReport] = useState();
  const [notice, setNotice] = useState();
  const [totalData, setTotalData] = useState();

  useEffect(() => {
    const getZonalUsers = async () => {
      try {
        const response = await fetch(`${BASE_URL}/admin/data-interface/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "myworld " + window.localStorage.getItem("gsmToken"),
          },
        });
        const data = await response.json();

        if (response.ok) {
          setZonalReport(data?.tempZonal);
          setNotice(data?.question);
          setTotalData(data?.sumsArray);
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

  //  working ground 1এক নজরে দৈনিক রিপোর্ট

  return (
    <>
      <div className="card border-0 my-1">
        <div className="card-header border-0">
          <div className="myTopCard">
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
            <div className="d-flex justify-content-between align-items-center flex-column  flex-sm-row flex-md-row flex-lg-row">
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
                    এক নজরে দৈনিক রিপোর্ট
                  </span>
                </p>
              </div>
              <div className="answerRight col-lg-3 col-md-3 col-sm-12 m-auto mt-0">
                <div className="d-flex align-items-center justify-content-center flex-column">
                  {!descriptionAlert && (
                    <Button
                      onClick={descriptionHandler}
                      className="text-center border border-success fw-semibold"
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
        {/* all data shower pages */}
        <div className="d-flex justify-content-start align-items-center gap-5 mt-3 ms-5">
          <Link
            to={`/dashboard/sums-all-zonal-data/${notice?._id}`}
            className="btn btn-success p-2"
          >
            এক নজরে অঞ্চল
          </Link>
          <Link
            to={`/dashboard/sums-all-branches-data/${notice?._id}`}
            className="btn btn-success p-2"
          >
            এক নজরে ব্রাঞ্চ
          </Link>
          <Link
            to={`/dashboard/sums-all-thana-data/${notice?._id}`}
            className="btn btn-success p-2"
          >
            এক নজরে থানা
          </Link>
        </div>
        {/* table for এক নজরে দৈনিক রিপোর্ট  */}
        <div className="card-body shadow my-3">
          <AdminTableDataInterfce
            startDadeline={notice?.startDadeline}
            range={notice?.range}
            totalData={totalData}
            questions={notice?.questions}
            zonalReport={zonalReport}
          />
        </div>
      </div>
    </>
  );
}

export default AdminDataInterface;
