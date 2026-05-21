import Link from "next/link";
import type { ComponentProps } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md";

const VARIANT: Record<Variant, string> = {
  primary:
    "bg-nau-navy text-white hover:bg-nau-navy-700 focus:ring-nau-gold",
  secondary:
    "bg-surface text-nau-navy border border-nau-navy/20 hover:bg-nau-navy-50 focus:ring-nau-gold",
  ghost:
    "bg-transparent text-nau-navy hover:bg-nau-navy-50 focus:ring-nau-gold",
  danger:
    "bg-danger text-white hover:bg-red-800 focus:ring-red-300",
};

const SIZE: Record<Size, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2.5 text-sm",
};

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-md font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed";

type BaseProps = { variant?: Variant; size?: Size };

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: BaseProps & ComponentProps<"button">) {
  return (
    <button
      {...props}
      className={`${BASE} ${VARIANT[variant]} ${SIZE[size]} ${className}`}
    />
  );
}

export function LinkButton({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: BaseProps & ComponentProps<typeof Link>) {
  return (
    <Link
      {...props}
      className={`${BASE} ${VARIANT[variant]} ${SIZE[size]} ${className}`}
    />
  );
}
