const getExportRuntimeApiBaseUrl = () => {
  if (typeof window === "undefined") {
    return "";
  }

  const config = (
    window as typeof window & {
      __RB_EXPORT_RUNTIME_CONFIG__?: {
        apiBaseUrl?: string;
      };
    }
  ).__RB_EXPORT_RUNTIME_CONFIG__;

  return String(
    config?.apiBaseUrl || ""
  ).trim();
};

const rawApiUrl =
  getExportRuntimeApiBaseUrl() ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

export const API_URL =
  rawApiUrl.replace(/\/$/, "");

export const BACKEND_URL =
  API_URL.replace(/\/api$/, "");

export const apiUrl = (
  path: string
) =>
  `${API_URL}${
    path.startsWith("/")
      ? path
      : `/${path}`
  }`;

export const backendUrl = (
  path: string
) =>
  `${BACKEND_URL}${
    path.startsWith("/")
      ? path
      : `/${path}`
  }`;
