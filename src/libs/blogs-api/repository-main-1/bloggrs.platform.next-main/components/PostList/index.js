import { getPosts } from "../../lib/bloggrs-sdk";
import SinglePost from "../SinglePost";

PostList.prototype.getComponentProps = async () => {
    const posts = await getPosts();
    return { posts }
}


export default function PostList({ posts, title }) {
    return (
        <>
            <div class="flex-grid">
                { title && <h3>{title}</h3> }
                {
                    posts.map(post => 
                        <SinglePost post={post}/>
                    )
                }
            </div>
            {
                !posts.length && <p>No posts to show..</p>
            }
        </>
    )
}