import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import BASE_URL from "../../../auth/dbUrl";
import { Button } from "@mui/material";
import { Close } from "@mui/icons-material";
import DateDifferenceComponent from "../../time/DateDifferenceComponent";
import convertToBengaliNumber from "../../time/NumberConverter";

const SumsThanaByBranches = () => {
  const { qId, bId } = useParams();
  const [notice, setNotice] = useState("");
  const [totalData, setTotalData] = useState();
  const [branchName, setBranchName] = useState("");
  const [questions, setQuestions] = useState();
  const [sumsThanaData, setSumsThanaData] = useState();

  const [descriptionAlert, setDescriptionAlert] = useState(false);

  useEffect(() => {
    const sumsthanadata = async () => {
      try {
        const response = await fetch(
          `${BASE_URL}/sums-thana-by-branch-data/${qId}/${bId}`,
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
          setQuestions(data?.question?.questions);
          setTotalData(data?.sumsArray);
          setBranchName(data?.branch);
          setSumsThanaData(data?.sumsThanaData);
        } else {
          return console.log("Failed to fetch");
        }
      } catch (error) {
        // Handle error
        console.error("Error fetching notice data:", error);
      }
    };
    sumsthanadata();
  }, [qId, bId]);

  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });
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

  const validCardData = (endDadeline) => {
    const currentDate = new Date();
    const endDadelineDate = new Date(endDadeline);

    const timeDiff = endDadelineDate - currentDate;
    const diffInDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    return diffInDays;
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
                  <div className="text-center text-success fw-bold">
                    ব্রাঞ্চের নামঃ{branchName?.userName}
                  </div>
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
                    এক নজরে{" "}
                    <span className="bg-danger text-light px-1">
                      শাখা ভিত্তিক
                    </span>{" "}
                    থানার পূর্ণাঙ্গ রিপোর্ট
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
                    to={`/dashboard/sums-all-branches-data/${qId}`}
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
            </tr>
          </thead>
          <tbody>
            <tr className="text-center bg-info fs-5">
              <th className="text-danger" colSpan={2}>
                Total
              </th>
              {totalData?.map((element, index) => (
                <th className="text-danger fs-6" key={index}>
                  {element ? element[index] : "0"}
                </th>
              ))}
            </tr>
          </tbody>
          <tbody className="bg-white">
            {sortedData.map((thana, thanaIndex) => (
              <tr key={thanaIndex} className="text-center">
                <td>{thana.thanaCode}</td>
                <td>{thana.userName}</td>
                {questions?.map((question, qIndex) => (
                  <td key={`${thanaIndex}-${qIndex}`}>
                    {thana?.[question.questionText] || 0}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default SumsThanaByBranches;
