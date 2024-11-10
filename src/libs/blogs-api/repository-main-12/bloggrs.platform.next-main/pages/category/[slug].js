import { useRouter } from 'next/router';
import CategoriesList from '../../components/CategoriesList';
import PostList from '../../components/PostList';
import { getCategories, getPosts } from "../../lib/bloggrs-sdk";

export async function getServerSideProps({ params }) {
    const { slug } = params;
    const posts = await getPosts({
        categories: slug
    });
    console.log({ slug })
    const categories = await getCategories();
    return {
        props: {
            posts, categories
        }
    }
}

export default function CategoryName({ posts, categories }) {
    const router = useRouter();
    const { query } = router;
    const { slug } = query;
    return (
        <div className='flex-grid'>
            <div className='col-offset-2 col-4'>
                <PostList categories={[{ slug }]} title={slug} posts={posts} />
            </div>
            <div className='col-offset-1 col-2 row-offset-1'>
                <CategoriesList selected={slug} categories={categories}/>
            </div>
        </div>
    )
}