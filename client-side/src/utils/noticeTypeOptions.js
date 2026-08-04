const DAY_WORDS = [
  "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
  "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen",
  "Eighteen", "Nineteen", "Twenty", "Twenty-One", "Twenty-Two", "Twenty-Three",
  "Twenty-Four", "Twenty-Five", "Twenty-Six", "Twenty-Seven", "Twenty-Eight",
  "Twenty-Nine", "Thirty",
];

const NOTICE_TYPE_OPTIONS = DAY_WORDS.map((word, i) => ({
  value: String(i + 1),
  label: `${word} Day${i + 1 > 1 ? "s" : ""}`,
}));

export default NOTICE_TYPE_OPTIONS;
