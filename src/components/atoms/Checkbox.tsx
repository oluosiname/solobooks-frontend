import { cn } from "@/lib/utils";

export interface CheckboxProps {
  checked: boolean;
  onChange?: () => void;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
}

export function Checkbox({
  checked,
  onChange,
  disabled = false,
  className,
  "aria-label": ariaLabel,
}: CheckboxProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={onChange}
      disabled={disabled}
      className={cn(
        "relative inline-flex h-5 w-5 flex-shrink-0 cursor-pointer items-center justify-center rounded border-2 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        checked
          ? "border-indigo-600 bg-indigo-600"
          : "border-slate-300 bg-white",
        className
      )}
    >
      {checked && (
        <svg
          className="h-3.5 w-3.5 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={3}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
      )}
    </button>
  );
}
