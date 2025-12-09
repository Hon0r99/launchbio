-- Create LegacySession table
CREATE TABLE "LegacySession" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LegacySession_pkey" PRIMARY KEY ("id")
);

-- Copy existing Session data to LegacySession
INSERT INTO "LegacySession" ("id", "token", "userId", "createdAt", "expiresAt")
SELECT "id", "token", "userId", "createdAt", "expiresAt"
FROM "Session";

-- Create indexes for LegacySession
CREATE UNIQUE INDEX "LegacySession_token_key" ON "LegacySession"("token");
CREATE INDEX "LegacySession_userId_idx" ON "LegacySession"("userId");
CREATE INDEX "LegacySession_expiresAt_idx" ON "LegacySession"("expiresAt");

-- Drop old Session table
DROP TABLE "Session";

-- Create new Session table for NextAuth
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- Create indexes for new Session
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- Add foreign key constraints
ALTER TABLE "LegacySession" ADD CONSTRAINT "LegacySession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

