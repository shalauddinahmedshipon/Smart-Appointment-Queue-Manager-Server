/*
  Warnings:

  - A unique constraint covering the columns `[accountId,name]` on the table `Service` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "unique_service_per_account" ON "Service"("accountId", "name");
