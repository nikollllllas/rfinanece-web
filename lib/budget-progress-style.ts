import { CategoryType } from "@/lib/api-types";

interface BudgetProgressStyle {
  trackClassName: string;
  indicatorClassName: string;
  valueTextClassName: string;
  amountTextClassName: string;
  warningTextClassName: string;
  showOverBudgetWarning: boolean;
}

export function getBudgetProgressStyle(
  categoryType: CategoryType | undefined,
  isOverBudget: boolean,
  fallbackColor?: string
): BudgetProgressStyle {
  const isIncomeCategory = categoryType === "GANHO";

  if (isIncomeCategory) {
    return {
      trackClassName: "bg-green-100",
      indicatorClassName: "bg-green-500",
      valueTextClassName: "text-green-600 font-medium",
      amountTextClassName: "text-green-600 font-medium",
      warningTextClassName: "text-green-600",
      showOverBudgetWarning: false,
    };
  }

  if (isOverBudget) {
    return {
      trackClassName: "bg-red-100",
      indicatorClassName: "bg-red-500",
      valueTextClassName: "text-red-500 font-medium",
      amountTextClassName: "text-red-500 font-medium",
      warningTextClassName: "text-red-500",
      showOverBudgetWarning: true,
    };
  }

  return {
    trackClassName: "bg-gray-100",
    indicatorClassName: fallbackColor || "bg-primary",
    valueTextClassName: "",
    amountTextClassName: "",
    warningTextClassName: "text-muted-foreground",
    showOverBudgetWarning: false,
  };
}
