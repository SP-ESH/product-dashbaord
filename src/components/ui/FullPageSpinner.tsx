import { Spinner } from "./Spinner";

export function FullPageSpinner({ label = "Loading…" }: { label?: string }) {
  return (
    <div
      role="status"
      className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-slate-500"
    >
      <Spinner className="h-7 w-7" />
      <p className="text-sm">{label}</p>
    </div>
  );
}
