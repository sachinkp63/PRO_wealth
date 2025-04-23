/*
  Warnings:

  - You are about to drop the column `satuts` on the `transactions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "transactions" DROP COLUMN "satuts",
ADD COLUMN     "status" "TransactionStatus" NOT NULL DEFAULT 'COMPLETED';
