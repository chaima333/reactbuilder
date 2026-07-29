import type {
  FetchBaseQueryError
} from "@reduxjs/toolkit/query";

type ErrorPayload = {
  message?: string;
  code?: string;
};

const isRecord = (
  value: unknown
): value is Record<string, unknown> =>
  !!value &&
  typeof value === "object" &&
  !Array.isArray(value);

export const getPatternErrorMessage = (
  error: unknown,
  fallback: string
) => {
  if (!error) {
    return fallback;
  }

  if (
    isRecord(error) &&
    "data" in error
  ) {
    const data =
      (error as FetchBaseQueryError).data;

    if (isRecord(data)) {
      const payload =
        data as ErrorPayload;

      return (
        payload.code ||
        payload.message ||
        fallback
      );
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
};
