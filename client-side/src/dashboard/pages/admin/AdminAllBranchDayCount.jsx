import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ZonalBangladayDate from "../../time/ZonalBangladayDate";
import Loader from "../../time/Loader";
import BASE_URL from "../../../auth/dbUrl";

function AdminAllBranchDayCount() {
  const { dayId, noticeId } = useParams();
  
  const [notice, setNotice] = useState()
  const [branchReport, setBranchReport] = useState([]);
  const [tempBranchData, setTempBranchData] = useState([]);
  const [branchSumArray, setBranchSumArray] = useState([]);
  const [questions, setQuestions] = useState()


  const [dateList, setDateList] = useState([]);
  const [countUnSubmit, setCountUnSubmit] = useState();
  const [countSubmit, setCountSubmit] = useState();




  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });

  const {startDadeline, range} = notice || {};

  // all branch data fetch
  useEffect(() => {
    const getAllBranches = async () => {
      try {
        const response = await fetch(
          `${BASE_URL}/admin/get-all-branches/${noticeId}/${dayId}/`,
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
          setQuestions(data?.question?.questions);
          setBranchReport(data.tempBranch);
          setTempBranchData(data.tempData);
          setBranchSumArray(data.sumsArray);
        } else {
          throw new Error("Failed to fetch");
        }
      } catch (error) {
        // Handle error
        console.error("Error fetching notice data:", error);
      }
    };
    getAllBranches();
  }, [noticeId, dayId]);

  useEffect(() => {
    const data = branchReport?.reduce(
      (acc, branch) => {
        if (Array.isArray(branch?.tempThana)) {
          acc.total += branch.tempThana?.length;
          acc.unsubmitted += branch.tempThana.filter(
            (thana) => thana?.answers?.length === 0
          )?.length;
        }
        return acc;
      },
      { unsubmitted: 0, total: 0 }
    );

    setCountUnSubmit(data?.unsubmitted);
    setCountSubmit(data?.total - data?.unsubmitted);
  }, [branchReport]);

  useEffect(() => {
    const generateDateList = (start, range) => {
      const startDate = new Date(start);
      const dates = [];
      for (let i = 0; i < range; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        dates.push(currentDate);
      }
      return dates;
    };

    if (startDadeline && range) {
      const dates = generateDateList(startDadeline, range);
      setDateList(dates);
    }
  }, [startDadeline, range]);

  // console.log(branchData);
  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const sortedData = useMemo(() => {
    let sortableData = Array.isArray(tempBranchData) ? [...tempBranchData] : [];

    if (sortConfig.key !== null) {
      sortableData.sort((a, b) => {
        let aValue, bValue;

        // Check if sorting key is a predefined column or dynamic question
        if (
          sortConfig.key === "branchCode" ||
          sortConfig.key === "userName" ||
          sortConfig.key === "totalThana" ||
          sortConfig.key === "thanaAnsSubmit" ||
          sortConfig.key === "thanaAnsUnsubmit"
        ) {
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
  }, [tempBranchData, sortConfig]);

  return (
    <>
      {!dateList?.length ? (
        <Loader />
      ) : (
        dateList?.map((date, index) => {
          if (index + 1 === Number(dayId)) {
            return (
              <React.Fragment key={index}>
                <ZonalBangladayDate
                  day={index + 1}
                  date={date}
                  totalUnsubmitted={countUnSubmit}
                  totalSubmitted={countSubmit}
                />
                <table
                  className="table table-hover table-bordered table-responsive"
                  border={1}
                >
                  <thead>
                    <tr className="text-center bg-light">
                      <th onClick={() => handleSort("branchCode")}>
                        Branch Code
                        {sortConfig.key === "zonalCode" &&
                          (sortConfig.direction === "ascending" ? " ▲" : " ▼")}
                      </th>
                      <th onClick={() => handleSort("userName")}>
                        Branch Name
                        {sortConfig.key === "userName" &&
                          (sortConfig.direction === "ascending" ? " ▲" : " ▼")}
                      </th>
                      <th onClick={() => handleSort("totalThana")}>
                        Total Thana
                        {sortConfig.key === "totalThana" &&
                          (sortConfig.direction === "ascending" ? " ▲" : " ▼")}
                      </th>
                      <th onClick={() => handleSort("thanaAnsSubmit")}>
                        Submit
                        {sortConfig.key === "thanaAnsSubmit" &&
                          (sortConfig.direction === "ascending" ? " ▲" : " ▼")}
                      </th>
                      <th onClick={() => handleSort("thanaAnsUnsubmit")}>
                        Unsubmit
                        {sortConfig.key === "thanaAnsUnsubmit" &&
                          (sortConfig.direction === "ascending" ? " ▲" : " ▼")}
                      </th>
                      {questions?.map((question, index) => (
                        <th
                          key={index}
                          onClick={() => handleSort(question.questionText)} // Pass question text as key
                        >
                          {question?.questionText}
                          {sortConfig.key === question.questionText &&
                            (sortConfig.direction === "ascending"
                              ? " ▲"
                              : " ▼")}
                        </th>
                      ))}

                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="text-center bg-primary fs-5">
                      <th className="text-light" colSpan={5}>
                        Total
                      </th>

                      {branchSumArray?.length
                        ? branchSumArray?.map((value, index) => (
                            <th className="text-light fs-6" key={index}>
                              {value[index]}
                            </th>
                          ))
                        : questions.map((value, index) => (
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
                        <td>{branch.branchCode}</td>
                        <td>{branch.userName}</td>
                        <td>{branch.totalThana}</td>
                        <td>{branch.thanaAnsSubmit}</td>
                        <td>{branch.thanaAnsUnsubmit}</td>
                        {questions?.map((question, qIndex) => (
                          <td key={`${branchIndex}-${qIndex}`}>
                            {branch?.[question.questionText] || 0}
                          </td>
                        ))}
                        <td>
                          <Link
                            to={`/dashboard/admin-data-perDayCount/${dayId}/${branch?.zonalCode}/${branch?.branchCode}/${noticeId}`}
                            className="btn btn-success"
                          >
                            <i className="fas fa-plus" aria-hidden="true"></i>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </React.Fragment>
            );
          } else {
            return null;
          }
        })
      )}
    </>
  );
}

export default AdminAllBranchDayCount;
