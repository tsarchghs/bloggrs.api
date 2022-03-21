-- CreateEnum
CREATE TYPE "posts_status" AS ENUM ('ARCHIVED', 'DRAFT', 'PUBLISHED', 'UNPUBLISHED');

-- CreateEnum
CREATE TYPE "referrals_type" AS ENUM ('BLOG');

-- CreateTable
CREATE TABLE "blogcategories" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "blogcategories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blogcontacts" (
    "id" SERIAL NOT NULL,
    "first_name" VARCHAR(255) NOT NULL,
    "last_name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "BlogId" INTEGER NOT NULL,

    CONSTRAINT "blogcontacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blogpostcategories" (
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "CategoryId" INTEGER NOT NULL,
    "BlogId" INTEGER NOT NULL,

    CONSTRAINT "blogpostcategories_pkey" PRIMARY KEY ("CategoryId","BlogId")
);

-- CreateTable
CREATE TABLE "blogs" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "craftjs_json_state" TEXT,
    "logo_url" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "UserId" INTEGER NOT NULL,
    "BlogCategoryId" INTEGER NOT NULL,

    CONSTRAINT "blogs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blocks" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "isChild" BOOLEAN NOT NULL DEFAULT false,
    "PageId" INTEGER NOT NULL,

    CONSTRAINT "blocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "children" (
    "id" SERIAL NOT NULL,
    "BlockId" INTEGER NOT NULL,

    CONSTRAINT "children_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blockchildrens" (
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "BlockId" INTEGER NOT NULL,
    "ChildrenId" INTEGER NOT NULL,

    CONSTRAINT "blockchildrens_pkey" PRIMARY KEY ("BlockId","ChildrenId")
);

-- CreateTable
CREATE TABLE "blockattributes" (
    "id" SERIAL NOT NULL,
    "type" VARCHAR(255) NOT NULL,
    "key" VARCHAR(255) NOT NULL,
    "value" VARCHAR(255) NOT NULL,
    "BlockId" INTEGER NOT NULL,

    CONSTRAINT "blockattributes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pages" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "craftjs_json_state" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "BlogId" INTEGER NOT NULL,
    "UserId" INTEGER NOT NULL,

    CONSTRAINT "pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "postcategories" (
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "CategoryId" INTEGER NOT NULL,
    "PostId" INTEGER NOT NULL,

    CONSTRAINT "postcategories_pkey" PRIMARY KEY ("CategoryId","PostId")
);

-- CreateTable
CREATE TABLE "postcomments" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "PostId" INTEGER,
    "UserId" INTEGER NOT NULL,

    CONSTRAINT "postcomments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "postlikes" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "PostId" INTEGER,
    "UserId" INTEGER NOT NULL,

    CONSTRAINT "postlikes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "posts" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "html_content" TEXT NOT NULL,
    "status" "posts_status" NOT NULL DEFAULT E'DRAFT',
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "BlogId" INTEGER NOT NULL,
    "UserId" INTEGER NOT NULL,

    CONSTRAINT "posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referrals" (
    "id" SERIAL NOT NULL,
    "type" "referrals_type",
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "BlogId" INTEGER,
    "UserId" INTEGER NOT NULL,

    CONSTRAINT "referrals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "secretkeys" (
    "id" CHAR(36) NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "BlogId" INTEGER NOT NULL,

    CONSTRAINT "secretkeys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "publickeys" (
    "id" CHAR(36) NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "BlogId" INTEGER NOT NULL,

    CONSTRAINT "publickeys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teammembers" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "UserId" INTEGER NOT NULL,
    "BlogId" INTEGER NOT NULL,

    CONSTRAINT "teammembers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "first_name" VARCHAR(255) NOT NULL,
    "last_name" VARCHAR(255) NOT NULL,
    "isGuest" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "blogcategories_name_key" ON "blogcategories"("name");

-- CreateIndex
CREATE INDEX "blogcontacts_BlogId_idx" ON "blogcontacts"("BlogId");

-- CreateIndex
CREATE INDEX "blogpostcategories_BlogId_idx" ON "blogpostcategories"("BlogId");

-- CreateIndex
CREATE UNIQUE INDEX "blogs_slug_key" ON "blogs"("slug");

-- CreateIndex
CREATE INDEX "blogs_BlogCategoryId_idx" ON "blogs"("BlogCategoryId");

-- CreateIndex
CREATE INDEX "blogs_UserId_idx" ON "blogs"("UserId");

-- CreateIndex
CREATE INDEX "blocks_PageId_idx" ON "blocks"("PageId");

-- CreateIndex
CREATE INDEX "children_BlockId_idx" ON "children"("BlockId");

-- CreateIndex
CREATE INDEX "blockchildrens_BlockId_idx" ON "blockchildrens"("BlockId");

-- CreateIndex
CREATE UNIQUE INDEX "blockattributes_id_key_key" ON "blockattributes"("id", "key");

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- CreateIndex
CREATE INDEX "pages_BlogId_idx" ON "pages"("BlogId");

-- CreateIndex
CREATE INDEX "pages_UserId_idx" ON "pages"("UserId");

-- CreateIndex
CREATE INDEX "postcategories_PostId_idx" ON "postcategories"("PostId");

-- CreateIndex
CREATE INDEX "postcomments_PostId_idx" ON "postcomments"("PostId");

-- CreateIndex
CREATE INDEX "postcomments_UserId_idx" ON "postcomments"("UserId");

-- CreateIndex
CREATE INDEX "postlikes_PostId_idx" ON "postlikes"("PostId");

-- CreateIndex
CREATE INDEX "postlikes_UserId_idx" ON "postlikes"("UserId");

-- CreateIndex
CREATE INDEX "posts_BlogId_idx" ON "posts"("BlogId");

-- CreateIndex
CREATE INDEX "posts_UserId_idx" ON "posts"("UserId");

-- CreateIndex
CREATE INDEX "referrals_BlogId_idx" ON "referrals"("BlogId");

-- CreateIndex
CREATE INDEX "referrals_UserId_idx" ON "referrals"("UserId");

-- CreateIndex
CREATE INDEX "secretkeys_BlogId_idx" ON "secretkeys"("BlogId");

-- CreateIndex
CREATE INDEX "publickeys_BlogId_idx" ON "publickeys"("BlogId");

-- CreateIndex
CREATE INDEX "teammembers_BlogId_idx" ON "teammembers"("BlogId");

-- CreateIndex
CREATE INDEX "teammembers_UserId_idx" ON "teammembers"("UserId");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "blogcontacts" ADD CONSTRAINT "blogcontacts_BlogId_fkey" FOREIGN KEY ("BlogId") REFERENCES "blogs"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blogpostcategories" ADD CONSTRAINT "blogpostcategories_BlogId_fkey" FOREIGN KEY ("BlogId") REFERENCES "blogs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blogpostcategories" ADD CONSTRAINT "blogpostcategories_CategoryId_fkey" FOREIGN KEY ("CategoryId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blogs" ADD CONSTRAINT "blogs_BlogCategoryId_fkey" FOREIGN KEY ("BlogCategoryId") REFERENCES "blogcategories"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blogs" ADD CONSTRAINT "blogs_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blocks" ADD CONSTRAINT "blocks_PageId_fkey" FOREIGN KEY ("PageId") REFERENCES "pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "children" ADD CONSTRAINT "children_BlockId_fkey" FOREIGN KEY ("BlockId") REFERENCES "blocks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blockchildrens" ADD CONSTRAINT "blockchildrens_ChildrenId_fkey" FOREIGN KEY ("ChildrenId") REFERENCES "children"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blockchildrens" ADD CONSTRAINT "blockchildrens_BlockId_fkey" FOREIGN KEY ("BlockId") REFERENCES "blocks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blockattributes" ADD CONSTRAINT "blockattributes_BlockId_fkey" FOREIGN KEY ("BlockId") REFERENCES "blocks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pages" ADD CONSTRAINT "pages_BlogId_fkey" FOREIGN KEY ("BlogId") REFERENCES "blogs"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pages" ADD CONSTRAINT "pages_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "postcategories" ADD CONSTRAINT "postcategories_CategoryId_fkey" FOREIGN KEY ("CategoryId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "postcategories" ADD CONSTRAINT "postcategories_PostId_fkey" FOREIGN KEY ("PostId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "postcomments" ADD CONSTRAINT "postcomments_PostId_fkey" FOREIGN KEY ("PostId") REFERENCES "posts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "postcomments" ADD CONSTRAINT "postcomments_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "postlikes" ADD CONSTRAINT "postlikes_PostId_fkey" FOREIGN KEY ("PostId") REFERENCES "posts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "postlikes" ADD CONSTRAINT "postlikes_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_BlogId_fkey" FOREIGN KEY ("BlogId") REFERENCES "blogs"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_BlogId_fkey" FOREIGN KEY ("BlogId") REFERENCES "blogs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "secretkeys" ADD CONSTRAINT "secretkeys_BlogId_fkey" FOREIGN KEY ("BlogId") REFERENCES "blogs"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "publickeys" ADD CONSTRAINT "publickeys_BlogId_fkey" FOREIGN KEY ("BlogId") REFERENCES "blogs"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teammembers" ADD CONSTRAINT "teammembers_BlogId_fkey" FOREIGN KEY ("BlogId") REFERENCES "blogs"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teammembers" ADD CONSTRAINT "teammembers_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE CASCADE;
