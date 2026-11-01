
const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080";

export const API_BASE_URL = `${API_URL.replace(/\/+$/, "")}/api`;

export function getApiError(error) {
  if (!error.response) {
    return "Cannot connect to the Nexora server. Please check your internet connection or try again later.";
  }

  const data = error.response.data;

  if (typeof data === "string" && data.trim()) {
    return data;
  }

  if (data?.message) {
    return data.message;
  }

  if (data?.detail) {
    return data.detail;
  }

  if (data?.errors && typeof data.errors === "object") {
    return Object.values(data.errors).flat().join(" ");
  }

  if (error.response.status === 400) {
    return "Please check your details and try again.";
  }

  if (error.response.status === 401) {
    return "Your session may have expired. Please sign in again.";
  }

  if (error.response.status === 403) {
    return "You do not have permission to perform this action.";
  }

  if (error.response.status === 409) {
    return "An account with these details may already exist.";
  }

  return "Something went wrong. Please try again.";
}
