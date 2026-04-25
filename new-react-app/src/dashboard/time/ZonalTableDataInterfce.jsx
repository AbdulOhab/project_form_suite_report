import React, { useEffect, useState, useMemo } from "react";
import BangladayDate from "./BangladayDate";
import { Link, useParams } from "react-router-dom";
import Loader from "./Loader";

function ZonalTableDataInterfce({
  startDadeline,
  range,
  totalData,
  questions,
  branchReport,
}) {
  
  const { id } = useParams();
  const [dateList, setDateList] = useState([]);
  const [dataListByDate, setDataListByDate] = useState([]);
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date)) return null; // Return null if the date is invalid
    return date.toISOString().split("T")[0]; // Extract the date part in YYYY-MM-DD format
  };

  useEffect(() => {
    const dayData = {};
    const allQuestions = new Set();
    branchReport?.forEach((branch) => {
      if (branch.tempThana && Array.isArray(branch.tempThana)) {
        branch?.tempThana?.forEach((thana) => {
          if (thana.answer && Array.isArray(thana.answer)) {
            thana.answer.forEach((ans) => {
              dateList.forEach((date) => {
                const formattedDate = formatDate(date);
                if (formattedDate === formatDate(ans.updatedAt)) {
                  if (!dayData[formattedDate]) {
                    dayData[formattedDate] = {};
                  }

                  let sums = dayData[formattedDate];
                  ans.answers.forEach((data) => {
                    const questionText = data.questionText;
                    allQuestions.add(questionText);

                    let value = 0;
                    if (data.questionType === "number") {
                      value = Number(data.data);
                    } else {
                      value = 0;
                    }

                    if (!sums[questionText]) {
                      sums[questionText] = 0;
                    }
                    sums[questionText] += value;
                  });
                }
              });
            });
          }
        });
      }
    });

    const sumsArray = dateList.map((date, day) => {
      const formattedDate = formatDate(date);
      const dateData = dayData[formattedDate] || {};
      const result = { date: formattedDate, day };

      allQuestions.forEach((questionText) => {
        result[questionText] = dateData[questionText] || 0;
      });

      return result;
    });

    setDataListByDate(sumsArray);
  }, [dateList, branchReport]);

  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

 

  const sortedDataListByDate = useMemo(() => {
    let sortableData = [...dataListByDate];
    if (sortConfig.key !== null) {
      sortableData.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        // If the values are numbers, compare them numerically
        if (!isNaN(aValue) && !isNaN(bValue)) {
          return sortConfig.direction === "ascending"
            ? aValue - bValue
            : bValue - aValue;
        }

        // If the values are not numbers, compare them as strings
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
  }, [dataListByDate, sortConfig]);
  return (
    <React.Fragment>
      {!sortedDataListByDate?.length ? (
        <Loader />
      ) : (
        <table
          className="table table-hover table-bordered table-sm table-responsive-sm"
          border={1}
        >
          <thead>
            <tr className="bg-primary text-center">
              <th className="text-center" onClick={() => handleSort("date")}>
                দিন ও তারিখ
                {sortConfig.key === "date" &&
                  (sortConfig.direction === "ascending" ? " ▲" : " ▼")}
              </th>

              {questions?.map((question, index) => (
                <th
                  key={index}
                  onClick={() => handleSort(question?.questionText)}
                >
                  {question?.questionText}
                  {sortConfig.key === question?.questionText &&
                    (sortConfig.direction === "ascending" ? " ▲" : " ▼")}
                </th>
              ))}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr className="text-center bg-info fs-5">
              <th className="text-danger">Total</th>
              {totalData?.map((value, index) => (
                <th className="text-danger" key={index}>
                  {value[index]}
                </th>
              ))}
              <th className="text-danger">
                <i className="fa fa-lock" aria-hidden="true"></i>
              </th>
            </tr>
          </tbody>
          <tbody>
            {sortedDataListByDate.map((currentDateData, dateIndex) => {
              return (
                <tr key={dateIndex} className="text-center">
                  <BangladayDate
                    day={currentDateData.day + 1}
                    date={currentDateData.date}
                  />

                  {questions.map((question, questionIndex) => (
                    <td key={questionIndex}>
                      {currentDateData[question.questionText]}
                    </td>
                  ))}
                  <td>
                    <Link
                      className="btn btn-success"
                      to={`/dashboard/zonal-interface/${dateIndex + 1}/${id}`}
                    >
                      <i className="fa-solid fa-plus" aria-hidden="true"></i>
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </React.Fragment>
  );
}

export default ZonalTableDataInterfce;
