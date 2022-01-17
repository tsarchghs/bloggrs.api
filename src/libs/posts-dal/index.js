const prisma = require("../../prisma");

module.exports = {
  findPostsForBlog: async (BlogId, { page = 1, pageSize = 10 } = {}) => {
    const where = {
      BlogId: Number(BlogId),
    };
    // if (query) where[Sequelize.Op.or] = [
    //     { contract_type: { [Sequelize.Op.like]: `%${query}%` } },
    //     { comment: { [Sequelize.Op.like]: `%${query}%` } }
    // ]
    let posts = await prisma.posts.findMany({
      where,
      include: {
        users: true
      },
      skip: Number(page) - 1 && Number(page-1) * Number(pageSize),
      take: Number(pageSize),
    });
    posts = posts.map(async (post) => {
      post = JSON.parse(JSON.stringify(post));
      const likes_count = await prisma.postlikes.count({
        where: { PostId: post.id },
      });
      const comments_count = await prisma.postcomments.count({
        where: { PostId: post.id },
      });
      const meta = {
        likes_count,
        comments_count,
      };
      post.meta = meta;
      return post;
    });
    return Promise.all(posts);
  },
  findPost: async (PostId) => {
    let post = await prisma.posts.findUnique({ where: { id: PostId }});
    post = JSON.parse(JSON.stringify(post));
    const likes_count = await prisma.postlikes.count({
      where: { PostId: post.id },
    });
    const comments_count = await prisma.postcomments.count({
      where: { PostId: post.id },
    });
    const meta = {
      likes_count,
      comments_count,
    };
    post.meta = meta;
    return post;
  },
};
