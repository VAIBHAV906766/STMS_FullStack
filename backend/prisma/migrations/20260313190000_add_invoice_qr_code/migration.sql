-- AlterTable
ALTER TABLE "invoices" ADD COLUMN "qr_code" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "invoices_qr_code_key" ON "invoices"("qr_code");
