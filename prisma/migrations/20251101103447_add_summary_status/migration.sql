-- CreateEnum
CREATE TYPE "SummaryStatus" AS ENUM ('NOT_STARTED', 'GENERATING', 'COMPLETED', 'FAILED');

-- AlterTable
ALTER TABLE "lessons" ADD COLUMN     "summaryStatus" "SummaryStatus" NOT NULL DEFAULT 'NOT_STARTED';
