import {
  apiUrl,
} from "../../../config/api";

type DownloadSiteExportOptions = {
  siteId: number;
  baseUrl?: string;
  accessToken?: string | null;
};

const getDownloadFilename = (
  contentDisposition: string | null,
  fallback: string
): string => {
  if (!contentDisposition) {
    return fallback;
  }

  const utf8Match =
    contentDisposition.match(
      /filename\*=UTF-8''([^;]+)/i
    );

  if (utf8Match?.[1]) {
    try {
      return decodeURIComponent(
        utf8Match[1]
      );
    } catch {
      return utf8Match[1];
    }
  }

  const normalMatch =
    contentDisposition.match(
      /filename="?([^";]+)"?/i
    );

  return (
    normalMatch?.[1]?.trim() ||
    fallback
  );
};

const readErrorMessage = async (
  response: Response
): Promise<string> => {
  try {
    const data =
      await response.json();

    return (
      data?.message ||
      `Export failed with status ${response.status}`
    );
  } catch {
    return `Export failed with status ${response.status}`;
  }
};

export const downloadSiteExport = async ({
  siteId,
  baseUrl,
  accessToken,
}: DownloadSiteExportOptions): Promise<void> => {
  if (
    !Number.isInteger(siteId) ||
    siteId <= 0
  ) {
    throw new Error(
      "Invalid site identifier."
    );
  }

  const query =
    new URLSearchParams();

  const normalizedBaseUrl =
    String(baseUrl || "").trim();

  if (normalizedBaseUrl) {
    query.set(
      "baseUrl",
      normalizedBaseUrl
    );
  }

  const queryString =
    query.toString();

  const endpoint =
    apiUrl(
      `/sites/${siteId}/export`
    );

  const requestUrl =
    queryString
      ? `${endpoint}?${queryString}`
      : endpoint;

  const response =
    await fetch(
      requestUrl,
      {
        method: "GET",

        headers: {
          Accept:
            "application/zip",

          ...(accessToken
            ? {
                Authorization:
                  `Bearer ${accessToken}`,
              }
            : {}),
        },
      }
    );

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(
        response
      )
    );
  }

  const blob =
    await response.blob();

  if (blob.size === 0) {
    throw new Error(
      "The generated ZIP file is empty."
    );
  }

  const filename =
    getDownloadFilename(
      response.headers.get(
        "content-disposition"
      ),
      `site-${siteId}-static-export.zip`
    );

  const objectUrl =
    URL.createObjectURL(blob);

  const link =
    document.createElement("a");

  link.href = objectUrl;
  link.download = filename;

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(
    objectUrl
  );
};