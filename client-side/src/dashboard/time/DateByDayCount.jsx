import React, { useEffect, useState, useMemo } from "react";
import BangladayDate from "./BangladayDate";
import { Link, useParams } from "react-router-dom";

function DateByDayCount({
  startDadeline,
  range,
  thanaReport = [], // Assume thanaReports is an array
  questions = [],
  totalData = [],
}) {
  const { id } = useParams();
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date)) return null; // Return null if the date is invalid
    return date.toISOString().split("T")[0]; // Extract the date part in YYYY-MM-DD format
  };

  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const sortedData = useMemo(() => {
    if (!dateList.length || !questions.length) return [];

    const dataByDate = dateList.map((date, day) => {
      const formattedDate = formatDate(date);

      const matchingReports = thanaReport.filter((report) => {
        const reportDate = formatDate(report.createdAt);

        return reportDate === formattedDate;
      });

      // Aggregate data for this date
      const dataForDate = {};
      questions.forEach((q) => {
        dataForDate[q.questionText] = matchingReports
          .flatMap((report) =>
            report.answers
              .filter((answer) => answer.questionText === q.questionText)
              .map((answer) => answer.data)
          )
          .join(", ");
      });

      return {
        date: formattedDate,
        day,
        answerId: matchingReports.length ? matchingReports[0]._id : null,
        ...dataForDate,
      };
    });

    return dataByDate;
  }, [dateList, thanaReport, questions]);

  const sortedDataList = useMemo(() => {
    let sortableData = [...sortedData];
    if (sortConfig.key !== null) {
      sortableData.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (sortConfig.key === "date") {
          const aDate = new Date(aValue);
          const bDate = new Date(bValue);
          return sortConfig.direction === "ascending"
            ? aDate - bDate
            : bDate - aDate;
        }

        if (!isNaN(aValue) && !isNaN(bValue)) {
          return sortConfig.direction === "ascending"
            ? aValue - bValue
            : bValue - aValue;
        }

        return sortConfig.direction === "ascending"
          ? String(aValue).localeCompare(String(bValue))
          : String(bValue).localeCompare(String(aValue));
      });
    }
    return sortableData;
  }, [sortedData, sortConfig]);

  return (
    <>
      <table className="table table-hover table-bordered  text-center">
        <thead>
          <tr className="text-capitalize bg-primary">
            <th onClick={() => handleSort("date")}>
              দিন ও তারিখ{" "}
              {sortConfig.key === "date" &&
                (sortConfig.direction === "ascending" ? "▲" : "▼")}
            </th>
            {questions.map((question, index) => (
              <th key={index} onClick={() => handleSort(question.questionText)}>
                {question.questionText}{" "}
                {sortConfig.key === question.questionText &&
                  (sortConfig.direction === "ascending" ? "▲" : "▼")}
              </th>
            ))}
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr className="bg-primary fs-5">
            <th className="text-light">Total</th>

            {totalData?.length ? (
              totalData?.map((sum, sIndex) => (
                <th className="text-light" key={sIndex}>
                  {Object.values(sum)[0]}
                </th>
              ))
            ) : (
              <th className="text-light">0</th>
            )}
            <th className="text-danger">
              <i className="fa fa-lock" aria-hidden="true"></i>
            </th>
          </tr>
          {sortedDataList.map((data, index) => (
            <tr key={index} className="border">
              <td>
                <BangladayDate day={data.day + 1} date={data.date} />
              </td>
              {questions.map((question, qIndex) => (
                <td key={qIndex}>{data[question.questionText]}</td>
              ))}
              <td>
                <Link
                  className={`btn btn-success ${
                    data.answerId ? "active" : "disabled"
                  }`}
                  to={`/dashboard/thana-edit-answer/${id}/${data.answerId}`}
                >
                  <i className="fa fa-edit" aria-hidden="true"></i>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

export default DateByDayCount;
