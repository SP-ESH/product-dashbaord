import axios from "axios";

/**
 * The single error shape the UI is allowed to see.
 * Raw Axios errors never reach components.
 */
export type ApiError = {
  message: string;
  status?: number;
  /** True when the request was aborted by us (stale search, unmount). */
  canceled: boolean;
};

const STATUS_MESSAGES: Record<number, string> = {
  400: "The request was invalid. Please check the values and try again.",
  401: "Your session has expired. Please log in again.",
  403: "You do not have permission to perform this action.",
  404: "We could not find what you were looking for.",
  500: "The server ran into a problem. Please try again shortly.",
};

/** DummyJSON returns `{ message: "..." }` on most errors. */
function messageFromBody(data: unknown): string | undefined {
  if (data && typeof data === "object" && "message" in data) {
    const message = (data as { message: unknown }).message;
    if (typeof message === "string" && message.trim()) return message;
  }
  return undefined;
}

export function normalizeError(error: unknown): ApiError {
  if (axios.isCancel(error)) {
    return { message: "Request canceled", canceled: true };
  }

  if (axios.isAxiosError(error)) {
    const status = error.response?.status;

    if (!error.response) {
      return {
        message: "Network error. Please check your connection and try again.",
        canceled: false,
      };
    }

    return {
      message:
        messageFromBody(error.response.data) ??
        (status ? STATUS_MESSAGES[status] : undefined) ??
        "Something went wrong. Please try again.",
      status,
      canceled: false,
    };
  }

  return { message: "Something went wrong. Please try again.", canceled: false };
}

/** Type guard so `catch (e: unknown)` blocks stay type-safe. */
export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    "canceled" in error
  );
}

export function toApiError(error: unknown): ApiError {
  return isApiError(error) ? error : normalizeError(error);
}
