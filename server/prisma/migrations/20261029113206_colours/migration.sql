CREATE TABLE "Colour" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "hex" TEXT NOT NULL,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "Colour_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Colour_slug_key" ON "Colour"("slug");
CREATE UNIQUE INDEX "Colour_name_key" ON "Colour"("name");

-- one Colour per distinct existing colour name (case-insensitive)
INSERT INTO "Colour" ("id", "slug", "name", "hex", "sortOrder")
SELECT 'col_' || substr(md5(random()::text || t.n), 1, 20),
       trim(both '-' from regexp_replace(lower(t.n), '[^a-z0-9]+', '-', 'g')),
       t.n, t.h,
       (row_number() OVER (ORDER BY t.n))::int - 1
FROM (
  SELECT DISTINCT ON (lower("colourName")) "colourName" AS n, "colourHex" AS h
  FROM "Variant" ORDER BY lower("colourName"), "colourName"
) t;

ALTER TABLE "Variant" ADD COLUMN "colourId" TEXT;
UPDATE "Variant" v SET "colourId" = c."id" FROM "Colour" c WHERE lower(v."colourName") = lower(c."name");
ALTER TABLE "Variant" ALTER COLUMN "colourId" SET NOT NULL;

DROP INDEX "Variant_productId_size_colourName_key";
ALTER TABLE "Variant" DROP COLUMN "colourName", DROP COLUMN "colourHex";
CREATE UNIQUE INDEX "Variant_productId_size_colourId_key" ON "Variant"("productId", "size", "colourId");
CREATE INDEX "Variant_colourId_idx" ON "Variant"("colourId");
ALTER TABLE "Variant" ADD CONSTRAINT "Variant_colourId_fkey"
  FOREIGN KEY ("colourId") REFERENCES "Colour"("id") ON DELETE RESTRICT ON UPDATE CASCADE;