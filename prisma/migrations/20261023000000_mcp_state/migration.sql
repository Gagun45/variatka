CREATE TABLE "McpState" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "kind" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "McpState_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "McpState_expiresAt_idx" ON "McpState"("expiresAt");
CREATE INDEX "McpState_userId_kind_idx" ON "McpState"("userId", "kind");