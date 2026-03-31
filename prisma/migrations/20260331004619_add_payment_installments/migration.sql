-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('PIX', 'DEBITO', 'CREDITO');

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "installmentCount" INTEGER,
ADD COLUMN     "installmentGroupId" UUID,
ADD COLUMN     "installmentIndex" INTEGER,
ADD COLUMN     "paymentMethod" "PaymentMethod";

-- CreateIndex
CREATE INDEX "transactions_installmentGroupId_idx" ON "transactions"("installmentGroupId");
