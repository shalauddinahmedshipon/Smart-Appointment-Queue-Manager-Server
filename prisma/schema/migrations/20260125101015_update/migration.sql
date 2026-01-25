/*
  Warnings:

  - You are about to drop the column `date` on the `Appointment` table. All the data in the column will be lost.
  - You are about to drop the column `endTime` on the `Appointment` table. All the data in the column will be lost.
  - You are about to drop the column `isQueued` on the `Appointment` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `Appointment` table. All the data in the column will be lost.
  - Added the required column `appointmentAt` to the `Appointment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Appointment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Appointment" DROP COLUMN "date",
DROP COLUMN "endTime",
DROP COLUMN "isQueued",
DROP COLUMN "startTime",
ADD COLUMN     "appointmentAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
