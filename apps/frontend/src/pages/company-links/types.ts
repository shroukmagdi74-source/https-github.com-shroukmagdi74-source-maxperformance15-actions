export type CompanyLink = {
  id: string;
  name: string;
  url: string;
  username?: string;
  openMode?: "new_tab" | "in_app";
  hasPassword?: boolean;
};

export type LinkFormState = {
  name: string;
  url: string;
  username: string;
  password: string;
  openMode: "new_tab" | "in_app";
};

export const INITIAL_FORM: LinkFormState = {
  name: "",
  url: "",
  username: "",
  password: "",
  openMode: "new_tab",
};

export const getApiErrorMessage = (error: unknown, fallback: string): string => {
  const message =
    typeof error === "object" && error !== null && "response" in error
      ? (error as { response?: { data?: { message?: string } } }).response?.data
          ?.message
      : undefined;

  if (typeof message === "string" && message.trim()) {
    return message;
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
};
