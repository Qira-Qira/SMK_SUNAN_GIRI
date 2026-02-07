-- DropForeignKey
ALTER TABLE "AIRecommendationResult" DROP CONSTRAINT "AIRecommendationResult_recommendation1_fkey";

-- DropForeignKey
ALTER TABLE "JobPosting" DROP CONSTRAINT "JobPosting_jurusanId_fkey";

-- DropForeignKey
ALTER TABLE "PPDBEntry" DROP CONSTRAINT "PPDBEntry_jurusanId1_fkey";

-- DropForeignKey
ALTER TABLE "TracerStudy" DROP CONSTRAINT "TracerStudy_jurusanId_fkey";

-- AddForeignKey
ALTER TABLE "PPDBEntry" ADD CONSTRAINT "PPDBEntry_jurusanId1_fkey" FOREIGN KEY ("jurusanId1") REFERENCES "Jurusan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIRecommendationResult" ADD CONSTRAINT "AIRecommendationResult_recommendation1_fkey" FOREIGN KEY ("recommendation1") REFERENCES "Jurusan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TracerStudy" ADD CONSTRAINT "TracerStudy_jurusanId_fkey" FOREIGN KEY ("jurusanId") REFERENCES "Jurusan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobPosting" ADD CONSTRAINT "JobPosting_jurusanId_fkey" FOREIGN KEY ("jurusanId") REFERENCES "Jurusan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
