import React, { useEffect, useState } from "react";
import { Paper } from "@mui/material";
import DateDifferenceComponent from "./DateDifferenceComponent";
function TimeDifference({ notice }) {
  const [noticeData, setNoticeData] = useState();
  useEffect(() => {
    setNoticeData(notice);
  }, [notice]);

  let { timeStart, timeEnd, endDadeline, startDadeline, range } =
    noticeData || {};

  return (
    <Paper elevation={3} sx={{ p: 1, borderRadius: 1 }}>
      <DateDifferenceComponent
        startDadeline={startDadeline}
        endDadeline={endDadeline}
        range={range}
        timeStart={timeStart}
        timeEnd={timeEnd}
      />
    </Paper>
  );
}

export default TimeDifference;
