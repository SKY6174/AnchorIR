export const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

export const isTimeOverlapping = (
  newStart: string,
  newEnd: string,
  existStart: string,
  existEnd: string
): boolean => {
  const parseTimeToMinutes = (time: string) => {
    const parts = time.split(":");
    return parseInt(parts[0], 10) * 60 + parseInt(parts[1] || "0", 10);
  };

  const newStartMinutes = parseTimeToMinutes(newStart);
  const newEndMinutes = parseTimeToMinutes(newEnd);
  const existingStartMinutes = parseTimeToMinutes(existStart);
  const existingEndMinutes = parseTimeToMinutes(existEnd);

  return newStartMinutes < existingEndMinutes &&
    newEndMinutes > existingStartMinutes;
};
