"use client";

/* eslint-disable react-hooks/set-state-in-effect -- The token lives in localStorage, which can only be read in the browser, so the first read has to happen in an effect after hydration. */

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { UNAUTHORIZED_EVENT } from "@/lib/api/client";
import { clearToken, getToken, setToken } from "@/lib/auth/token";

import { login as loginRequest } from "./api";
import type { LoginFormValues, User } from "./types";

const USER_KEY = "pd.user";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthContextValue = {
  status: AuthStatus;
  user: User | null;
  login: (credentials: LoginFormValues) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredUser(): User | null {
  try {
    const raw = window.localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

function writeStoredUser(user: User | null): void {
  try {
    if (user) window.localStorage.setItem(USER_KEY, JSON.stringify(user));
    else window.localStorage.removeItem(USER_KEY);
  } catch {
    // Ignore unavailable storage.
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // Starts as "loading" because the token lives in localStorage, which is only
  // readable in the browser. Guards must wait for this first read to finish.
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<User | null>(null);

  // The Axios interceptor fires this when the API rejects the stored token.
  useEffect(() => {
    const handleUnauthorized = () => {
      writeStoredUser(null);
      setUser(null);
      setStatus("unauthenticated");
    };

    window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
    return () =>
      window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
  }, []);

  useEffect(() => {
    if (getToken()) {
      setUser(readStoredUser());
      setStatus("authenticated");
    } else {
      setStatus("unauthenticated");
    }
  }, []);

  const login = useCallback(async (credentials: LoginFormValues) => {
    const response = await loginRequest(credentials);
    const { accessToken, refreshToken, ...userFields } = response;
    void refreshToken;

    setToken(accessToken);
    writeStoredUser(userFields);
    setUser(userFields);
    setStatus("authenticated");
  }, []);

  const logout = useCallback(() => {
    clearToken();
    writeStoredUser(null);
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  const value = useMemo(
    () => ({ status, user, login, logout }),
    [status, user, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return context;
}
