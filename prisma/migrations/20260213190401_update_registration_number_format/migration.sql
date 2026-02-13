/*
  Warnings:

  - The `registrationNo` column on the `PPDBEntry` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- First, add new columns as nullable
ALTER TABLE "PPDBEntry" ADD COLUMN "registrationYear" INTEGER;
ALTER TABLE "PPDBEntry" ADD COLUMN "registrationSeq" INTEGER;

-- Create a CTE to calculate the sequential numbers
WITH numbered_entries AS (
  SELECT 
    id,
    EXTRACT(YEAR FROM "createdAt")::INTEGER as year,
    ROW_NUMBER() OVER (
      PARTITION BY EXTRACT(YEAR FROM "createdAt") 
      ORDER BY "createdAt" ASC
    )::INTEGER as seq
  FROM "PPDBEntry"
)
UPDATE "PPDBEntry" p
SET 
  "registrationYear" = ne.year,
  "registrationSeq" = ne.seq,
  "registrationNo" = 'PPDB-' || ne.year || '-' || LPAD(ne.seq::TEXT, 4, '0')
FROM numbered_entries ne
WHERE p.id = ne.id;

-- Make the columns NOT NULL
ALTER TABLE "PPDBEntry" ALTER COLUMN "registrationYear" SET NOT NULL;
ALTER TABLE "PPDBEntry" ALTER COLUMN "registrationSeq" SET NOT NULL;

-- Add foreign keys (they may already exist from previous migrations)
ALTER TABLE "PPDBEntry" ADD CONSTRAINT "PPDBEntry_jurusanId2_fkey" FOREIGN KEY ("jurusanId2") REFERENCES "Jurusan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "PPDBEntry" ADD CONSTRAINT "PPDBEntry_jurusanId3_fkey" FOREIGN KEY ("jurusanId3") REFERENCES "Jurusan"("id") ON DELETE SET NULL ON UPDATE CASCADE;



