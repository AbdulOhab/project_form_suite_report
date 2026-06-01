import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import BASE_URL from "../../../auth/dbUrl";
import { Button } from "@mui/material";
import { Close } from "@mui/icons-material";
import DateDifferenceComponent from "../../time/DateDifferenceComponent";
import convertToBengaliNumber from "../../time/NumberConverter";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import Loader from "../../time/Loader";

const SumsAllBranchData = () => {
  const { qId } = useParams();

  const [data, setData] = useState({
    tempBranchData: [],
    totalData: [],
    questions: [],
    notice: [],
  });
  const [descriptionAlert, setDescriptionAlert] = useState(false);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });

  // Fetch all branches sum data
  useEffect(() => {
    const getAllBranches = async () => {
      try {
        const response = await fetch(`${BASE_URL}/sums-branch-data/${qId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + window.localStorage.getItem("gsmToken"),
          },
        });
        const result = await response.json();

        if (response.ok) {
          setData({
            tempBranchData: result.tempData,
            totalData: result.sumsArray,
            questions: result.question?.questions,
            notice: result.question,
          });
        } else {
          throw new Error("Failed to fetch data");
        }
      } catch (error) {
        console.error("Error fetching branch data:", error);
      }
    };

    getAllBranches();
  }, [qId]);

  // Handle sorting
  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction:
        prev.key === key && prev.direction === "ascending"
          ? "descending"
          : "ascending",
    }));
  };

  // Sort data based on sortConfig
  const sortedData = useMemo(() => {
    const { key, direction } = sortConfig;
    if (!key) return data.tempBranchData;

    return [...data.tempBranchData].sort((a, b) => {
      const aValue = a[key] || 0;
      const bValue = b[key] || 0;

      if (typeof aValue === "number" && typeof bValue === "number") {
        return direction === "ascending" ? aValue - bValue : bValue - aValue;
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        return direction === "ascending"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return 0;
    });
  }, [data.tempBranchData, sortConfig]);

  // Calculate days difference
  const validCardData = (endDadeline) => {
    const currentDate = new Date();
    const endDadelineDate = new Date(endDadeline);
    const timeDiff = endDadelineDate - currentDate;
    return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  };

  const descriptionHandler = () => setDescriptionAlert(true);
  const descriptionCloserHandler = () => setDescriptionAlert(false);

  const exportToExcel = () => {
    const headers = [
      "Branch Code",
      "Branch Name",
      ...data.questions.map((q) => q.questionText),
    ];

    const tableData = sortedData.map((branch) => [
      branch.branchCode,
      branch.userName,
      ...data.questions.map((q) => branch[q.questionText] || 0),
    ]);

    const totalRow = [
      "Total",
      "",
      ...data.totalData.map((value) => value || 0),
    ];
    tableData.unshift(totalRow);

    const ws = XLSX.utils.aoa_to_sheet([headers, ...tableData]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Branch Data");

    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, "BranchData.xlsx");
  };

  return (
    <>
      <div className="card">
        <div className="card-header">
          <div className="myTopCard col-lg-8 col-md-6 col-sm-12 m-auto">
            {descriptionAlert && (
              <div className="docsPopUp">
                <Button
                  onClick={descriptionCloserHandler}
                  className="float-end"
                >
                  <Close />
                </Button>
                {data.notice?.doc_desc}
              </div>
            )}
          </div>
          <div className="card-header">
            <div className="d-flex justify-content-between align-items-center">
              <div className="answerLeft">
                <div className="border p-2">
                  {validCardData(data.notice?.endDadeline) < 0 ? (
                    <p className="text-center fs-4 fw-bold text-danger">
                      নোটিশ শেষ হয়েছে{" "}
                      {convertToBengaliNumber(
                        Math.abs(validCardData(data.notice?.endDadeline))
                      )}{" "}
                      দিন আগে
                    </p>
                  ) : (
                    <DateDifferenceComponent
                      startDadeline={data.notice?.startDadeline}
                      range={data.notice?.range}
                      timeStart={data.notice?.timeStart}
                      timeEnd={data.notice?.timeEnd}
                      endDadeline={data.notice?.endDadeline}
                    />
                  )}
                </div>
              </div>

              <div className="answerMiddle">
                <p className="text-center fs-2 fw-semibold text-success">
                  {data.notice?.document_name}
                </p>
                {data.notice?.sub_title && (
                  <p className="text-center fs-6">{data.notice?.sub_title}</p>
                )}

                <p className="text-center">
                  <span className="fs-3 fw-bold text-highlight bg-success rounded px-2">
                    এক নজরে শাখা সমূহের পূর্ণাঙ্গ রিপোর্ট
                  </span>
                </p>
              </div>
              <div className="answerRight">
                <div className="d-flex align-items-end justify-content-end flex-column">
                  {!descriptionAlert && (
                    <button
                      onClick={descriptionHandler}
                      className="text-center border border-success fw-semibold btn text-primary"
                    >
                      Notice
                    </button>
                  )}
                  <Link
                    className="button fs-5 p-2"
                    to={`/dashboard/admin-data-interface/${qId}`}
                  >
                    <span>Back</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="card-body">
        <div className="text-end my-3">
          <button className="btn btn-primary" onClick={exportToExcel}>
            Export to Excel
          </button>
        </div>
        {sortedData.length ? (
          <table className="table table-hover table-bordered table-responsive">
            <thead>
              <tr className="text-center bg-primary">
                <th onClick={() => handleSort("branchCode")}>
                  Branch Code{" "}
                  {sortConfig.key === "branchCode" &&
                    (sortConfig.direction === "ascending" ? " ▲" : " ▼")}
                </th>
                <th onClick={() => handleSort("userName")}>
                  Branch Name{" "}
                  {sortConfig.key === "userName" &&
                    (sortConfig.direction === "ascending" ? " ▲" : " ▼")}
                </th>

                {data.questions?.map((question, index) => (
                  <th
                    key={index}
                    onClick={() => handleSort(question.questionText)}
                  >
                    {question?.questionText}
                    {sortConfig.key === question.questionText &&
                      (sortConfig.direction === "ascending" ? " ▲" : " ▼")}
                  </th>
                ))}

                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr className="text-center bg-primary fs-5">
                <th className="text-light">Total</th>
                <th></th>
                {data.totalData.length
                  ? data.totalData?.map((value, index) => (
                      <th className="text-light fs-6" key={index}>
                        {value[index]}
                      </th>
                    ))
                  : data.questions?.map((value, index) => (
                      <th className="text-light fs-6" key={index}>
                        0
                      </th>
                    ))}
                <th className="text-danger">
                  <i className="fa fa-lock" aria-hidden="true"></i>
                </th>
              </tr>
            </tbody>
            <tbody className="bg-white">
              {sortedData.map((branch, branchIndex) => (
                <tr key={branchIndex} className="text-center">
                  <td className="text-dark">{branch.branchCode}</td>
                  <td className="text-dark">{branch.userName}</td>
                  {data.questions?.map((question, qIndex) => (
                    <td key={`${branchIndex}-${qIndex}`} className="text-dark">
                      {branch?.[question.questionText] || 0}
                    </td>
                  ))}
                  <td>
                    <div className="d-flex gap-2">
                      <Link
                        to={`/dashboard/sums-thana-by-branch/${qId}/${branch?.branchCode}`}
                        className="btn btn-outline-success"
                      >
                        <i className="fas fa-plus" aria-hidden="true"></i>
                      </Link>
                      <Link
                        to={`/dashboard/sums-day-by-day-branch-data/${qId}/${branch?.zonalCode}/${branch?.branchCode}`}
                        className="btn btn-outline-success"
                      >
                        <i
                          className="fa fa-address-book"
                          aria-hidden="true"
                        ></i>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <>
            <Loader />
          </>
        )}
      </div>
    </>
  );
};

export default SumsAllBranchData;
