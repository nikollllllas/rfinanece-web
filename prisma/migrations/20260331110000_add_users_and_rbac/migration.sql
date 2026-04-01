-- CreateEnum
DO $$
BEGIN
  CREATE TYPE "Role" AS ENUM ('ADMIN', 'USER');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- CreateTable
CREATE TABLE IF NOT EXISTS "users" (
  "id" UUID NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "role" "Role" NOT NULL DEFAULT 'USER',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");

-- Create legacy user for existing rows
INSERT INTO "users" ("id", "name", "email", "passwordHash", "role", "createdAt", "updatedAt")
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Legacy Admin',
  'admin@legacy.local',
  '$2b$10$6Q4YxCRGqXDJbg3TqjQAVuWwOQwQb2I2PjX2S9nLhQqaNQXkbiP9e',
  'ADMIN',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT ("email") DO NOTHING;

-- Add userId to categories
ALTER TABLE "categories"
ADD COLUMN IF NOT EXISTS "userId" UUID;

UPDATE "categories"
SET "userId" = '00000000-0000-0000-0000-000000000001'
WHERE "userId" IS NULL;

ALTER TABLE "categories"
ALTER COLUMN "userId" SET NOT NULL;

-- Add userId to budgets
ALTER TABLE "budgets"
ADD COLUMN IF NOT EXISTS "userId" UUID;

UPDATE "budgets"
SET "userId" = '00000000-0000-0000-0000-000000000001'
WHERE "userId" IS NULL;

ALTER TABLE "budgets"
ALTER COLUMN "userId" SET NOT NULL;

-- Add userId to transactions
ALTER TABLE "transactions"
ADD COLUMN IF NOT EXISTS "userId" UUID;

UPDATE "transactions"
SET "userId" = '00000000-0000-0000-0000-000000000001'
WHERE "userId" IS NULL;

ALTER TABLE "transactions"
ALTER COLUMN "userId" SET NOT NULL;

-- Update category unique constraint to per-user
ALTER TABLE "categories"
DROP CONSTRAINT IF EXISTS "categories_name_key";
DROP INDEX IF EXISTS "categories_name_key";
CREATE UNIQUE INDEX IF NOT EXISTS "categories_userId_name_key" ON "categories"("userId", "name");
CREATE INDEX IF NOT EXISTS "categories_userId_idx" ON "categories"("userId");

-- Update budget unique constraint to per-user
ALTER TABLE "budgets"
DROP CONSTRAINT IF EXISTS "budgets_categoryId_budgetMonth_key";
DROP INDEX IF EXISTS "budgets_categoryId_budgetMonth_key";
CREATE UNIQUE INDEX IF NOT EXISTS "budgets_userId_categoryId_budgetMonth_key" ON "budgets"("userId", "categoryId", "budgetMonth");
CREATE INDEX IF NOT EXISTS "budgets_userId_idx" ON "budgets"("userId");

-- Add transaction user index
CREATE INDEX IF NOT EXISTS "transactions_userId_idx" ON "transactions"("userId");

-- Foreign keys
ALTER TABLE "categories"
DROP CONSTRAINT IF EXISTS "categories_userId_fkey";
ALTER TABLE "categories"
ADD CONSTRAINT "categories_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "budgets"
DROP CONSTRAINT IF EXISTS "budgets_userId_fkey";
ALTER TABLE "budgets"
ADD CONSTRAINT "budgets_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "transactions"
DROP CONSTRAINT IF EXISTS "transactions_userId_fkey";
ALTER TABLE "transactions"
ADD CONSTRAINT "transactions_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
