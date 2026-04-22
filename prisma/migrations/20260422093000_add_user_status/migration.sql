CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'DISABLED');

ALTER TABLE "User"
ADD COLUMN "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE';

CREATE INDEX "User_status_idx" ON "User"("status");
