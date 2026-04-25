import React, { useEffect, useState, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import Loader from "../../time/Loader";
import BangladayForOnce from "../../time/BangladayForOnce";

function AdminTableDataInterfce({
  startDadeline,
  range,
  totalData,
  questions,
  zonalReport,
}) {
  const { id } = useParams();
  const [dateList, setDateList] = useState([]);
  const [dataListByDate, setDataListByDate] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    key: "date",
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
  // console.log(dateList);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date)) return null;
    return date.toISOString().split("T")[0];
  };

  useEffect(() => {
    const dayData = {};
    const allQuestions = new Set();

    zonalReport?.forEach((zonal) => {
      if (zonal?.tempBranch && Array.isArray(zonal?.tempBranch)) {
        zonal?.tempBranch?.forEach((branch) => {
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
                        const questionText = data?.questionText;
                        allQuestions.add(questionText);

                        let value = 0;
                        if (data?.questionType === "number") {
                          value = Number(data.data);
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
  }, [dateList, zonalReport, questions]);

  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const sortedData = useMemo(() => {
    let sortableData = [...dataListByDate];
    if (sortConfig.key !== null) {
      sortableData.sort((a, b) => {
        if (sortConfig.key === "date") {
          const dateA = new Date(a[sortConfig.key]);
          const dateB = new Date(b[sortConfig.key]);
          return (
            (dateA - dateB) * (sortConfig.direction === "ascending" ? 1 : -1)
          );
        } else {
          if (a[sortConfig.key] < b[sortConfig.key]) {
            return sortConfig.direction === "ascending" ? -1 : 1;
          }
          if (a[sortConfig.key] > b[sortConfig.key]) {
            return sortConfig.direction === "ascending" ? 1 : -1;
          }
          return 0;
        }
      });
    }
    return sortableData;
  }, [dataListByDate, sortConfig]);

  return (
    <React.Fragment>
      {!sortedData.length ? (
        <Loader />
      ) : (
        <table
          className="table table-hover table-responsive table-bordered text-center"
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
                  onClick={() => handleSort(question.questionText)}
                >
                  {question?.questionText}
                  {sortConfig.key === question.questionText &&
                    (sortConfig.direction === "ascending" ? " ▲" : " ▼")}
                </th>
              ))}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr className="text-center bg-primary">
              <th className="text-light fs-6">Total</th>
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
              <th className="text-danger fs-6 disabled">
                <i className="fas fa-lock" aria-hidden="true"></i>
              </th>
            </tr>
          </tbody>
          <tbody className="bg-white">
            {sortedData.map((data, dateIndex) => (
              <tr key={dateIndex} className="text-center">
                <BangladayForOnce day={data.day + 1} date={data.date} />
                {questions.map((question, questionIndex) => (
                  <td key={questionIndex}>{data[question.questionText]}</td>
                ))}
                <td>
                  <Link
                    className="btn btn-success"
                    to={`/dashboard/admin-interface/${dateIndex + 1}/${id}`}
                  >
                    <i className="fa-solid fa-plus" aria-hidden="true"></i>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </React.Fragment>
  );
}

export default AdminTableDataInterfce;
