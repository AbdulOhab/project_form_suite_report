import React, { useMemo, useState } from "react";
import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@mui/material";
import Close from "@mui/icons-material/Close";
import BASE_URL from "../../../auth/dbUrl";
import DateDifferenceComponent from "../../time/DateDifferenceComponent";
import BangladayDate from "../../time/BangladayDate";
import convertToBengaliNumber from "../../time/NumberConverter";

function SumsTotalDayThanaData() {
  const { qId, zId, bId, tId } = useParams();

  const [descriptionAlert, setDescriptionAlert] = useState(false);

  const [answer, setAnswer] = useState();
  const [notice, setNotice] = useState();
  const [totalData, setTotalData] = useState();
  const [dateList, setDateList] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });
  const { questions, startDadeline, range, timeStart, timeEnd, endDadeline } =
    notice || [];

  useEffect(() => {
    const getThanaUsers = async () => {
      try {
        const response = await fetch(
          `${BASE_URL}/sums-Totol-day-thana-data/${qId}/${zId}/${bId}/${tId}`,
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
        // console.log(data);

        if (response.ok) {
          setAnswer(data.answer);
          setNotice(data.question);
          setTotalData(data.sumsArray);
        } else {
          throw new Error("Failed to fetch");
        }
      } catch (error) {
        // Handle error
        console.error("Error fetching notice data:", error);
      }
    };
    getThanaUsers();
  }, [qId, zId, bId, tId]);

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

  const descriptionHandler = () => {
    setDescriptionAlert(true);
  };
  const descriptionCloserHandler = () => {
    setDescriptionAlert(false);
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

      const matchingReports = answer.filter((report) => {
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
  }, [dateList, answer, questions]);

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

  const validCardData = (endDadeline) => {
    const currentDate = new Date();
    const endDadelineDate = new Date(endDadeline);

    const timeDiff = endDadelineDate - currentDate;
    const diffInDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    return diffInDays;
  };

  return (
    <>
      <div className="table-responsive">
        <div className="card border-0 my-1">
          <div className="card-header border-0">
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
                <div className="answerLeft  p-3">
                  <div className="border p-2">
                    {validCardData(endDadeline) < 0 ? (
                      <p className="text-center fs-4 fw-bold text-danger">
                        নোটিশ শেষ হয়েছে{" "}
                        {convertToBengaliNumber(
                          Math.abs(validCardData(endDadeline))
                        )}{" "}
                        দিন আগে
                      </p>
                    ) : (
                      <DateDifferenceComponent
                        startDadeline={startDadeline}
                        range={range}
                        timeStart={timeStart}
                        timeEnd={timeEnd}
                        endDadeline={endDadeline}
                      />
                    )}
                  </div>
                </div>

                <div className="answerMiddle">
                  <p className="text-center fs-2 fw-semibold text-success">
                    {notice?.document_name}
                  </p>
                  {notice?.sub_title && (
                    <p className="text-center fs-6">{notice?.sub_title}</p>
                  )}
                </div>
                <div className="answerRight">
                  <div className="d-flex align-items-end justify-content-center flex-column">
                    {!descriptionAlert && (
                      <Button
                        onClick={descriptionHandler}
                        className="text-center border border-success fw-semibold "
                      >
                        Notice
                      </Button>
                    )}
                    <Link
                      className="button btn btn-success p-2"
                      to={`/dashboard/sums-all-thana-data/${qId}`}
                    >
                      <span>Back</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="card-body shadow my-3 bg-white p-3 rounded">
          <>
            <table className="table table-hover table-bordered  text-center">
              <thead>
                <tr className="text-capitalize bg-primary">
                  <th onClick={() => handleSort("date")}>
                    দিন ও তারিখ{" "}
                    {sortConfig.key === "date" &&
                      (sortConfig.direction === "ascending" ? "▲" : "▼")}
                  </th>
                  {questions?.map((question, index) => (
                    <th
                      key={index}
                      onClick={() => handleSort(question.questionText)}
                    >
                      {question.questionText}{" "}
                      {sortConfig.key === question.questionText &&
                        (sortConfig.direction === "ascending" ? "▲" : "▼")}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="bg-primary fs-5">
                  <th className="text-light">Total</th>

                  {totalData?.length ? (
                    totalData?.map((sum, sIndex) => (
                      <th className="text-light" key={sIndex}>
                        {sum ? sum[sIndex] : 0}
                      </th>
                    ))
                  ) : (
                    <th className="text-light">0</th>
                  )}
                </tr>
                {sortedDataList?.map((data, index) => (
                  <tr key={index} className="border">
                    <td>
                      <BangladayDate day={data.day + 1} date={data.date} />
                    </td>
                    {questions?.map((question, qIndex) => (
                      <td key={qIndex}>
                        {data[question.questionText]
                          ? data[question.questionText]
                          : 0}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        </div>
      </div>
    </>
  );
}

export default SumsTotalDayThanaData;
