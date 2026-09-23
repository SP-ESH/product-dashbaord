"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { FullPageSpinner } from "@/components/ui/FullPageSpinner";
import { useAuth } from "@/features/auth/AuthProvider";
import type { LoginFormValues } from "@/features/auth/types";
import { toApiError } from "@/lib/api/errors";

type FormErrors = Partial<Record<keyof LoginFormValues, string>>;

function validate(values: LoginFormValues): FormErrors {
  const errors: FormErrors = {};
  if (!values.username.trim()) errors.username = "Username is required.";
  if (!values.password) errors.password = "Password is required.";
  return errors;
}

export default function LoginPage() {
  const { status, login } = useAuth();
  const router = useRouter();

  const [values, setValues] = useState<LoginFormValues>({
    username: "",
    password: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiErrorMessage, setApiErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Someone already logged in has no business on this page.
  useEffect(() => {
    if (status === "authenticated") router.replace("/products");
  }, [status, router]);

  if (status === "loading" || status === "authenticated") {
    return <FullPageSpinner />;
  }

  function updateField(field: keyof LoginFormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return; // Ignore repeated clicks while a request is open.

    const validationErrors = validate(values);
    setErrors(validationErrors);
    setApiErrorMessage(null);
    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      await login(values);
      router.replace("/products");
    } catch (caught: unknown) {
      setApiErrorMessage(toApiError(caught).message);
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold text-slate-900">
          Product Admin
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Sign in to manage the product catalogue.
        </p>

        <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
          <Field label="Username" htmlFor="username" error={errors.username}>
            <Input
              id="username"
              name="username"
              autoComplete="username"
              autoFocus
              value={values.username}
              hasError={Boolean(errors.username)}
              aria-describedby={errors.username ? "username-error" : undefined}
              onChange={(event) => updateField("username", event.target.value)}
            />
          </Field>

          <Field label="Password" htmlFor="password" error={errors.password}>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={values.password}
              hasError={Boolean(errors.password)}
              aria-describedby={errors.password ? "password-error" : undefined}
              onChange={(event) => updateField("password", event.target.value)}
            />
          </Field>

          {apiErrorMessage && (
            <p
              role="alert"
              className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-inset ring-red-200"
            >
              {apiErrorMessage}
            </p>
          )}

          <Button
            type="submit"
            className="w-full"
            isLoading={isSubmitting}
          >
            {isSubmitting ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        <p className="mt-6 rounded-md bg-slate-100 px-3 py-2 text-xs text-slate-600">
          Demo credentials: <code>emilys</code> / <code>emilyspass</code>
        </p>
      </div>
    </main>
  );
}
