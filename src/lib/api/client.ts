import axios from "axios";

import { clearToken, getToken } from "@/lib/auth/token";

import { normalizeError } from "./errors";

/** Fired when the API rejects our token; AuthProvider listens for it. */
export const UNAUTHORIZED_EVENT = "pd:unauthorized";

const baseURL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://dummyjson.com";

/** The one Axios instance used by every service module in the app. */
export const apiClient = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
  timeout: 15_000,
});

/** Request interceptor: attach the bearer token when we have one. */
apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Response interceptor: every failure leaves this file as an `ApiError`,
 * so no component ever deals with a raw Axios error object.
 *
 * A 401 on a normal request means the stored token is no longer good, so we
 * drop it and send the user back to /login. The login call itself is excluded:
 * there a 401 just means "wrong credentials" and the form should show it.
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const apiError = normalizeError(error);
    const url = axios.isAxiosError(error) ? error.config?.url ?? "" : "";
    const isLoginRequest = url.includes("/auth/login");

    if (apiError.status === 401 && !isLoginRequest) {
      clearToken();
      // The interceptor lives outside React, so it announces the expiry with a
      // DOM event. AuthProvider listens for it and flips to "unauthenticated",
      // which makes RequireAuth redirect to /login through the Next router.
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
      }
    }

    return Promise.reject(apiError);
  },
);
