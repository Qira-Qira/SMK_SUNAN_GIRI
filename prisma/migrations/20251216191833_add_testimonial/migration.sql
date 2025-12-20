-- CreateTable
CREATE TABLE "Testimonial" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "posisi" TEXT NOT NULL,
    "perusahaan" TEXT NOT NULL,
    "tahunLulus" TEXT NOT NULL,
    "testimoni" TEXT NOT NULL,
    "rating" INTEGER NOT NULL DEFAULT 5,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Testimonial_pkey" PRIMARY KEY ("id")
);
