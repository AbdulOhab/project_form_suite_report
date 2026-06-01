import React from "react";
import { Box, Typography, Chip } from "@mui/material";

function ZonalBangladayDate({ day, date, totalSubmitted, totalUnsubmitted }) {
  // Mapping for English to Bangla days and months
  const banglaDays = {
    Sun: "রবিবার",
    Mon: "সোমবার",
    Tue: "মঙ্গলবার",
    Wed: "বুধবার",
    Thu: "বৃহস্পতিবার",
    Fri: "শুক্রবার",
    Sat: "শনিবার",
  };

  const banglaMonths = {
    Jan: "জানুয়ারি",
    Feb: "ফেব্রুয়ারি",
    Mar: "মার্চ",
    Apr: "এপ্রিল",
    May: "মে",
    Jun: "জুন",
    Jul: "জুলাই",
    Aug: "আগস্ট",
    Sep: "সেপ্টেম্বর",
    Oct: "অক্টোবর",
    Nov: "নভেম্বর",
    Dec: "ডিসেম্বর",
  };

  const convertToBengaliNumber = (number) => {
    const bengaliNumbers = {
      0: "০",
      1: "১",
      2: "২",
      3: "৩",
      4: "৪",
      5: "৫",
      6: "৬",
      7: "৭",
      8: "৮",
      9: "৯",
    };
    return number
      ?.toString()
      .split("")
      .map((digit) => bengaliNumbers[digit] || digit)
      .join("");
  };

  const getBanglaFormattedDate = (d) => {
    const day = d.toLocaleString("en-US", { weekday: "short" });
    const dateNum = convertToBengaliNumber(d.getDate());
    const month = d.toLocaleString("en-US", { month: "short" });
    const year = convertToBengaliNumber(d.getFullYear());

    const banglaDay = banglaDays[day];
    const banglaMonth = banglaMonths[month];

    return `${banglaDay}, ${dateNum} ${banglaMonth} ${year}`;
  };

  const data = new Date(date);
  const banglaFormattedDate = getBanglaFormattedDate(data);
  const currentDayNotice = convertToBengaliNumber(day);

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        my: 3,
      }}
    >
      <Chip
        label={`Submited: ${totalSubmitted}`}
        variant="outlined"
        sx={{
          p: 1,
          borderColor: "primary.main",
          color: "success.main",
          fontWeight: "bold",
          borderWidth: 2,
        }}
      />
      <Typography
        variant="h6"
        sx={{ textAlign: "center", color: "success.main", fontWeight: "bold" }}
      >
        দিন {currentDayNotice}, {banglaFormattedDate}
      </Typography>
      <Chip
        label={`UnSubmited: ${totalUnsubmitted}`}
        variant="outlined"
        sx={{
          p: 1,
          borderColor: "primary.main",
          color: "success.main",
          fontWeight: "bold",
          borderWidth: 2,
        }}
      />
    </Box>
  );
}

export default ZonalBangladayDate;
