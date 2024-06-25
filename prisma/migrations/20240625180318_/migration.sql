/*
  Warnings:

  - The values [USER] on the enum `role` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "role_new" AS ENUM ('SELLER', 'CLIENT');
ALTER TABLE "accounts" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "accounts" ALTER COLUMN "role" TYPE "role_new" USING ("role"::text::"role_new");
ALTER TYPE "role" RENAME TO "role_old";
ALTER TYPE "role_new" RENAME TO "role";
DROP TYPE "role_old";
ALTER TABLE "accounts" ALTER COLUMN "role" SET DEFAULT 'CLIENT';
COMMIT;
