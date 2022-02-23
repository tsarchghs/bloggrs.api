
const prisma = require("../../prisma");
const { ErrorHandler } = require("../../utils/error");

module.exports = {
    findByPkOr404: pk => prisma.posts.findByPkOr404(pk),
    findAll: async ({ page = 1, pageSize = 10, categories }) => {
        const where = {}
        if (categories) {
            categories = categories.split(",");
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
        return await prisma.posts.findMany({
            where,
            skip: (page - 1) & page,
            take: pageSize,
        })
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
        let post = await prisma.posts.findByPkOr404(pk);
        for (let key of keys){
            post[key] = data[key]
        }
        await posts.save();
        return post;
    },
    deletePost: async (pk) => await prisma.posts.delete({ where: { id: Number(pk) } })
}
