import Link from "next/link";
import { getPost, getPostComments } from "../../lib/bloggrs-sdk";
import SinglePostItem from "../../components/SinglePost";
import SingleComment from "../../components/SingleComment";
import CommentsPanel from "../../components/CommentsPanel";
import { useState } from "react";

export async function getServerSideProps(context) {
    const { query } = context;
    const { slug } = query;
    let post = null, comments_result = null;
    try {
        post = await getPost(slug);
    } catch(err) { 
        if (err.message !== "Not Found") throw err;
    }
    if (post) comments_result = await getPostComments(post.id);
    return {
        props: {
            post, _comments_result: comments_result, not_found: !Boolean(post)
        }
    }
}

export default function SinglePost({ post, _comments_result, not_found }){
    if (not_found) {
        return (
            <center style={{ marginTop: "2rem", marginBottom: "2rem" }}>
                404 not found
            </center>
        )
    }

    const [ comments_result, setCommentsResult ] = useState(_comments_result);

    const { comments, page, pageSize, count } = comments_result

    const onLoadMore = async e => {
        e.preventDefault();
        const new_comments_result = await getPostComments(post.id, {
            page: page + 1,
            pageSize
        })
        setCommentsResult({
            ...comments_result,
            page: page + 1,
            pageSize,
            comments: comments.concat(new_comments_result.comments)
        });
    }

    return (
      <div className='flex-grid'>
        <div className='col-offset-2 col-5'>
          <SinglePostItem post={post} html_mode={true} />
        </div>
        <div className="col-offset-2 col-5">
            <CommentsPanel 
                post={post}
                comments={comments}
                pagination={{
                    page, pageSize, count
                }}
                onLoadMore={onLoadMore}
            />
        </div>
      </div>
    )
}