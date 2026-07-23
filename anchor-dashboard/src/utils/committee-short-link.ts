const HEX_ACCESS_CODE_PATTERN = /^[0-9a-f]+$/i;
const SHORT_ACCESS_CODE_PATTERN = /^[A-Za-z0-9_-]+$/;
const MIN_ACCESS_CODE_BYTES = 16;

const isValidHexAccessCode = (value: string): boolean =>
  value.length >= MIN_ACCESS_CODE_BYTES * 2 &&
  value.length % 2 === 0 &&
  HEX_ACCESS_CODE_PATTERN.test(value);

export const encodeCommitteeAccessCode = (accessCode: string): string => {
  const normalized = accessCode.trim().toLowerCase();
  if (!isValidHexAccessCode(normalized)) return "";

  const binary = (normalized.match(/.{2}/g) || [])
    .map(hexPair => String.fromCharCode(Number.parseInt(hexPair, 16)))
    .join("");

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
};

export const decodeCommitteeAccessCode = (shortCode: string): string => {
  const normalized = shortCode.trim();
  if (!normalized || !SHORT_ACCESS_CODE_PATTERN.test(normalized) || normalized.length % 4 === 1) {
    return "";
  }

  const base64 = normalized
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(Math.ceil(normalized.length / 4) * 4, "=");

  try {
    const binary = atob(base64);
    const accessCode = Array.from(binary, character =>
      character.charCodeAt(0).toString(16).padStart(2, "0")
    ).join("");

    return isValidHexAccessCode(accessCode) ? accessCode : "";
  } catch {
    return "";
  }
};

export const buildCommitteeVotePath = (accessCode: string): string => {
  const shortCode = encodeCommitteeAccessCode(accessCode);
  return shortCode ? `/v/${shortCode}` : "";
};

export const parseCommitteeVotePath = (pathname: string): string => {
  const match = pathname.match(/^\/v\/([^/?#]+)\/?$/);
  if (!match) return "";

  try {
    return decodeCommitteeAccessCode(decodeURIComponent(match[1]));
  } catch {
    return "";
  }
};
