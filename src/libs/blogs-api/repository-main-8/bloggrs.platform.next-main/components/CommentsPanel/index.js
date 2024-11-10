import SingleComment from "../SingleComment";
import Link from "next/link";
import { useState } from "react";
import { createPostComment, getUserId } from "../../lib/bloggrs-sdk";
import { toast } from "react-toastify";


export default function CommentsPanel({ comments, post, pagination, onLoadMore }) {
    const [ content, setContent ] = useState("")
    const [ isSubmitting, setIsSubmitting ] = useState(false);
    const [ newComments, setNewComments ] = useState([]);
    const addNewComment = comment => setNewComments([ ...newComments, comment ])

    const onSubmitHandler = async e => {
        e.preventDefault();
        setIsSubmitting(true);
        const { id: PostId } = post;
        const comment = await createPostComment({
            PostId, content
        })
        addNewComment(comment);
        setIsSubmitting(false);
        setContent("");
    }

    const allComments = newComments.concat(comments)
    const Comments = allComments.map((comment,i) => (
        <>
            <SingleComment comment={{
                ...comment,
                meta: { likes_count: 0 }
            }}/>
            {allComments.length - 1 == i ? null : <br/>}
        </>
    ))
    const { page, pageSize, count } = pagination;
    const canLoadMore = (page * pageSize) < count;
    return (
        <div class="panel">
            <div class="panel-header">
                Comments {"  "} ({(count + newComments.length)})
            </div>
                <br/><br/>
                <center>
                    <form disabled={isSubmitting || !content} onSubmit={onSubmitHandler}>
                        <input 
                            value={content}  
                            onChange={e => setContent(e.target.value)}    
                            placeholder="Type your comment here"
                        />
                        <button
                            disabled={isSubmitting || !content}
                            type="submit" 
                            className="btn"
                            style={{
                                height: 34,
                                marginLeft: 9,
                                borderRadius: 0    
                            }}
                        >
                            Post Comment
                        </button>
                    </form>
                </center>
            <div class="panel-body">
                {Comments}
                {!allComments.length && <p>No comments to show..</p>}
                {canLoadMore && <>
                    <br/>
                    <center onClick={onLoadMore} style={{
                        cursor: "pointer"
                    }}>Load more</center>
                </>}
            </div>
            <div class="panel-footer">
                Powered by <Link href="https://bloggrs.com/"><a>bloggrs</a></Link>
            </div>
        </div>
    )
}