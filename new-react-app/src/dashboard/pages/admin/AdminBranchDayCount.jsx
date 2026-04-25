import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ZonalBangladayDate from "../../time/ZonalBangladayDate";
import Loader from "../../time/Loader";

function AdminBranchDayCount({
  startDadeline,
  range,
  questions,
  totalData,
  tempData,
  totalSubmit,
  totalUnsubmit,
}) {
  const { dayId, noticeId } = useParams();
  const [dateList, setDateList] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });


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
    let sortableData = Array.isArray(tempData) ? [...tempData] : [];

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
  }, [tempData, sortConfig]);

  // console.log(sortedData);

  return (
    <>
      {!dateList.length ? (
        <Loader />
      ) : (
        dateList?.map((date, index) => {
          if (index + 1 === Number(dayId)) {
            return (
              <React.Fragment key={index}>
                <ZonalBangladayDate
                  day={index + 1}
                  date={date}
                  totalUnsubmitted={totalUnsubmit}
                  totalSubmitted={totalSubmit}
                />
                <table
                  className="table table-hover table-bordered table-responsive"
                  border={1}
                >
                  <thead>
                    <tr className="text-center bg-primary ">
                      <th onClick={() => handleSort("branchCode")}>
                        Branch Code
                        {sortConfig.key === "branchCode" &&
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
                      <th colSpan={5} className="text-light">
                        Total
                      </th>
                      {totalData.length
                        ? totalData?.map((value, index) => (
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
                        <td>{branch.submit}</td>
                        <td>{branch.unsubmit}</td>
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

export default AdminBranchDayCount;
