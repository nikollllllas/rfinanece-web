-- AlterTable
ALTER TABLE "budgets" DROP CONSTRAINT IF EXISTS "budgets_categoryId_period_startDate_key";

-- AlterTable
ALTER TABLE "budgets" ADD COLUMN "budgetMonth" TEXT;

-- Migrate existing data: convert startDate to budgetMonth format
UPDATE "budgets" SET "budgetMonth" = TO_CHAR("startDate", 'YYYY-MM') WHERE "budgetMonth" IS NULL;

-- Make budgetMonth NOT NULL after migration
ALTER TABLE "budgets" ALTER COLUMN "budgetMonth" SET NOT NULL;

-- Drop old columns
ALTER TABLE "budgets" DROP COLUMN "period";
ALTER TABLE "budgets" DROP COLUMN "startDate";
ALTER TABLE "budgets" DROP COLUMN "endDate";

-- Create new unique constraint
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_categoryId_budgetMonth_key" UNIQUE ("categoryId", "budgetMonth");

-- Create indexes
CREATE INDEX "budgets_budgetMonth_idx" ON "budgets"("budgetMonth");
