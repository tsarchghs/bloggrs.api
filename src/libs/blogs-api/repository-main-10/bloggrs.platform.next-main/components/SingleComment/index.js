import Link from "next/link";

export default function SingleComment({ comment }) {
    return (
        <div class="" style={{
            border: "1px black dashed",
            padding: 6
        }}>
            <p>
                <p>@gjergjkadriu</p>
                <p style={{ marginLeft: 0 }}>{comment.content}</p>
            </p>
            <div style={{ display: 'inline-flex'}}>
                <p>{comment.meta.likes_count} likes</p> 
                <p>&nbsp;&nbsp; | &nbsp;&nbsp;</p>
                <p>January 28, 2022</p>
            </div>
        </div>
    )
}