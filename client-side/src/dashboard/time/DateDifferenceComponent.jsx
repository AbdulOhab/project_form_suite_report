import React, { useEffect, useState } from "react";
import { Box, Typography, Chip } from "@mui/material";
import BangladayDate from "./BangladayDate";
import moment from "moment";
import AccessAlarmIcon from "@mui/icons-material/AccessAlarm";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

const TimeBlock = ({ value, label }) => (
  <Box
    sx={{
      bgcolor: "rgba(255,255,255,0.18)",
      borderRadius: 1.5,
      px: { xs: 1, sm: 1.5 },
      py: 0.8,
      minWidth: { xs: 40, sm: 50 },
      textAlign: "center",
    }}
  >
    <Typography
      variant="h6"
      fontWeight="bold"
      color="white"
      sx={{ lineHeight: 1.2, fontSize: { xs: "1rem", sm: "1.25rem" } }}
    >
      {value}
    </Typography>
    <Typography color="rgba(255,255,255,0.85)" sx={{ fontSize: "0.62rem", display: "block" }}>
      {label}
    </Typography>
  </Box>
);

const Colon = () => (
  <Typography
    variant="h6"
    color="rgba(255,255,255,0.5)"
    sx={{ alignSelf: "flex-start", pt: 0.6, mx: 0.2 }}
  >
    :
  </Typography>
);

const CountdownBar = ({ color, units }) => (
  <Box
    sx={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      gap: 0.3,
      bgcolor: color,
      borderRadius: 2,
      px: 1.5,
      py: 1,
    }}
  >
    {units.map((u, i) => (
      <React.Fragment key={u.label}>
        <TimeBlock value={u.value} label={u.label} />
        {i < units.length - 1 && <Colon />}
      </React.Fragment>
    ))}
  </Box>
);

const toBn = (number) => {
  const d = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return number.toString().split("").map((ch) => d[ch] ?? ch).join("");
};

function DateDifferenceComponent({ startDadeline, range, timeStart, timeEnd, endDadeline }) {
  const [currentDay, setCurrentDay] = useState(null);
  const [checkDate, setCheckDate] = useState(null);
  const [dayDifference, setDayDifference] = useState(null);
  const [difference, setDifference] = useState(null);

  // State for "countdown to start date" (checkDate === 1)
  const [startDays, setStartDays] = useState(0);
  const [startHours, setStartHours] = useState(0);
  const [startMinutes, setStartMinutes] = useState(0);

  // State for "today's time-window countdown" (checkDate === 0)
  const [windowHours, setWindowHours] = useState(0);
  const [windowMinutes, setWindowMinutes] = useState(0);
  const [formDisabled, setFormDisabled] = useState(false);
  const [windowSeconds, setWindowSeconds] = useState(0);

  // Countdown to absolute start date+time (used when checkDate === 1)
  useEffect(() => {
    const interval = setInterval(() => {
      const deadline = new Date(`${startDadeline} ${timeStart}`);
      const diffMs = deadline - new Date();
      if (diffMs > 0) {
        setStartDays(toBn(Math.floor(diffMs / (1000 * 60 * 60 * 24))));
        setStartHours(toBn(Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))));
        setStartMinutes(toBn(Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [timeStart, startDadeline]);

  // Today's submission window countdown (used when checkDate === 0)
  useEffect(() => {
    const interval = setInterval(() => {
      const todayStart = moment().format("YYYY-MM-DD") + " " + timeStart;
      const todayEnd = moment().format("YYYY-MM-DD") + " " + timeEnd;
      const now = moment();
      const start = moment(todayStart);
      const end = moment(todayEnd);

      if (now.isBefore(start)) {
        const diff = moment.duration(start.diff(now));
        setWindowHours(toBn(Math.floor(diff.asHours())));
        setWindowMinutes(toBn(Math.floor(diff.asMinutes()) % 60));
        setWindowSeconds(toBn(Math.floor(diff.asSeconds()) % 60));
        setFormDisabled(true);
      } else if (now.isBetween(start, end)) {
        const diff = moment.duration(end.diff(now));
        setWindowHours(toBn(Math.floor(diff.asHours())));
        setWindowMinutes(toBn(Math.floor(diff.asMinutes()) % 60));
        setWindowSeconds(toBn(Math.floor(diff.asSeconds()) % 60));
        setFormDisabled(false);
      } else {
        clearInterval(interval);
        setWindowHours(0); setWindowMinutes(0); setWindowSeconds(0);
        setFormDisabled(true);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [timeStart, timeEnd]);

  // Date range status
  useEffect(() => {
    const checkDateStatus = (startDeadline, r) => {
      const startDate = new Date(startDeadline);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + r - 1);
      const today = new Date();
      if (today < startDate) return 1;
      if (today >= startDate && today <= endDate) return 0;
      return -1;
    };

    const findCurrentDay = (start, r) => {
      const startDate = new Date(start);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      for (let i = 0; i < r; i++) {
        const d = new Date(startDate);
        d.setDate(startDate.getDate() + i);
        d.setHours(0, 0, 0, 0);
        if (d.getTime() === today.getTime()) {
          return { day: i + 1, date: d.toDateString() };
        }
      }
      return null;
    };

    if (startDadeline && range) {
      setCurrentDay(findCurrentDay(startDadeline, range));
      setCheckDate(checkDateStatus(startDadeline, range));
    }
  }, [startDadeline, range]);

  useEffect(() => {
    const endDate = new Date(endDadeline);
    const startDate = new Date(startDadeline);
    const today = new Date();
    setDifference(Math.ceil((endDate - today) / (1000 * 60 * 60 * 24)));
    setDayDifference(Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)));
  }, [endDadeline, startDadeline]);

  // ─── Active today ───
  if (currentDay && checkDate === 0) {
    return (
      <Box>
        <BangladayDate day={currentDay.day} date={currentDay.date} />
        {difference >= 0 && dayDifference > 0 && windowSeconds !== 0 && (
          <Box sx={{ mt: 1 }}>
            <Box sx={{ display: "flex", justifyContent: "center", mb: 1 }}>
              <Chip
                icon={
                  formDisabled
                    ? <AccessAlarmIcon sx={{ fontSize: 16 }} />
                    : <CheckCircleOutlineIcon sx={{ fontSize: 16 }} />
                }
                label={
                  formDisabled
                    ? "রিপোর্ট প্রদান শুরু হতে বাকী আছে"
                    : "রিপোর্ট সাবমিটের সময় বাকী আছে"
                }
                size="small"
                sx={{
                  bgcolor: formDisabled ? "error.50" : "success.50",
                  color: formDisabled ? "error.dark" : "success.dark",
                  border: "1px solid",
                  borderColor: formDisabled ? "error.light" : "success.light",
                  fontWeight: 600,
                  fontSize: "0.75rem",
                }}
              />
            </Box>
            <CountdownBar
              color={formDisabled ? "error.main" : "success.main"}
              units={[
                { value: windowHours, label: "ঘণ্টা" },
                { value: windowMinutes, label: "মিনিট" },
              ]}
            />
          </Box>
        )}
      </Box>
    );
  }

  // ─── Not started yet ───
  if (checkDate === 1) {
    return (
      <Box sx={{ textAlign: "center" }}>
        <Box sx={{ display: "flex", justifyContent: "center", mb: 1 }}>
          <Chip
            icon={<AccessAlarmIcon sx={{ fontSize: 16 }} />}
            label="রিপোর্ট প্রদান শুরু হতে বাকি আছে"
            size="small"
            sx={{
              bgcolor: "success.50",
              color: "success.dark",
              border: "1px solid",
              borderColor: "success.light",
              fontWeight: 600,
              fontSize: "0.75rem",
            }}
          />
        </Box>
        <CountdownBar
          color="error.main"
          units={[
            { value: startDays, label: "দিন" },
            { value: startHours, label: "ঘণ্টা" },
            { value: startMinutes, label: "মিনিট" },
          ]}
        />
      </Box>
    );
  }

  return null;
}

export default DateDifferenceComponent;
