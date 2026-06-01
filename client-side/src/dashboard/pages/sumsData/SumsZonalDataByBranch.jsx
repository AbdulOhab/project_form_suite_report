import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import BASE_URL from "../../../auth/dbUrl";
import { Button } from "@mui/material";
import { Close } from "@mui/icons-material";
import convertToBengaliNumber from "../../time/NumberConverter";
import DateDifferenceComponent from "../../time/DateDifferenceComponent";

const SumsZonalDataByBranch = () => {
  const { qId, zId } = useParams();
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });
  const [descriptionAlert, setDescriptionAlert] = useState(false);

  const [tempData, setTempData] = useState();
  const [notice, setNotice] = useState();
  const [questions, setQuestions] = useState();
  const [totalData, setTotalData] = useState();
  console.log(qId, zId);

  useEffect(() => {
    const getZonalaDataByBranch = async () => {
      const response = await fetch(
        `${BASE_URL}/sums-zonal-data-by-branch/${qId}/${zId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + window.localStorage.getItem("gsmToken"),
          },
        }
      );
      const data = await response.json();
      if (response.ok) {
        setTempData(data.tempData);
        setNotice(data.question);
        setQuestions(data.question);

        setTotalData(data.sumsArray);
      } else {
        throw new Error("Failed to fetch");
      }
    };

    getZonalaDataByBranch();
  }, [zId, qId]);

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
  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const sortedData = useMemo(() => {
    let sortableData = Array.isArray(tempData) ? [...tempData] : [];

    if (sortConfig.key !== null) {
      sortableData.sort((a, b) => {
        let aValue, bValue;

        // Check if sorting key is a predefined column or dynamic question
        if (sortConfig.key === "zonalCode" || sortConfig.key === "userName") {
          aValue = a[sortConfig.key];
          bValue = b[sortConfig.key];
        } else {
          // Sort by question values dynamically
          aValue = a[sortConfig.key] || 0; // Default to 0 if key doesn't exist
          bValue = b[sortConfig.key] || 0;
        }

        // Handle numeric sorting
        if (!isNaN(aValue) && !isNaN(bValue)) {
          return sortConfig.direction === "ascending"
            ? aValue - bValue
            : bValue - aValue;
        }

        // Handle string sorting
        if (typeof aValue === "string" && typeof bValue === "string") {
          return sortConfig.direction === "ascending"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        return 0; // Default case for undefined or mixed data
      });
    }

    return sortableData;
  }, [tempData, sortConfig]);

  return (
    <>
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
              <div className="answerLeft  p-3">
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
                    to={`/dashboard/sums-all-zonal-data/${qId}`}
                  >
                    <span>Back</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card-body">
          <table className="table table-bordered table-hover">
            <thead>
              <tr>
                <th onClick={() => handleSort("zonalCode")}>
                  Branch Code
                  {sortConfig.key === "zonalCode" &&
                    (sortConfig.direction === "ascending" ? " ▲" : " ▼")}
                </th>
                <th onClick={() => handleSort("userName")}>
                  Branch name
                  {sortConfig.key === "userName" &&
                    (sortConfig.direction === "ascending" ? " ▲" : " ▼")}
                </th>
                {questions?.questions?.map((question, index) => (
                  <th
                    key={index}
                    onClick={() => handleSort(question.questionText)}
                  >
                    {question.questionText}{" "}
                    {sortConfig.key === question.questionText &&
                      (sortConfig.direction === "ascending" ? "▲" : "▼")}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="text-center bg-primary fs-5">
                <th colSpan={2} className="text-light ">
                  Total
                </th>

                {totalData?.length
                  ? totalData?.map((value, index) => (
                      <th className="text-light fs-6" key={index}>
                        {value[index]}
                      </th>
                    ))
                  : notice?.questions?.map((value, index) => (
                      <th className="text-light fs-6" key={index}>
                        0
                      </th>
                    ))}
              </tr>
            </tbody>
            <tbody>
              {sortedData?.map((branch, zonalIndex) => (
                <tr key={zonalIndex} className="text-center">
                  <td>{branch.branchCode}</td>
                  <td>{branch.userName}</td>
                  {notice?.questions?.map((question, questionIndex) => (
                    <td key={`${zonalIndex}-${questionIndex}`}>
                      {branch[question.questionText] || 0}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default SumsZonalDataByBranch;
