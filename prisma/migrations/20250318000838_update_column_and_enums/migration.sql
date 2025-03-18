/*
  Warnings:

  - The values [DAILY,WEEKLY,MONTHLY,QUARTERLY,YEARLY,CUSTOM] on the enum `BudgetPeriod` will be removed. If these variants are still used in the database, this will fail.
  - The values [INCOME,EXPENSE,BOTH] on the enum `CategoryType` will be removed. If these variants are still used in the database, this will fail.
  - The values [INCOME,EXPENSE] on the enum `TransactionType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "BudgetPeriod_new" AS ENUM ('DIÁRIO', 'SEMANAL', 'MENSAL', 'QUARTENAL', 'ANUAL', 'PERSONALIZADO');
ALTER TABLE "budgets" ALTER COLUMN "period" TYPE "BudgetPeriod_new" USING ("period"::text::"BudgetPeriod_new");
ALTER TYPE "BudgetPeriod" RENAME TO "BudgetPeriod_old";
ALTER TYPE "BudgetPeriod_new" RENAME TO "BudgetPeriod";
DROP TYPE "BudgetPeriod_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "CategoryType_new" AS ENUM ('GANHO', 'GASTO', 'AMBOS');
ALTER TABLE "categories" ALTER COLUMN "type" TYPE "CategoryType_new" USING ("type"::text::"CategoryType_new");
ALTER TYPE "CategoryType" RENAME TO "CategoryType_old";
ALTER TYPE "CategoryType_new" RENAME TO "CategoryType";
DROP TYPE "CategoryType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "TransactionType_new" AS ENUM ('GANHO', 'GASTO');
ALTER TABLE "transactions" ALTER COLUMN "type" TYPE "TransactionType_new" USING ("type"::text::"TransactionType_new");
ALTER TYPE "TransactionType" RENAME TO "TransactionType_old";
ALTER TYPE "TransactionType_new" RENAME TO "TransactionType";
DROP TYPE "TransactionType_old";
COMMIT;
