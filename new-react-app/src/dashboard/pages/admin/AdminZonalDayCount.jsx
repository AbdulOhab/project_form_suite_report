import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ZonalBangladayDate from "../../time/ZonalBangladayDate";
import Loader from "../../time/Loader";

function AdminZonalDayCount({
  startDadeline,
  range,
  questions,
  totalData,
  branchData,
  countUnSubmit,
  countSubmit,
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

  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const sortedData = useMemo(() => {
    let sortableData = Array.isArray(branchData) ? [...branchData] : [];

    if (sortConfig.key !== null) {
      sortableData.sort((a, b) => {
        let aValue, bValue;

        // Check if sorting key is a predefined column or dynamic question
        if (
          sortConfig.key === "zonalCode" ||
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
  }, [branchData, sortConfig]);

  return (
    <>
      {!dateList?.length ? (
        <Loader />
      ) : (
        dateList.map((date, index) => {
          if (index + 1 === Number(dayId)) {
            return (
              <React.Fragment key={index}>
                <ZonalBangladayDate
                  day={index + 1}
                  date={date}
                  totalSubmitted={countSubmit}
                  totalUnsubmitted={countUnSubmit}
                />
                <table
                  className="table table-hover table-bordered table-responsive"
                  border={1}
                >
                  <thead>
                    <tr className="text-center bg-light">
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
                      <th></th>
                      <th colSpan={4} className="text-light ">
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
                      <th className="text-light ">
                        <i className="fa fa-lock" aria-hidden="true"></i>
                      </th>
                    </tr>
                  </tbody>
                  <tbody className="bg-white">
                    {sortedData.map((zonal, zonalIndex) => (
                      <tr key={zonalIndex} className="text-center">
                        <td>{zonal.zonalCode}</td>
                        <td>{zonal.userName}</td>
                        <td>{zonal.totalThana}</td>
                        <td>{zonal.thanaAnsSubmit}</td>
                        <td>{zonal.thanaAnsUnsubmit}</td>
                        {questions?.map((question, questionIndex) => (
                          <td key={`${zonalIndex}-${questionIndex}`}>
                            {zonal[question.questionText] || 0}
                          </td>
                        ))}
                        <td>
                          <Link
                            to={`/dashboard/admin-branch-interface/${dayId}/${zonal?.zonalCode}/${noticeId}`}
                            className="btn btn-success"
                          >
                            <i
                              className="fa-solid fa-plus"
                              aria-hidden="true"
                            ></i>
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

export default AdminZonalDayCount;
