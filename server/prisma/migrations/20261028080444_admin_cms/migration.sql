-- CreateEnum
CREATE TYPE "BannerSection" AS ENUM ('HERO', 'EDITORIAL', 'COLOUR');

-- CreateTable
CREATE TABLE "Banner" (
    "id" TEXT NOT NULL,
    "section" "BannerSection" NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "alt" TEXT NOT NULL DEFAULT '',
    "label" TEXT,
    "linkUrl" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Banner_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Banner_section_sortOrder_idx" ON "Banner"("section", "sortOrder");
