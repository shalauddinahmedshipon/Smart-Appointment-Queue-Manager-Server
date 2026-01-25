/*
  Warnings:

  - Changed the type of `duration` on the `Service` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `requiredStaffType` on the `Service` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "StaffType" AS ENUM ('DOCTOR', 'CONSULTANT', 'SUPPORT_AGENT');

-- CreateEnum
CREATE TYPE "ServiceDuration" AS ENUM ('MIN_15', 'MIN_30', 'MIN_60');

-- AlterTable
ALTER TABLE "Service" DROP COLUMN "duration",
ADD COLUMN     "duration" "ServiceDuration" NOT NULL,
DROP COLUMN "requiredStaffType",
ADD COLUMN     "requiredStaffType" "StaffType" NOT NULL;
