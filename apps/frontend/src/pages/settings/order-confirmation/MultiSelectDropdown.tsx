import React from "react";
import type { MultiSelectOption } from "./types";

export interface MultiSelectDropdownProps {
  options: MultiSelectOption[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  placeholder: string;
  emptyText: string;
}

export function MultiSelectDropdown({
  options,
  selectedValues,
  onChange,
  placeholder,
  emptyText,
}: MultiSelectDropdownProps) {
  const selectedSet = new Set(selectedValues);
  const selectedLabels = options
    .filter((option) => selectedSet.has(option.value))
    .map((option) => option.label);

  return (
    <details className="relative">
      <summary className="cursor-pointer list-none rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs transition-colors hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900">
        <span className="block truncate font-medium text-slate-900 dark:text-white">
          {selectedLabels.length ? selectedLabels.join("، ") : placeholder}
        </span>
        <span className="mt-1 block font-mono text-[10px] tabular-nums text-slate-500 dark:text-slate-400">
          {selectedLabels.length ? `${selectedLabels.length} اختيار` : "اضغط لاختيار أكثر من عنصر"}
        </span>
      </summary>
      <div className="absolute z-20 mt-1 max-h-60 w-full min-w-[260px] overflow-auto rounded-xl border border-slate-200 bg-white p-2 shadow-lg dark:border-slate-700 dark:bg-slate-900">
        {options.length === 0 ? (
          <div className="px-2 py-3 text-xs text-slate-500 dark:text-slate-400">{emptyText}</div>
        ) : (
          options.map((option) => {
            const checked = selectedSet.has(option.value);
            return (
              <label
                key={option.value}
                className="flex items-start gap-2.5 rounded-lg px-2 py-1.5 text-xs transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => {
                    const next = new Set(selectedValues);
                    if (checked) next.delete(option.value);
                    else next.add(option.value);
                    onChange(Array.from(next));
                  }}
                  className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="min-w-0 flex-1">
                  <span className="block font-medium text-slate-900 dark:text-white">
                    {option.label}
                  </span>
                  {option.description ? (
                    <span className="block text-[11px] text-slate-500 dark:text-slate-400">
                      {option.description}
                    </span>
                  ) : null}
                </span>
              </label>
            );
          })
        )}
      </div>
    </details>
  );
}
