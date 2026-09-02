"use client";

import { useState, useRef, useEffect, useCallback, useId } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import FieldShell from "@/components/ui/FieldShell";

export default function MultiSelectDropdown({
  label,
  options = [],
  selected = [],
  onChange,
  placeholder = "All",
  className,
  containerClassName,
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const generatedId = useId();
  const panelId = `ms-panel-${generatedId}`;

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const handle = (e) => {
      if (ref.current && !ref.current.contains(e.target)) close();
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open, close]);

  const toggle = (value) => {
    if (value === "All") {
      onChange([]);
      return;
    }
    const next = selected.includes(value)
      ? selected.filter((v) => v !== value)
      : [...selected, value];
    onChange(next);
  };

  const isAllSelected = selected.length === 0;

  const triggerText = isAllSelected
    ? placeholder
    : selected.length === 1
      ? options.find((o) => o.value === selected[0])?.label || selected[0]
      : `${selected.length} selected`;

  return (
    <FieldShell label={label} className={containerClassName}>
      <div ref={ref} className="relative">
        <button
          type="button"
          id={generatedId}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((v) => !v)}
          className={cn(
            "h-10 w-full appearance-none rounded-lg border bg-white pl-3 pr-9 text-left text-sm cursor-pointer",
            "transition-colors duration-150",
            "border-ink-100 hover:border-ink-200 focus:border-accent-400 focus:outline-none focus:ring-2 focus:ring-accent-500/20",
            isAllSelected && "text-ink-300",
            !isAllSelected && "text-ink-800",
            className
          )}
        >
          {triggerText}
        </button>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300" />

        {open && (
          <div
            id={panelId}
            role="listbox"
            aria-label={label}
            className="absolute z-50 mt-1 w-full rounded-lg border border-ink-100 bg-white py-1 shadow-lg"
          >
            {options.map((opt) => {
              const isChecked =
                opt.value === "All" ? isAllSelected : selected.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="option"
                  aria-selected={isChecked}
                  onClick={() => toggle(opt.value)}
                  className={cn(
                    "flex w-full items-center gap-2 px-3 py-2 text-sm text-left transition-colors cursor-pointer",
                    isChecked
                      ? "bg-accent-50 text-accent-700"
                      : "text-ink-700 hover:bg-ink-50"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                      isChecked
                        ? "border-accent-500 bg-accent-500"
                        : "border-ink-200 bg-white"
                    )}
                  >
                    {isChecked && <Check className="h-3 w-3 text-white" />}
                  </span>
                  {opt.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </FieldShell>
  );
}
