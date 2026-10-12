-- AlterTable: slug obligatorio. Se rellena provisionalmente con el sku para las filas existentes; el seed lo sobrescribe.
ALTER TABLE "Product" ADD COLUMN "slug" TEXT;
UPDATE "Product" SET "slug" = lower("sku");
ALTER TABLE "Product" ALTER COLUMN "slug" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");
