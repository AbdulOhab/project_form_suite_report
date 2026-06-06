import React, { useEffect, useState } from "react";
import DateDifferenceComponent from "./DateDifferenceComponent";
function TimeDifference({ notice }) {
  const [noticeData, setNoticeData] = useState();
  useEffect(() => {
    setNoticeData(notice);
  }, [notice]);

  let { timeStart, timeEnd, endDadeline, startDadeline, range } =
    noticeData || {};

  return (
    <DateDifferenceComponent
      startDadeline={startDadeline}
      endDadeline={endDadeline}
      range={range}
      timeStart={timeStart}
      timeEnd={timeEnd}
    />
  );
}

export default TimeDifference;
