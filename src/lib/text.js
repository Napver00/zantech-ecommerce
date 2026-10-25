// Text saved through the admin panel sometimes lost its curly quotes and dashes
// (stored as U+FFFD), and older copy spells the brand "Zantech". Fix both for display.
export const fixText = (text = "") =>
  text
    .replace(/(\d)\uFFFD(\d)/g, "$1–$2")
    .replace(/(\w)\uFFFD(\w)/g, "$1’$2")
    .replace(/\uFFFD/g, "–")
    .replace(/\b(Zan Tech|Zantech)\b(?!BD)/g, "ZAN Tech");
