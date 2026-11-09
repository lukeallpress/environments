import type { ComponentProps, ReactNode } from "react";

const INPUT_BASE =
  "w-full rounded-md border border-border bg-surface px-3 py-2 text-sm shadow-sm placeholder:text-ink-muted/60 focus:outline-none focus:ring-2 focus:ring-nau-gold focus:border-nau-navy disabled:bg-surface-muted disabled:opacity-70";

type LabelWrapProps = {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
};

export function Field({
  label,
  htmlFor,
  hint,
  error,
  required,
  children,
}: LabelWrapProps) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="block text-sm font-medium text-ink mb-1"
      >
        {label}
        {required && <span className="text-danger ml-0.5">*</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="text-xs text-ink-muted mt-1">{hint}</p>
      )}
      {error && (
        <p className="text-xs text-danger mt-1" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function Input({ className = "", ...props }: ComponentProps<"input">) {
  return <input {...props} className={`${INPUT_BASE} ${className}`} />;
}

export function Textarea({
  className = "",
  rows = 4,
  ...props
}: ComponentProps<"textarea">) {
  return (
    <textarea
      {...props}
      rows={rows}
      className={`${INPUT_BASE} ${className}`}
    />
  );
}

export function Select({
  className = "",
  children,
  ...props
}: ComponentProps<"select">) {
  return (
    <select {...props} className={`${INPUT_BASE} ${className}`}>
      {children}
    </select>
  );
}
