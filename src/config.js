export const API_URL = "https://api.openparliament.ca";
export const DEFAULT_HEADERS = {
  Accept: "application/json",
  "User-Agent": "albertjvm@gmail.com"
};
export const STALE_TIME = 24 * 60 * 60 * 1000; // 24 hours
export const DEFAULT_QUERY_OPTIONS = {
    staleTime: STALE_TIME
};