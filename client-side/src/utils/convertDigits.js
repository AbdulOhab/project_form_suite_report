// Normalizes Bengali digits (০-৯) to English digits (0-9) so that
// "number" type answers can always be parsed with Number()/parseInt() for
// sums/totals, regardless of which digits the user typed or pasted.
const BENGALI_TO_ENGLISH_DIGITS = {
  "০": "0",
  "১": "1",
  "২": "2",
  "৩": "3",
  "৪": "4",
  "৫": "5",
  "৬": "6",
  "৭": "7",
  "৮": "8",
  "৯": "9",
};

export const toEnglishDigits = (value) =>
  value
    ?.toString()
    .split("")
    .map((char) => BENGALI_TO_ENGLISH_DIGITS[char] || char)
    .join("") ?? value;
