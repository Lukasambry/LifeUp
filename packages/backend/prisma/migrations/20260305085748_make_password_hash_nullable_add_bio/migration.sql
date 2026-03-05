-- AlterTable
ALTER TABLE "users" ADD COLUMN     "bio" TEXT,
ALTER COLUMN "password_hash" DROP NOT NULL;
