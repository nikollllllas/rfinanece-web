"use client";

import { cn } from "@/lib/utils";

interface CategoryColorPickerProps {
  color: string;
  onColorChange: (color: string) => void;
  disabled?: boolean;
}

const PRESET_COLORS = [
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#84cc16",
  "#10b981",
  "#06b6d4",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#d946ef",
  "#ec4899",
  "#64748b",
];

export function CategoryColorPicker({
  color,
  onColorChange,
  disabled = false,
}: CategoryColorPickerProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div
          className="h-10 w-10 rounded-md border border-border"
          style={{ backgroundColor: color }}
        />
        <input
          id="color"
          name="color"
          type="color"
          value={color}
          onChange={(event) => onColorChange(event.target.value)}
          disabled={disabled}
          className="h-10 w-16 cursor-pointer rounded-md border border-border bg-background p-1 disabled:cursor-not-allowed disabled:opacity-60"
          aria-label="Selecionar cor da categoria"
        />
        <span className="text-sm text-muted-foreground">{color.toUpperCase()}</span>
      </div>
      <div className="grid grid-cols-6 gap-2">
        {PRESET_COLORS.map((presetColor) => (
          <button
            key={presetColor}
            type="button"
            onClick={() => onColorChange(presetColor)}
            disabled={disabled}
            aria-label={`Selecionar cor ${presetColor}`}
            className={cn(
              "h-7 w-7 rounded-full border border-black/10 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
              color.toLowerCase() === presetColor
                ? "ring-2 ring-primary ring-offset-2"
                : "hover:scale-105"
            )}
            style={{ backgroundColor: presetColor }}
          />
        ))}
      </div>
    </div>
  );
}
