export const getApiErrorMessage = (error: any) => {
  const message = error?.data?.message || error?.message;

  if (message === "MAX_SITES_LIMIT_REACHED") {
    return "Maximum sites limit reached.";
  }

  if (message === "MAX_PAGES_LIMIT_REACHED") {
    return "Maximum pages limit reached for this site.";
  }

  if (error?.status === 503 || message === "Platform under maintenance") {
    return "Platform under maintenance.";
  }

  return message || "Request failed.";
};
