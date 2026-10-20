-- Fix schema drift: the init migration never created these columns/tables,
-- but schema.prisma declares them and the application reads/writes them
-- (e.g. the auth middleware writes users.imageUrl/username on first login).
-- Without this migration, a database built with `prisma migrate deploy`
-- crashes on the first authenticated request.

-- AlterTable
ALTER TABLE "users" ADD COLUMN "imageUrl" TEXT,
ADD COLUMN "username" TEXT;

-- AlterTable
ALTER TABLE "roadmaps" ADD COLUMN "completionPercent" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "currentStep" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "generated_contents" ADD COLUMN "atsScore" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "opportunities" ADD COLUMN "funding" TEXT;

-- AlterTable
ALTER TABLE "progress_logs" ADD COLUMN "xpEarned" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "saved_opportunities" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "opportunityId" TEXT NOT NULL,
    "appliedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'saved',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "saved_opportunities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "achievements" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "category" TEXT NOT NULL,

    CONSTRAINT "achievements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "saved_opportunities_userId_opportunityId_key" ON "saved_opportunities"("userId", "opportunityId");

-- AddForeignKey
ALTER TABLE "saved_opportunities" ADD CONSTRAINT "saved_opportunities_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_opportunities" ADD CONSTRAINT "saved_opportunities_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "opportunities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
