-- AlterTable
ALTER TABLE "ai_settings" ADD COLUMN     "streaming" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "reasoning" SET DEFAULT 'minimal';
