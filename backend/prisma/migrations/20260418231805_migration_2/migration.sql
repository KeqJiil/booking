/*
  Warnings:

  - You are about to drop the column `chatId` on the `ChatUser` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `ChatUser` table. All the data in the column will be lost.
  - You are about to drop the column `typeId` on the `Property` table. All the data in the column will be lost.
  - Added the required column `days` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price_at_moment` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `Chat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `chat_id` to the `ChatUser` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `ChatUser` table without a default value. This is not possible if the table is not empty.
  - Made the column `user_id` on table `Message` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `address` to the `Property` table without a default value. This is not possible if the table is not empty.
  - Added the required column `city` to the `Property` table without a default value. This is not possible if the table is not empty.
  - Added the required column `country` to the `Property` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `Property` table without a default value. This is not possible if the table is not empty.
  - Added the required column `maxGuests` to the `Property` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "LiveStatus" AS ENUM ('DELETED', 'ALIVE');

-- CreateEnum
CREATE TYPE "NotificationTypes" AS ENUM ('BOOKING_REQUEST', 'BOOKING_CONFIRMED', 'BOOKING_REJECTED', 'BOOKING_CANCELLED', 'PAYMENT_SUCCESS', 'PAYMENT_FAILED', 'NEW_MESSAGE', 'REVIEW_RECEIVED', 'SYSTEM_INFO', 'SYSTEM_SECURITY');

-- DropForeignKey
ALTER TABLE "ChatUser" DROP CONSTRAINT "ChatUser_chatId_fkey";

-- DropForeignKey
ALTER TABLE "ChatUser" DROP CONSTRAINT "ChatUser_userId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_chat_id_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Property" DROP CONSTRAINT "Property_host_id_fkey";

-- DropForeignKey
ALTER TABLE "Property" DROP CONSTRAINT "Property_typeId_fkey";

-- DropForeignKey
ALTER TABLE "user_settings" DROP CONSTRAINT "user_settings_userId_fkey";

-- DropIndex
DROP INDEX "Property_typeId_price_host_id_idx";

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "days" INTEGER NOT NULL,
ADD COLUMN     "price_at_moment" DECIMAL(10,2) NOT NULL;

-- AlterTable
ALTER TABLE "Chat" ADD COLUMN     "booking_id" TEXT,
ADD COLUMN     "status" "LiveStatus" NOT NULL;

-- AlterTable
ALTER TABLE "ChatUser" DROP COLUMN "chatId",
DROP COLUMN "userId",
ADD COLUMN     "chat_id" TEXT NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Message" ALTER COLUMN "user_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "Property" DROP COLUMN "typeId",
ADD COLUMN     "address" TEXT NOT NULL,
ADD COLUMN     "city" TEXT NOT NULL,
ADD COLUMN     "country" TEXT NOT NULL,
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "maxGuests" INTEGER NOT NULL,
ADD COLUMN     "status" "LiveStatus" NOT NULL DEFAULT 'ALIVE',
ADD COLUMN     "type_id" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "status" "LiveStatus" NOT NULL DEFAULT 'ALIVE',
ALTER COLUMN "role" SET DEFAULT 'USER';

-- AlterTable
ALTER TABLE "user_settings" ALTER COLUMN "theme" SET DEFAULT 'LIGHT';

-- CreateTable
CREATE TABLE "Image" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "reviewer_id" TEXT NOT NULL,
    "booking_id" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "type" "NotificationTypes" NOT NULL,
    "text" TEXT NOT NULL,
    "payload" JSONB,
    "user_id" TEXT NOT NULL,
    "is_seen" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Review_booking_id_key" ON "Review"("booking_id");

-- CreateIndex
CREATE INDEX "Review_property_id_idx" ON "Review"("property_id");

-- CreateIndex
CREATE INDEX "Booking_start_date_end_date_idx" ON "Booking"("start_date", "end_date");

-- CreateIndex
CREATE INDEX "Property_type_id_price_host_id_country_city_status_idx" ON "Property"("type_id", "price", "host_id", "country", "city", "status");

-- AddForeignKey
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_host_id_fkey" FOREIGN KEY ("host_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "property_type"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "Chat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatUser" ADD CONSTRAINT "ChatUser_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatUser" ADD CONSTRAINT "ChatUser_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "Chat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

