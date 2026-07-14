-- Existing S3 objects are intentionally not migrated to Cloudflare R2.
UPDATE "Ingredient"
SET "imageKey" = NULL,
    "imageVersion" = "imageVersion" + 1
WHERE "imageKey" IS NOT NULL;

UPDATE "Recipe"
SET "imageKey" = NULL,
    "imageVersion" = "imageVersion" + 1
WHERE "imageKey" IS NOT NULL;
