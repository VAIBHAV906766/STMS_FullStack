-- AlterTable
ALTER TABLE "bookings" ADD COLUMN "owner_id" INTEGER;

-- CreateIndex
CREATE INDEX "bookings_owner_id_idx" ON "bookings"("owner_id");

-- AddForeignKey
ALTER TABLE "bookings"
ADD CONSTRAINT "bookings_owner_id_fkey"
FOREIGN KEY ("owner_id") REFERENCES "users"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
