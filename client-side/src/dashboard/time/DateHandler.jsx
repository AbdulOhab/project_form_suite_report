
function DateHandler({startDadeline}) {
   
        // Convert startDadeline to a Date object
        const date = new Date(startDadeline);
    
        // Function to convert English digits to Bengali digits
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
            .toString()
            .split("")
            .map((digit) => bengaliNumbers[digit] || digit)
            .join("");
        };
    
        // Function to get Bengali month name
        const getBengaliMonth = (monthIndex) => {
          const bengaliMonths = [
            "জানুয়ারি",
            "ফেব্রুয়ারি",
            "মার্চ",
            "এপ্রিল",
            "মে",
            "জুন",
            "জুলাই",
            "আগস্ট",
            "সেপ্টেম্বর",
            "অক্টোবর",
            "নভেম্বর",
            "ডিসেম্বর",
          ];
          return bengaliMonths[monthIndex];
        };
    
        // Function to convert Date object to Bengali date string
        const convertDateToBengaliString = (date) => {
          const day = convertToBengaliNumber(date.getDate());
          const month = getBengaliMonth(date.getMonth());
          const year = convertToBengaliNumber(date.getFullYear());
          return `${day}-${month}-${year}`;
        };
    
        // Get the Bengali date string
        const formattedDate = convertDateToBengaliString(date);
    
        return formattedDate;
   
 
}

export default DateHandler
