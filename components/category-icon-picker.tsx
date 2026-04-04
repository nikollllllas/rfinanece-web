"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Banknote,
  Car,
  CircleDollarSign,
  HandCoins,
  HeartPulse,
  Home,
  type LucideIcon,
  PiggyBank,
  ShoppingBag,
  Tag,
  UtensilsCrossed,
  Wallet,
} from "lucide-react";

interface CategoryIconPickerProps {
  icon: string;
  onIconChange: (icon: string) => void;
  disabled?: boolean;
}

const RECOMMENDED_ICONS: Array<{ name: string; icon: LucideIcon }> = [
  { name: "Wallet", icon: Wallet },
  { name: "CircleDollarSign", icon: CircleDollarSign },
  { name: "Banknote", icon: Banknote },
  { name: "HandCoins", icon: HandCoins },
  { name: "PiggyBank", icon: PiggyBank },
  { name: "ShoppingBag", icon: ShoppingBag },
  { name: "Home", icon: Home },
  { name: "Car", icon: Car },
  { name: "UtensilsCrossed", icon: UtensilsCrossed },
  { name: "HeartPulse", icon: HeartPulse },
  { name: "Tag", icon: Tag },
];

const ICONS_BY_NAME: Record<string, LucideIcon> = RECOMMENDED_ICONS.reduce(
  (acc, item) => {
    acc[item.name] = item.icon;
    return acc;
  },
  {} as Record<string, LucideIcon>
);

export function CategoryIconPicker({
  icon,
  onIconChange,
  disabled = false,
}: CategoryIconPickerProps) {
  const SelectedIcon = ICONS_BY_NAME[icon] ?? null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Input
          id="icon"
          name="icon"
          placeholder="Nome do ícone (ex: Wallet, ShoppingBag)"
          value={icon}
          onChange={(event) => onIconChange(event.target.value)}
          disabled={disabled}
        />
        <div className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-muted/30">
          {SelectedIcon ? (
            <SelectedIcon className="h-4 w-4 text-foreground" />
          ) : (
            <span className="text-xs text-muted-foreground">?</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
        {RECOMMENDED_ICONS.map((iconOption) => {
          const IconComponent = iconOption.icon;
          const isActive = iconOption.name === icon;

          return (
            <button
              key={iconOption.name}
              type="button"
              disabled={disabled}
              onClick={() => onIconChange(iconOption.name)}
              className={cn(
                "flex h-11 flex-col items-center justify-center rounded-md border border-border text-xs transition hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
                isActive && "border-primary bg-primary/10 text-primary"
              )}
              aria-label={`Selecionar ícone ${iconOption.name}`}
            >
              <IconComponent className="h-4 w-4" />
            </button>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground">
        Sugestões com ícones Lucide. Você também pode digitar manualmente.
      </p>
    </div>
  );
}
