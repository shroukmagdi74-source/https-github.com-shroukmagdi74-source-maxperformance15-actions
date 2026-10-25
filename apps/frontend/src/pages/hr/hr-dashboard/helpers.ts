export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

export const getErrorMessage = (error: unknown, fallbackMessage: string): string => {
  if (
    isRecord(error) &&
    "response" in error &&
    isRecord(error.response) &&
    "data" in error.response &&
    isRecord(error.response.data)
  ) {
    if (typeof error.response.data.message === "string") {
      return error.response.data.message;
    }

    if (typeof error.response.data.error === "string") {
      return error.response.data.error;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallbackMessage;
};
