-- CreateEnum
CREATE TYPE "role" AS ENUM ('USER', 'CLIENT');

-- AlterTable
ALTER TABLE "accounts" ADD COLUMN     "role" "role" NOT NULL DEFAULT 'CLIENT';
