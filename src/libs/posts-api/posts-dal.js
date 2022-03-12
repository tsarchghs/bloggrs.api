
const { htmlToText } = require("html-to-text");
const { post } = require(".");
const prisma = require("../../prisma");
const { ErrorHandler } = require("../../utils/error");

module.exports = {
    findByPkOr404: async pk => {
        const post = prisma.posts.findUnique({ 
            where: { id: Number(pk) },
            include: {
                "postcategories": true
            }
        });
        if (!post) throw new ErrorHandler.get404("Post");
        return post;
    },
    findAll: async ({ page = 1, pageSize = 3, categories, UserId }) => {
        const where = {}
        if (categories) {
            // const cast_number = i => Number(i);
            // if (typeof(categories) === "string") {
            //     categories = categories.split(",");
            // } else categories = categories.map(c => c.id)
            // categories = categories.map(cast_number);

            where.postcategories = {
                some: {
                    categories: {
                        slug: {
                            in: categories
                        }
                    }
                }
            }
        }
        // categories = categories.split(",")
        // where 
        // if (query) where[Sequelize.Op.or] = [
        //     { contract_type: { [Sequelize.Op.like]: `%${query}%` } },
        //     { comment: { [Sequelize.Op.like]: `%${query}%` } }
        // ]
        const posts = await prisma.posts.findMany({
            where,
            skip: (page - 1) & page,
            take: pageSize,
        })
        for (let post of posts) {
            const { id: PostId } = post;
            const where = { PostId }
            const likes_count = prisma.postlikes.count({ where });
            const comments_count = prisma.postcomments.count({ where });
            
            post.content_excerpt = htmlToText(post.html_content).replace(/\n/g, "");
            post.meta = {
                likes_count: await likes_count,
                comments_count: await comments_count
            }
            if (UserId) {
                const liked = await prisma.postlikes.count({ 
                    where: {
                        PostId,
                        UserId
                    }
                })
                post.meta.liked = Boolean(liked);
            }
        }
        return posts;
    },
    createPost: async ({ 
        title, slug, html_content, status,
        BlogId, UserId, categories
     }) => {
        const data = {
            title, slug, html_content, status,
            BlogId, UserId
        }
        const categories_result = await prisma.categories.findMany({
            where: {
                OR: categories.map(category => ({
                    ...category
                }))
            }
        })
        for (let x=0; x < categories.length; x++) {
            let category = categories[x];
            let category_result = categories_result[x]
            if (!category_result) throw new ErrorHandler(404, "Not found", [
                `category ${JSON.stringify(category)} not found`
            ])
        }
        const post = await prisma.posts.create({ data })
        const postcategories = categories_result.map(async category => (
            await prisma.postcategories.create({
                data: {
                    CategoryId: category.id,
                    PostId: post.id
                }
            })
        ))
        await Promise.all(postcategories);
        return post;
    },
    updatePost: async ({pk,data}) => {
        let keys = Object.keys(data);
        const { categories, ...args } = data;

        const categories_result = await prisma.categories.findMany({
            where: {
                OR: categories.map(category => ({
                    ...category
                }))
            }
        })
        for (let x=0; x < categories.length; x++) {
            let category = categories[x];
            let category_result = categories_result[x]
            if (!category_result) throw new ErrorHandler(404, "Not found", [
                `category ${JSON.stringify(category)} not found`
            ])
        }

        const post = await prisma.posts.update({
            where: { id: Number(pk) },
            data: args
        })
        await prisma.postcategories.deleteMany({
            where: {
                PostId: post.id            
            }
        })
        const postcategories = categories_result.map(async category => (
            await prisma.postcategories.create({
                data: {
                    CategoryId: category.id,
                    PostId: post.id
                }
            }).catch(() => {}) // already exists
        ))
        await Promise.all(postcategories);
        return post;
    },
    deletePost: async (pk) => await prisma.posts.delete({ where: { id: Number(pk) } })
}
