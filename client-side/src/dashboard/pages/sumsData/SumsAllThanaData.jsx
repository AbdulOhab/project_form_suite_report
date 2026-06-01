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

const SumsAllThanaData = () => {
  const { qId } = useParams();
  const [notice, setNotice] = useState("");
  const [totalData, setTotalData] = useState();
  const [questions, setQuestions] = useState();
  const [sumsThanaData, setSumsThanaData] = useState();
  const [currentPage, setCurrentPage] = useState(1);
  const [descriptionAlert, setDescriptionAlert] = useState(false);
  const [usersPerPage, setUsersPerPage] = useState(25);
  const [search, setSearch] = useState("");
  const [originalData, setOriginalData] = useState([]);

  useEffect(() => {
    const sumsthanadata = async () => {
      try {
        const response = await fetch(`${BASE_URL}/sums-thana-data/${qId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + window.localStorage.getItem("gsmToken"),
          },
        });
        const data = await response.json();

        if (response.ok) {
          setNotice(data.question);
          setQuestions(data?.question?.questions);
          setTotalData(data?.sumsArray);
          setSumsThanaData(data?.sumsThanaData);
          setOriginalData(data?.sumsThanaData || []);
        } else {
          return console.log("Failed to fetch");
        }
      } catch (error) {
        // Handle error
        console.error("Error fetching notice data:", error);
      }
    };
    sumsthanadata();
  }, [qId]);

  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });

  // console.log(branchData);
  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const sortedData = useMemo(() => {
    let sortableData = Array.isArray(sumsThanaData) ? [...sumsThanaData] : [];
    if (sortConfig.key !== null) {
      sortableData.sort((a, b) => {
        let aValue, bValue;

        // Check if sorting key is a predefined column or dynamic question
        if (sortConfig.key === "branchCode" || sortConfig.key === "userName") {
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
  }, [sumsThanaData, sortConfig]);

  const descriptionHandler = () => {
    setDescriptionAlert(true);
  };
  const descriptionCloserHandler = () => {
    setDescriptionAlert(false);
  };
  const selectHandler = (event) => {
    setUsersPerPage(Number(event.target.value));
    setCurrentPage(1); // Reset to the first page
  };

  // Calculate paginated data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * usersPerPage;
    const endIndex = startIndex + usersPerPage;
    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, currentPage, usersPerPage]);

  // handle search data
  useEffect(() => {
    const searchHandler = () => {
      if (!search.trim()) {
        setSumsThanaData(originalData); // Reset if search is empty
        return;
      }
      const filteredData = originalData?.filter(
        (data) =>
          data?.userName?.toLowerCase().includes(search.toLowerCase()) ||
          data?.thanaCode === Number(search)
      );
      setCurrentPage(1); // Reset to first page
      setSumsThanaData(filteredData);
    };
    searchHandler();
  }, [search, originalData]);

  const validCardData = (endDadeline) => {
    const currentDate = new Date();
    const endDadelineDate = new Date(endDadeline);

    const timeDiff = endDadelineDate - currentDate;
    const diffInDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    return diffInDays;
  };

  const exportToExcel = () => {
    // Define headers excluding "Action"
    const headers = [
      "Thana Code",
      "Thana Name",
      ...questions.map((q) => q.questionText),
    ];

    // Extract table data excluding "Action" column
    const data = paginatedData.map((thana) => [
      thana.thanaCode,
      thana.userName,
      ...questions.map((q) => thana[q.questionText] || 0),
    ]);

    // Add total row (excluding "Action")
    const totalRow = ["Total", "", ...totalData.map((value) => value || 0)];
    data.unshift(totalRow); // Insert at the top

    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);

    // Create workbook and add worksheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Thana Data");

    // Save file
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, "ThanaData.xlsx");
  };

  const exportToExcelByTotal = () => {
    // Define headers excluding "Action"
    const headers = [
      "Thana Code",
      "Thana Name",
      ...questions.map((q) => q.questionText),
    ];

    // Extract table data excluding "Action" column
    const data = sortedData.map((thana) => [
      thana.thanaCode,
      thana.userName,
      ...questions.map((q) => thana[q.questionText] || 0),
    ]);

    // Add total row (excluding "Action")
    const totalRow = ["Total", "", ...totalData.map((value) => value || 0)];
    data.unshift(totalRow); // Insert at the top

    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);

    // Create workbook and add worksheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Thana Data");

    // Save file
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, "ThanaData.xlsx");
  };

  const totalPages = Math.ceil(sortedData.length / usersPerPage);
  const visiblePages = 5; // Set max visible pages

  const getPageNumbers = () => {
    if (totalPages <= visiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages = new Set([1, totalPages]); // Always show first and last page

    if (currentPage > 2) pages.add(currentPage - 1); // Show previous page
    pages.add(currentPage); // Show current page
    if (currentPage < totalPages - 1) pages.add(currentPage + 1); // Show next page

    return [...pages].sort((a, b) => a - b);
  };

  const pages = getPageNumbers();

  return (
    <>
      <div className="card">
        <div className="card-header">
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
                    এক নজরে সকল থানার পূর্ণাঙ্গ রিপোর্ট
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
        <div className="pagination-value m-3">
          <div className="d-flex justify-content-between align-items-center">
            <div className="">
              <select
                onChange={selectHandler}
                className="form-select-custom"
                value={usersPerPage}
              >
                <option value={25}>25</option>
                <option value={Math.ceil(sortedData?.length / 16 || 0)}>
                  {Math.ceil(sortedData?.length / 16 || 0)}
                </option>
                <option value={Math.ceil(sortedData?.length / 8 || 0)}>
                  {Math.ceil(sortedData?.length / 8 || 0)}
                </option>
                <option value={Math.ceil(sortedData?.length / 4 || 0)}>
                  {Math.ceil(sortedData?.length / 4 || 0)}
                </option>
                <option value={Math.ceil(sortedData?.length / 2 || 0)}>
                  {Math.ceil(sortedData?.length / 2 || 0)}
                </option>
                <option value={Math.ceil(sortedData?.length || 0)}>
                  {Math.ceil(sortedData?.length || 0)}
                </option>
              </select>
            </div>
            <div className="export-btn ">
              <div className="d-flex gap-5">
                <button className="btn btn-success " onClick={exportToExcel}>
                  Export This Page
                </button>
                <button
                  className="btn btn-primary "
                  onClick={exportToExcelByTotal}
                >
                  Export Total Thana Data
                </button>
              </div>
            </div>
            <div className="search-result">
              <input
                type="text"
                className="form-control"
                placeholder="Search..."
                onChange={(e) => {
                  setSearch(e.target.value);
                }}
              />
            </div>
          </div>
        </div>
        {paginatedData.length ? (
          <>
            <table
              className="table table-hover table-bordered table-responsive"
              border={1}
            >
              <thead>
                <tr className="text-center bg-primary">
                  <th onClick={() => handleSort("thanaCode")}>
                    Thana Code{" "}
                    {sortConfig.key === "thanaCode" &&
                      (sortConfig.direction === "ascending" ? " ▲" : " ▼")}
                  </th>
                  <th onClick={() => handleSort("userName")}>
                    Thana Name{" "}
                    {sortConfig.key === "userName" &&
                      (sortConfig.direction === "ascending" ? " ▲" : " ▼")}
                  </th>
                  {questions?.map((question, index) => (
                    <th
                      key={index}
                      onClick={() => handleSort(question.questionText)}
                    >
                      {question?.questionText}{" "}
                      {sortConfig.key === question.questionText &&
                        (sortConfig.direction === "ascending" ? " ▲" : " ▼")}
                    </th>
                  ))}
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr className="text-center bg-primary fs-5">
                  <th className="text-light" colSpan={2}>
                    Total
                  </th>

                  {totalData?.length > 0 ? (
                    totalData?.map((element, index) => (
                      <th className="text-light fs-6" key={index}>
                        {element ? element[index] : 0}
                      </th>
                    ))
                  ) : (
                    <th className="text-light fs-6">0</th>
                  )}
                  <th>
                    <i
                      className="fa fa-lock text-danger"
                      aria-hidden="true"
                    ></i>
                  </th>
                </tr>
              </tbody>
              <tbody className="bg-white">
                {paginatedData.map((thana, thanaIndex) => (
                  <tr key={thanaIndex} className="text-center">
                    <td>{thana.thanaCode}</td>
                    <td>{thana.userName}</td>
                    {questions?.map((question, qIndex) => (
                      <td key={`${thanaIndex}-${qIndex}`}>
                        {thana?.[question.questionText] || 0}
                      </td>
                    ))}
                    <td>
                      <Link
                        className="btn btn-sm btn-outline-success"
                        to={`/dashboard/sums-Totol-day-thana-data/${qId}/${thana?.zonalCode}/${thana?.branchCode}/${thana.thanaCode}`}
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div>
              <div className="bg-light px-3 py-2 rounded text-success">
                Total: {sortedData?.length}
                <span>
                  | {paginatedData.length} of {sortedData?.length}
                </span>
                <span>
                  | Page {currentPage} of{" "}
                  {Math.ceil(sortedData?.length / usersPerPage || 0)}
                </span>
              </div>
              <ul className="pagination justify-content-end">
                {/* Previous Button */}
                <li
                  className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
                >
                  <button
                    className="page-link text-success"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                </li>

                {/* Page Numbers */}
                {pages.map((page, index, arr) => (
                  <React.Fragment key={page}>
                    {index > 0 && page !== arr[index - 1] + 1 && (
                      <li className="page-item disabled">
                        <span className="page-link">...</span>
                      </li>
                    )}
                    <li
                      className={`page-item ${
                        currentPage === page ? "active" : ""
                      }`}
                    >
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </button>
                    </li>
                  </React.Fragment>
                ))}

                {/* Next Button */}
                <li
                  className={`page-item ${
                    currentPage === totalPages ? "disabled" : ""
                  }`}
                >
                  <button
                    className="page-link text-success"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </li>
              </ul>
            </div>
          </>
        ) : (
          <div>
            <Loader />
          </div>
        )}
      </div>
    </>
  );
};

export default SumsAllThanaData;
