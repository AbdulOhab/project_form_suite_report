import React, { useEffect, useState } from "react";
import BranchBangladayDate from "./BranchBangladayDate";
import { useParams } from "react-router-dom";
import Loader from "./Loader";

function ZonalDataPerDayInterface({
  startDadeline,
  range,
  questions,
  thanaReport,
  totalData,
  branchName,
}) {
  const { dayId } = useParams();
 

  const [dateList, setDateList] = useState([]);
  const [countUnSubmit, setCountUnSubmit] = useState(0);
  const [countSubmit, setCountSubmit] = useState(0);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });

  useEffect(() => {
    let count = 0;
    if (Array.isArray(thanaReport)) {
      thanaReport.forEach((ans) => {
        if (ans.answer === null) {
          count = count + 1;
        }
      });
      setCountUnSubmit(count);
      setCountSubmit(thanaReport.length - count);
    }
  }, [thanaReport]);

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

  const sortedData = React.useMemo(() => {
    let sortableData = Array.isArray(thanaReport) ? [...thanaReport] : [];
    if (sortConfig.key !== null) {
      sortableData.sort((a, b) => {
        let aValue, bValue;

        if (sortConfig.key === "thanaCode") {
          aValue = a.thanaCode;
          bValue = b.thanaCode;
        } else if (sortConfig.key === "userName") {
          aValue = a.userName;
          bValue = b.userName;
        } else {
          const aAnswer = a?.answer?.answers?.find(
            (ans) => ans.questionText === sortConfig.key
          );
          const bAnswer = b?.answer?.answers?.find(
            (ans) => ans.questionText === sortConfig.key
          );
          aValue = aAnswer ? aAnswer.data : "";
          bValue = bAnswer ? bAnswer.data : "";
        }

        // If the values are numbers, compare them numerically
        if (!isNaN(aValue) && !isNaN(bValue)) {
          return sortConfig.direction === "ascending"
            ? aValue - bValue
            : bValue - aValue;
        }

        // If the values are not numbers, compare them as strings
        return sortConfig.direction === "ascending"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      });
    }
    return sortableData;
  }, [thanaReport, sortConfig]);

  return (
    <>
      {!dateList?.length ? (
        <Loader />
      ) : (
        dateList.map((date, index) => {
          if (index + 1 === Number(dayId)) {
            return (
              <React.Fragment key={index}>
                <BranchBangladayDate
                  day={index + 1}
                  date={date}
                  dataUnSubmit={countUnSubmit}
                  dataSubmit={countSubmit}
                />
                <h6 className="text-success fw-bold">
                  Branch Name: {branchName?.userName}
                </h6>
                <table
                  className="table table-striped table-hover table-bordered table-responsive"
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
                            (sortConfig.direction === "ascending"
                              ? " ▲"
                              : " ▼")}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="text-center bg-info fs-5">
                      <th className="text-danger"></th>
                      <th className="text-danger">Total</th>
                      {totalData.length
                        ? totalData?.map((value, index) => (
                            <th className="text-danger fs-6" key={index}>
                              {value[index]}
                            </th>
                          ))
                        : questions.map((value, index) => (
                            <th className="text-danger fs-6" key={index}>
                              0
                            </th>
                          ))}
                    </tr>
                  </tbody>
                  <tbody className="bg-white">
                    {sortedData.map((thana, thanaIndex) => (
                      <tr key={thanaIndex} className="text-center">
                        <td>{thana.thanaCode}</td>
                        <td>{thana.userName}</td>
                        {questions?.map((question, qIndex) => {
                          const answer = thana?.answer?.answers?.find(
                            (ans) => ans.questionText === question.questionText
                          );
                          return (
                            <td key={`${thanaIndex}-${qIndex}`}>
                              {answer ? answer.data : ""}
                            </td>
                          );
                        })}
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

export default ZonalDataPerDayInterface;
