import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

import { cn } from "@/utils/cn";

const CONTROL_BASE =
  "block w-full rounded-md border-0 bg-white px-3 py-2 text-sm text-slate-900 ring-1 ring-inset " +
  "placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-slate-900 disabled:bg-slate-50 " +
  "disabled:text-slate-500";

function controlClasses(hasError?: boolean, className?: string) {
  return cn(
    CONTROL_BASE,
    hasError ? "ring-red-500 focus:ring-red-500" : "ring-slate-300",
    className,
  );
}

type FieldProps = {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  children: ReactNode;
};

/**
 * Label + control + error message. The error gets an id so the control can
 * point at it with aria-describedby, which is what screen readers announce.
 */
export function Field({ label, htmlFor, error, hint, children }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={htmlFor}
        className="block text-sm font-medium text-slate-700"
      >
        {label}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
      {error && (
        <p id={`${htmlFor}-error`} role="alert" className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

type WithError = { hasError?: boolean };

export function Input({
  hasError,
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & WithError) {
  return <input className={controlClasses(hasError, className)} {...props} />;
}

export function Textarea({
  hasError,
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & WithError) {
  return (
    <textarea className={controlClasses(hasError, className)} {...props} />
  );
}

export function Select({
  hasError,
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & WithError) {
  return (
    <select className={controlClasses(hasError, className)} {...props}>
      {children}
    </select>
  );
}
