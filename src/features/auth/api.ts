import { apiClient } from "@/lib/api/client";

import type { LoginFormValues, LoginResponse } from "./types";

export async function login(
  credentials: LoginFormValues,
): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>(
    "/auth/login",
    credentials,
  );
  return data;
}
