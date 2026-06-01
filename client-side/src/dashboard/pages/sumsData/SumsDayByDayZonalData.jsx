import { Close } from "@mui/icons-material";
import { Button } from "@mui/material";
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import convertToBengaliNumber from "../../time/NumberConverter";
import DateDifferenceComponent from "../../time/DateDifferenceComponent";
import BASE_URL from "../../../auth/dbUrl";
import BangladayDate from "../../time/BangladayDate";

const SumsDayByDayZonalData = () => {
  const { qId, zId } = useParams();

  const [descriptionAlert, setDescriptionAlert] = useState(false);

  const [tempBranch, setTempBranch] = useState();
  const [notice, setNotice] = useState();
  const [questions, setQuestions] = useState();
  const [totalData, setTotalData] = useState();
  const [dateList, setDateList] = useState([]);
  const [dataListByDate, setDataListByDate] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });

  useEffect(() => {
    const getThanaUsers = async () => {
      try {
        const response = await fetch(
          `${BASE_URL}/sums-day-by-day-zonal-data/${qId}/${zId}`,
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
        // console.log(data);

        if (response.ok) {
          setTempBranch(data.tempBranch);
          setNotice(data.question);
          setQuestions(data.question);

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
  }, [qId, zId]);

  useEffect(() => {
    const dayData = {};
    const allQuestions = new Set();

    tempBranch?.forEach((branch) => {
      branch?.tempThana?.forEach((thana) => {
        // console.log(thana);

        if (thana.answer && Array.isArray(thana.answer)) {
          thana.answer.forEach((ans, i) => {
            dateList.forEach((date) => {
              const formattedDate = formatDate(date);
              // console.log(formatDate(ans.createdAt));
              if (formattedDate === formatDate(ans.createdAt)) {
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
  }, [dateList, tempBranch, questions]);

  useEffect(() => {
    const generateDateList = (start, range) => {
      // console.log(start, range);

      const startDate = new Date(start);
      const dates = [];
      for (let i = 0; i < range; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        dates.push(currentDate);
      }
      return dates;
    };

    if (notice?.startDadeline && notice?.range) {
      const dates = generateDateList(notice?.startDadeline, notice?.range);

      setDateList(dates);
    }
  }, [notice?.startDadeline, notice?.range]);

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

  const validCardData = (endDadeline) => {
    const currentDate = new Date();
    const endDadelineDate = new Date(endDadeline);

    const timeDiff = endDadelineDate - currentDate;
    const diffInDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    return diffInDays;
  };

  // console.log(dataListByDate);

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
                      to={`/dashboard/sums-all-zonal-data/${qId}`}
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
                  {questions?.questions?.map((question, index) => (
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
              </tbody>
              <tbody>
                {dataListByDate?.map((data, index) => (
                  <tr key={index} className="border">
                    <td>
                      <BangladayDate day={data.day + 1} date={data.date} />
                    </td>
                    {questions?.questions?.map((question, qIndex) => (
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
};

export default SumsDayByDayZonalData;
