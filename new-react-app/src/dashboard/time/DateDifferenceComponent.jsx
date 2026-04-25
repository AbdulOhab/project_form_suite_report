import React, { useEffect, useState } from "react";
import BangladayDate from "./BangladayDate";
import moment from "moment";

function DateDifferenceComponent({
  startDadeline,
  range,
  timeStart,
  timeEnd,
  endDadeline,
}) {
  const [currentDay, setCurrentDay] = useState(null);
  const [checkDate, setCheckDate] = useState(null);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [days, setDays] = useState(0);
  const [formDisabled, setFormDisabled] = useState(false);
  const [dayDifference, setDayDifference] = useState(null);
  const [difference, setDifference] = useState(null);

  const convertToBengaliDigits = (number) => {
    const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
    return number
      .toString()
      .split("")
      .map((digit) => bengaliDigits[digit] || digit)
      .join("");
  };
  useEffect(() => {
    const interval = setInterval(() => {
      // Combine the date and time into a single Date object
      const deadline = new Date(`${startDadeline} ${timeStart}`);

      const now = new Date(); // Current date and time

      // Calculate the difference in milliseconds
      const diffMs = deadline - now;
      if (diffMs > 0) {
        const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );

        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
        const daysBn = convertToBengaliDigits(days);
        const hoursBn = convertToBengaliDigits(hours);
        const minutesBn = convertToBengaliDigits(minutes);
        const secondsBn = convertToBengaliDigits(seconds);

        setDays(daysBn);
        setHours(hoursBn);
        setMinutes(minutesBn);
        setSeconds(secondsBn);
      }
    }, [1000]);
    return () => clearInterval(interval);
  }, [timeStart, startDadeline]);

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

    const checkDateStatus = (startDeadline, range) => {
      const startDate = new Date(startDeadline);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + range - 1);

      const today = new Date();
      // today.setHours(0, 0, 0, 0);

      if (today < startDate) {
        return 1;
      } else if (today >= startDate && today <= endDate) {
        return 0;
      } else {
        return -1;
      }
    };

    const findCurrentDay = (dates) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayIndex = dates.findIndex((date) => {
        const dateWithoutTime = new Date(date);
        dateWithoutTime.setHours(0, 0, 0, 0);
        return dateWithoutTime.getTime() === today.getTime();
      });
      return todayIndex !== -1
        ? { day: todayIndex + 1, date: dates[todayIndex].toDateString() }
        : null;
    };

    if (startDadeline && range) {
      const dates = generateDateList(startDadeline, range);
      const currentDayInfo = findCurrentDay(dates);
      setCurrentDay(currentDayInfo);
    }
    if (startDadeline) {
      setCheckDate(checkDateStatus(startDadeline, range));
    }
  }, [startDadeline, range]);

  useEffect(() => {
    const interval = setInterval(() => {
      const todayStartTime = moment().format("YYYY-MM-DD") + " " + timeStart;
      const todayEndTime = moment().format("YYYY-MM-DD") + " " + timeEnd;

      const now = moment();
      const startTime = moment(todayStartTime);
      const endTime = moment(todayEndTime);

      // If current time is before start time, calculate countdown to start time
      if (now.isBefore(startTime)) {
        const TimeDifference = moment.duration(startTime.diff(now));
        const hours = Math.floor(TimeDifference.asHours());
        const minutes = Math.floor(TimeDifference.asMinutes()) % 60;
        const seconds = Math.floor(TimeDifference.asSeconds()) % 60;

        const hoursBn = convertToBengaliDigits(hours);
        const minutesBn = convertToBengaliDigits(minutes);
        const secondsBn = convertToBengaliDigits(seconds);
        setHours(hoursBn);
        setMinutes(minutesBn);
        setSeconds(secondsBn);

        setFormDisabled(true);
      }
      // If current time is between start and end time, calculate countdown to end time
      else if (now.isBetween(startTime, endTime)) {
        const TimeDifference = moment.duration(endTime.diff(now));
        const hours = Math.floor(TimeDifference.asHours());
        const minutes = Math.floor(TimeDifference.asMinutes()) % 60;
        const seconds = Math.floor(TimeDifference.asSeconds()) % 60;

        const hoursBn = convertToBengaliDigits(hours);
        const minutesBn = convertToBengaliDigits(minutes);
        const secondsBn = convertToBengaliDigits(seconds);
        setHours(hoursBn);
        setMinutes(minutesBn);
        setSeconds(secondsBn);
        setFormDisabled(false);
      }
      // If current time is after end time, set time remaining to 0
      else {
        clearInterval(interval);
        setHours(0);
        setMinutes(0);
        setSeconds(0);
        setDays(0);
        setFormDisabled(true);
      }
    });

    // Clean up timerInterval on component unmount
    return () => clearInterval(interval);
  }, [timeStart, timeEnd]);

  useEffect(() => {
    const endDate = new Date(endDadeline);
    const startDate = new Date(startDadeline);
    const today = new Date();

    // Calculate the difference in time (in milliseconds)
    const timeDiff = endDate - today;
    const todayDiff = endDate - startDate;

    // Convert the time difference to days
    const diffInDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    const toDayDiff = Math.ceil(todayDiff / (1000 * 60 * 60 * 24));

    setDifference(diffInDays);
    setDayDifference(toDayDiff);
  }, [endDadeline, startDadeline]);

  return (
    <>
      {currentDay && checkDate === 0 ? (
        <>
          <BangladayDate day={currentDay.day} date={currentDay.date} />
          {difference >= 0 && dayDifference > 0 && seconds !== 0 ? (
            <>
              <div>
                {formDisabled ? (
                  <h6 className="text-success text-center fw-bold">
                    রিপোর্ট প্রদান শুরু হতে বাকী আছে
                  </h6>
                ) : (
                  <h6 className="text-success text-center fw-bold">
                    রিপোর্ট সাবমিটের সময় বাকী আছে
                  </h6>
                )}
              </div>
              <div
                className={`${
                  formDisabled
                    ? "bg-danger text-light fw-bold"
                    : "bg-success text-light fw-bold"
                } text-center  p-2 rounded my-2 `}
              >
                <span>{hours}</span> <span>ঘন্টা</span>
                <span>&nbsp;{minutes}</span> <span>মিনিট</span>
                <span>&nbsp;{seconds}</span> <span>সেকেন্ড</span>
              </div>
            </>
          ) : (
            ""
          )}
        </>
      ) : checkDate === 1 ? (
        <div className="text-center">
          <h5 className="shadow p-1 rounded text-success">
            রিপোর্ট প্রদান শুরু হতে বাকি আছে
          </h5>
          <div className="bg-danger text-light shadow p-2 rounded">
            <span>{days} দিন</span> &nbsp;
            <span>{hours}</span> <span>ঘন্টা</span> &nbsp;
            <span>{minutes}</span> <span> মিনিট</span> &nbsp;
            <span>{seconds}</span> <span>সেকেন্ড</span>
          </div>
        </div>
      ) : (
        ""
      )}
    </>
  );
}

export default DateDifferenceComponent;
