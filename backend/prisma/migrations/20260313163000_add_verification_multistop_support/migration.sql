-- CreateEnum
CREATE TYPE "SupportQueryStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED');

-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'ADMIN';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "company_address" TEXT,
ADD COLUMN     "company_license_number" TEXT,
ADD COLUMN     "company_name" TEXT,
ADD COLUMN     "owner_verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "verification_requested_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "approved_by_owner_id" INTEGER;

-- CreateTable
CREATE TABLE "delivery_stops" (
    "id" SERIAL NOT NULL,
    "booking_id" INTEGER NOT NULL,
    "stop_order" INTEGER NOT NULL,
    "location" TEXT NOT NULL,
    "notes" TEXT,

    CONSTRAINT "delivery_stops_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "support_queries" (
    "id" SERIAL NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" "SupportQueryStatus" NOT NULL DEFAULT 'OPEN',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "support_queries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "delivery_stops_booking_id_stop_order_idx" ON "delivery_stops"("booking_id", "stop_order");

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_approved_by_owner_id_fkey" FOREIGN KEY ("approved_by_owner_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_stops" ADD CONSTRAINT "delivery_stops_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("booking_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_queries" ADD CONSTRAINT "support_queries_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

