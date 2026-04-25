import React from 'react'

const TimeStartBangla = ({notice}) => {
    let {timeStart} = notice || {}
    let [hours, minutes] = timeStart?.split(":").map(Number);
   
    // Determine AM/PM and adjust hours to 12-hour format
    let meridiem = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12; // Convert to 12-hour format and handle "0" as "12"
   
    // Convert to Bengali numbers
    const bengaliNumbers = {
        "0": "০", "1": "১", "2": "২", "3": "৩", "4": "৪",
        "5": "৫", "6": "৬", "7": "৭", "8": "৮", "9": "৯"
    };
   
    const convertToBengali = (num) => num.toString().split("").map(digit => bengaliNumbers[digit]).join("");
   
    // Format hours and minutes in Bengali
    let bengaliHours = convertToBengali(hours);
    let bengaliMinutes = convertToBengali(minutes);
   
    // Define Bengali time period (AM/PM)
   //  let bengaliPeriod = meridiem === "PM" ? "বিকাল" : "সকাল";
   
    // Construct the formatted time
    return ` ${bengaliHours} টা ${bengaliMinutes} মিনিট`;
}

export default TimeStartBangla