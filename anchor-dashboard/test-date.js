const isDateInSelectedYear = (dateStr, yearVal) => {
  if (!dateStr) return false;
  const targetYearNum = yearVal === 1 ? 2025 : yearVal === 2 ? 2026 : yearVal === 3 ? 2027 : yearVal === 4 ? 2028 : 2029;
  const start = new Date(`${targetYearNum}-03-01T00:00:00+09:00`);
  const endYear = targetYearNum + 1;
  const isLeap = (endYear % 4 === 0 && endYear % 100 !== 0) || (endYear % 400 === 0);
  const endDay = isLeap ? "29" : "28";
  const end = new Date(`${endYear}-02-${endDay}T23:59:59+09:00`);
  const date = new Date(dateStr);
  return date >= start && date <= end;
};
console.log(isDateInSelectedYear("2026-03-20T05:37:00+00:00", 2));
