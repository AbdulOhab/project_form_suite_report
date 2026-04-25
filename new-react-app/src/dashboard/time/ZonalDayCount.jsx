import React, { useEffect, useState, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import ZonalBangladayDate from "./ZonalBangladayDate";
import Loader from "./Loader";

function ZonalDayCount({
  startDadeline,
  range,
  questions,
  branchReport,
  totalData,
}) {
  const { dayId, noticeId } = useParams();

  const [dateList, setDateList] = useState([]);
  const [countUnSubmit, setCountUnSubmit] = useState();
  const [countSubmit, setCountSubmit] = useState();
  const [branchData, setBranchData] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });

  useEffect(() => {
    let count = 0;
    let thanaLength = 0;
    branchReport?.forEach((branch) => {
      if (branch?.tempThana && Array.isArray(branch?.tempThana)) {
        thanaLength += branch?.tempThana?.length;
        branch?.tempThana.forEach((thana) => {
          if (thana?.answer?.length === 0) {
            count += 1;
          }
        });
      }
    });
    setCountUnSubmit(count);
    setCountSubmit(thanaLength - count);
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

  useEffect(() => {
    let tempData = branchReport?.map((branch) => {
      let sums = {};
      branch.tempThana.forEach((thana) => {
        thana?.answer?.forEach((ans) => {
          ans?.answers?.forEach((data) => {
            let questionText = data?.questionText;
            if (data?.questionType === "number") {
              let value = Number(data?.data);
              if (!sums[questionText]) {
                sums[questionText] = 0;
              }
              sums[questionText] += value;
            }
          });
        });
      });
      return { ...branch, sums };
    });
    setBranchData(tempData);
  }, [branchReport]);

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
        let aValue = a[sortConfig.key] || a.sums[sortConfig.key];
        let bValue = b[sortConfig.key] || b.sums[sortConfig.key];

        if (!isNaN(aValue) && !isNaN(bValue)) {
          return sortConfig.direction === "ascending"
            ? aValue - bValue
            : bValue - aValue;
        }

        if (aValue < bValue) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableData;
  }, [branchData, sortConfig]);

 

  return (
    <>
      {!dateList?.length ? (
        <Loader/>
      ) : (
        dateList?.map((date, index) => {
          if (index + 1 === Number(dayId)) {
            return (
              <React.Fragment key={index}>
                <ZonalBangladayDate
                  day={index + 1}
                  date={date}
                  dataUnSubmit={countUnSubmit}
                  dataSubmit={countSubmit}
                />
                <table
                  className="table table-striped table-hover table-bordered table-sm table-responsive-sm"
                  border={1}
                >
                  <thead>
                    <tr className="text-center bg-primary">
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
                      {questions?.map((question, index) => (
                        <th
                          key={index}
                          onClick={() => handleSort(question.questionText)}
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
                    <tr className="text-center bg-info fs-5">
                      <th className="text-danger"></th>
                      <th className="text-danger">Total</th>
                      {totalData?.map((total, totalIndex) => (
                        <th className="text-danger" key={totalIndex}>
                          {total[totalIndex]}
                        </th>
                      ))}
                      <th className="text-danger">
                        <i className="fa fa-lock" aria-hidden="true"></i>
                      </th>
                    </tr>
                  </tbody>
                  <tbody>
                    {sortedData.map((branch, branchIndex) => (
                      <tr key={branchIndex} className="text-center">
                        <td>{branch.branchCode}</td>
                        <td>{branch.userName}</td>
                        {questions?.map((question, qIndex) => (
                          <td key={`${branchIndex}-${qIndex}`}>
                            {branch.sums[question.questionText]}
                          </td>
                        ))}
                        <td>
                          <Link
                            to={`/dashboard/zonal-data-perDayCount/${dayId}/${branch?.branchCode}/${noticeId}`}
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

export default ZonalDayCount;
