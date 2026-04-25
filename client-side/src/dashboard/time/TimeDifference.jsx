import React, { useEffect, useState } from "react";
import DateDifferenceComponent from "./DateDifferenceComponent";
function TimeDifference({ notice }) {
  const [noticeData, setNoticeData] = useState();
  useEffect(() => {
    setNoticeData(notice);
  }, [notice]);

  let { timeStart, timeEnd, endDadeline, startDadeline, range } =
    noticeData || {};

  // Compare the formatted date strings

  return (
    <div className="card shadow p-2 rounded">
      <DateDifferenceComponent
        startDadeline={startDadeline}
        endDadeline={endDadeline}
        range={range}
        timeStart={timeStart}
        timeEnd={timeEnd}
      />
    </div>
  );
}

export default TimeDifference;
