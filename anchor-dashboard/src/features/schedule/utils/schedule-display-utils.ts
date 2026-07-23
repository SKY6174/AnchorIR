export const getYoutubeEmbedUrl = (url: string | undefined) => {
  if (!url) return null;
  const trimmed = url.trim();
  let videoId = "";

  if (trimmed.includes("v=")) {
    const parts = trimmed.split("v=");
    if (parts[1]) {
      videoId = parts[1].split("&")[0];
    }
  } else if (trimmed.includes("youtu.be/")) {
    const parts = trimmed.split("youtu.be/");
    if (parts[1]) {
      videoId = parts[1].split("?")[0].split("&")[0];
    }
  } else if (trimmed.includes("embed/")) {
    const parts = trimmed.split("embed/");
    if (parts[1]) {
      videoId = parts[1].split("?")[0];
    }
  }

  if (videoId && videoId.trim().length === 11) {
    return `https://www.youtube.com/embed/${videoId.trim()}`;
  }
  return null;
};

export const getOneHourLater = (timeString: string) => {
  if (!timeString) return "";
  const parts = timeString.split(":");
  if (parts.length < 2) return "";

  const hours = (parseInt(parts[0], 10) + 1) % 24;
  const minutes = parseInt(parts[1], 10);
  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedHours = String(hours).padStart(2, "0");
  return `${formattedHours}:${formattedMinutes}`;
};

export const getDaysInMonth = (year: number, month: number) =>
  new Date(year, month, 0).getDate();

export const getStartDayOfWeek = (year: number, month: number) =>
  new Date(year, month - 1, 1).getDay();
