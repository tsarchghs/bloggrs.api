import { Bloggrs } from "./bloggrs";

// const bloggrs = new Bloggrs();

const bloggrs = new Bloggrs(process.env.NEXT_PUBLIC_BLOGGRS_PUBLIC_KEY);

// bloggrs.serverUrl = "https://bloggrs-api-i1.herokuapp.com/api/v1"
bloggrs.serverUrl = "http://localhost:5500/api/v1"
bloggrs.BlogId = 76;

if (typeof(window) !== 'undefined') window.__bloggrs__ = bloggrs;

export default bloggrs;

const authenticated = bloggrs.auth.getAuth()

export async function getPosts({ categories } = {}) {
    await authenticated; await bloggrs.initPromise;
    return await bloggrs.posts.getPosts({ categories });
}

export async function getPost(id) {
    await authenticated;
    return await bloggrs.posts.getPost(id);
}

export async function getPostComments(id, options) {
    await authenticated;
    return await bloggrs.posts.getPostComments(id, options);
}

export async function getCategories() {
    await authenticated;
    return await bloggrs.categories.getCategories();
}

export async function getBlogHeaderWidgetData() {
    const { blog, pages } = await bloggrs.general.getBlogHeaderWidgetData();
    return { blog, pages }
}

export async function likePostComment({ content, PostId, UserId }) {
    const comment = await bloggrs.postlikes.createPostComment({
        content, PostId, UserId
    })
    return comment;
}

export async function createPostComment({ content, PostId, UserId }) {
    const comment = await bloggrs.postcomments.createPostComment({
        content, PostId, UserId
    })
    return comment;
}

export async function createBlogContact({ 
    first_name, last_name, email, content
 }) {
    const comment = await bloggrs.blogcontacts.createBlogContact({
        first_name, last_name, email, content
    })
    return comment;
}

export async function getUserId() {  
    return bloggrs.auth.getUserId() 
}