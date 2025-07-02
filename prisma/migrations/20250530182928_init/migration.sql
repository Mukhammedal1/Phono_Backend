-- AlterTable
ALTER TABLE "Phone" ADD COLUMN     "districtId" INTEGER,
ADD COLUMN     "regionId" INTEGER;

-- AddForeignKey
ALTER TABLE "Phone" ADD CONSTRAINT "Phone_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Phone" ADD CONSTRAINT "Phone_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "District"("id") ON DELETE SET NULL ON UPDATE CASCADE;
