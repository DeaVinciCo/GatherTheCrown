-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Hero" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "element" TEXT NOT NULL,
    "bond" REAL NOT NULL DEFAULT 0.5,
    "accountId" TEXT NOT NULL,
    CONSTRAINT "Hero_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Creat" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "species" TEXT NOT NULL,
    "element" TEXT NOT NULL,
    "stage" TEXT NOT NULL,
    "heroId" TEXT NOT NULL,
    CONSTRAINT "Creat_heroId_fkey" FOREIGN KEY ("heroId") REFERENCES "Hero" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InventoryItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "heroId" TEXT NOT NULL,
    CONSTRAINT "InventoryItem_heroId_fkey" FOREIGN KEY ("heroId") REFERENCES "Hero" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CrownFragment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "metal" TEXT NOT NULL,
    "gem" TEXT,
    "shards" INTEGER NOT NULL,
    "heroId" TEXT NOT NULL,
    CONSTRAINT "CrownFragment_heroId_fkey" FOREIGN KEY ("heroId") REFERENCES "Hero" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Progress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "district01" BOOLEAN NOT NULL DEFAULT false,
    "heroId" TEXT NOT NULL,
    CONSTRAINT "Progress_heroId_fkey" FOREIGN KEY ("heroId") REFERENCES "Hero" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MatchHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "result" TEXT NOT NULL,
    "heroId" TEXT NOT NULL,
    CONSTRAINT "MatchHistory_heroId_fkey" FOREIGN KEY ("heroId") REFERENCES "Hero" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Boss" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "element" TEXT NOT NULL,
    "hp" INTEGER NOT NULL,
    "stamina" INTEGER NOT NULL,
    "mana" INTEGER NOT NULL,
    "phases" INTEGER NOT NULL,
    "rageThreshold" REAL NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_email_key" ON "Account"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Creat_heroId_key" ON "Creat"("heroId");

-- CreateIndex
CREATE UNIQUE INDEX "Progress_heroId_key" ON "Progress"("heroId");
