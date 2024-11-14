import PostList from "../components/PostList";
import { getPosts } from "../lib/bloggrs-sdk";

export async function getServerSideProps(context) {
    const posts = await getPosts({
        status: "archived"
    });
    return {
        props: {
            posts
        }
    }
}

export default function Archive({ posts }) {
    return (
        <div className='flex-grid'>
            <div className='col-offset-2 col-4'>
                <PostList title="Archive" posts={posts} />
            </div>
        </div>
    )
}