import React from "react";

function BranchBangladayDate({ day, date, dataSubmit, dataUnSubmit }) {
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

  // Function to convert numbers to Bengali digits
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
  }; // Example date string

  const data = new Date(date);
  const banglaFormattedDate = getBanglaFormattedDate(data);
  const currentDayNotice = convertToBengaliNumber(day);
  return (
    <div className="d-flex align-items-center justify-content-between my-3 bg-white">
      <div className=" ">
        <span className="p-2 border border-primary text-success border-2  fw-bold">
          Submited: &nbsp;{dataSubmit}
        </span>
      </div>
      <div className="">
        <h3 className="text-center text-success fw-bold">
          দিন {currentDayNotice}
          {", "}
          {banglaFormattedDate}
        </h3>
      </div>
      <div className="">
        <span className="p-2 border border-primary text-success border-2 fw-bold float-end">
          UnSubmited:&nbsp;{dataUnSubmit}
        </span>
      </div>
    </div>
  );
}

export default BranchBangladayDate;
