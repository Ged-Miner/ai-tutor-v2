-- DropIndex
DROP INDEX "lessons_lessonCode_idx";

-- DropIndex
DROP INDEX "lessons_lessonCode_key";

-- AlterTable
ALTER TABLE "lessons" DROP COLUMN "lessonCode";
