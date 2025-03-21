-- CreateEnum
CREATE TYPE "TransactionTag" AS ENUM ('FALTA', 'PAGO', 'DEVOLVER', 'ECONOMIA');

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "tag" "TransactionTag";
