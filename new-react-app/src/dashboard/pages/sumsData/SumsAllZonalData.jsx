import React, { useEffect, useMemo, useState } from "react";
import BASE_URL from "../../../auth/dbUrl";
import { Link, useParams } from "react-router-dom";
import DateDifferenceComponent from "../../time/DateDifferenceComponent";
import { Button } from "@mui/material";
import { Close } from "@mui/icons-material";
import convertToBengaliNumber from "../../time/NumberConverter";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const SumsAllZonalData = () => {
  const { qId } = useParams();

  const [descriptionAlert, setDescriptionAlert] = useState(false);
  const [notice, setNotice] = useState();
  const [totalData, setTotalData] = useState();
  const [tempData, setTempData] = useState();
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });

  useEffect(() => {
    const fetchData = async () => {
      await fetch(`${BASE_URL}/sums-zonal-data/${qId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "myworld " + window.localStorage.getItem("gsmToken"),
        },
      })
        .then((res) => res.json())
        .then((data) => {
          setNotice(data.question);
          setTotalData(data.sumsArray);
          setTempData(data.tempData);
        })
        .catch((err) => {
          console.log(err);
        });
    };
    fetchData();
  }, [qId]);

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

  const exportToExcel = () => {
    // Extract table headers
    const headers = [
      "Zonal Code",
      "Zonal Name",
      ...notice.questions.map((q) => q.questionText),
    ];

    // Extract table data
    const data = sortedData.map((zonal) => [
      zonal.zonalCode,
      zonal.userName,
      ...notice.questions.map((q) => zonal[q.questionText] || 0),
    ]);

    // Add total row
    const totalRow = ["", "Total", ...totalData.map((value) => value || 0)];
    data.unshift(totalRow); // Insert at the top

    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);

    // Create workbook and add worksheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Zonal Data");

    // Save file
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, "ZonalData.xlsx");
  };

  return (
    <div className="card">
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
        <div className="d-flex justify-content-between align-items-center">
          <div className="answerLeft">
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

          <div className="answerMiddle ">
            <p className="text-center fs-2 fw-semibold text-success">
              {notice?.document_name}
            </p>
            {notice?.sub_title && (
              <p className="text-center fs-6">{notice?.sub_title}</p>
            )}

            <p className="text-center">
              <span className="fs-3 fw-bold text-highlight bg-success rounded px-2">
                এক নজরে অঞ্চল সমূহের পূর্ণাঙ্গ রিপোর্ট
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

      <div className="card-body">
        <div className="text-end">
          <button className="btn btn-primary mb-2" onClick={exportToExcel}>
            Export to Excel
          </button>
        </div>
        <table
          className="table table-hover table-bordered table-responsive"
          border={1}
        >
          <thead>
            <tr className="text-center bg-primary">
              <th onClick={() => handleSort("zonalCode")}>
                Zonal Code
                {sortConfig.key === "zonalCode" &&
                  (sortConfig.direction === "ascending" ? " ▲" : " ▼")}
              </th>
              <th onClick={() => handleSort("userName")}>
                Zonal Name
                {sortConfig.key === "userName" &&
                  (sortConfig.direction === "ascending" ? " ▲" : " ▼")}
              </th>
              {notice?.questions?.map((question, index) => (
                <th
                  key={index}
                  onClick={() => handleSort(question.questionText)} // Pass question text as key
                >
                  {question?.questionText}
                  {sortConfig.key === question.questionText &&
                    (sortConfig.direction === "ascending" ? " ▲" : " ▼")}
                </th>
              ))}
              <th>Action</th>
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
              <th>
                <i className="fa fa-lock text-danger" aria-hidden="true"></i>
              </th>
            </tr>
          </tbody>
          <tbody className="bg-white">
            {sortedData?.map((zonal, zonalIndex) => (
              <tr key={zonalIndex} className="text-center">
                <td>{zonal.zonalCode}</td>
                <td>{zonal.userName}</td>
                {notice?.questions?.map((question, questionIndex) => (
                  <td key={`${zonalIndex}-${questionIndex}`}>
                    {zonal[question.questionText] || 0}
                  </td>
                ))}
                <td>
                  <div className="d-flex justify-content-center gap-1">
                    <Link
                      to={`/dashboard/sums-zonal-data-by-branch/${qId}/${zonal.zonalCode}`}
                      className="btn btn-outline-success"
                    >
                      <i className="fa fa-plus" aria-hidden="true"></i>
                    </Link>
                    <Link
                      to={`/dashboard/sums-day-by-day-zonal-data/${qId}/${zonal.zonalCode}`}
                      className="btn btn-outline-success"
                    >
                      <i className="fa fa-address-book" aria-hidden="true"></i>
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SumsAllZonalData;
