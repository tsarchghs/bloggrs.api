import Link from "next/link";
import styles from "./SinglePost.module.css";
// import EditorJS from '@editorjs/editorjs';
import { useEffect, useRef, useState } from "react";
  

const edjsHTML = require("editorjs-html");
const edjsParser = edjsHTML();

let Embed, Table, List, Warning, Code, LinkTool, Image, Raw, Header, Quote, Marker, CheckList, Delimiter, InlineCode, SimpleImage, createReactEditorJS;

if (typeof window !== "undefined") {
    Embed = require('@editorjs/embed');
    Table = require('@editorjs/table');
    List = require('@editorjs/list');
    Warning = require('@editorjs/warning');
    Code = require('@editorjs/code');
    LinkTool = require('@editorjs/link');
    Image = require('@editorjs/image');
    Raw = require('@editorjs/raw');
    Header = require('@editorjs/header');
    Quote = require('@editorjs/quote');
    Marker = require('@editorjs/marker');
    CheckList = require('@editorjs/checklist');
    Delimiter = require('@editorjs/delimiter');
    InlineCode = require('@editorjs/inline-code');
    SimpleImage = require('@editorjs/simple-image');
    createReactEditorJS = require("react-editor-js").createReactEditorJS
}

export default function SinglePost({ post, html_mode }) {
    // if (post.id < 5) {
    //     console.warn(`post<${post.id}> not rendered`)
    //     return null
    // }
    const [ editor, setEditor ] = useState(null);
    const holder = useRef(null);
    // const html = edjsParser.parseStrict(post.html_content);

    useEffect(() => {
        if (typeof window === "undefined") return;        
        let EDITOR_JS_TOOLS = {
            embed: Embed,
            table: Table,
            marker: Marker,
            list: List,
            warning: Warning,
            code: Code,
            linkTool: LinkTool,
            image: Image,
            raw: Raw,
            header: Header,
            quote: Quote,
            checklist: CheckList,
            delimiter: Delimiter,
            inlineCode: InlineCode,
            simpleImage: SimpleImage,
        }
        const ReactEditorJS = createReactEditorJS({ readOnly: true });
        console.log({ EDITOR_JS_TOOLS, post })
        try {
            JSON.parse(post.html_content)
        } catch(err) {
            return;
        }
        const editor = <ReactEditorJS
            defaultValue={JSON.parse(post.html_content)}
            tools={EDITOR_JS_TOOLS}
            readOnly={true}
        />
        setEditor(editor)
    }, [ holder ])
    
    useEffect(() => {
        setTimeout(() => {
            const textarea_elements = document.getElementsByClassName("ce-code__textarea cdx-input");
            for (let el of textarea_elements) {
                const height = el.scrollHeight + ( el.scrollHeight * 0.05);
                el.style.height = `${height}px`
                el.parentElement.style.height = `${height}px`
                el.parentElement.style.marginTop = "20px"
                el.parentElement.style.marginBottom = "20px"
                el.parentElement.parentElement.style.height = `${height}px`
            }
        }, 1500)
    }, [ editor ])
    
    const onPostLike = e => {
        e.preventDefault();
        // likePostComment
    }

    if (!editor) "editor loading"
    return (
        <div class="">
            <Link href={`/posts/${post.slug}`}>
                <h4 style={{ cursor: 'pointer' }} dangerouslySetInnerHTML={{
                    __html: post.title
                }}></h4>
            </Link>
            {
                !html_mode
                    ? <p>{post.meta.content_text}</p>
                    : (editor)
            }
            <div style={{ display: "grid" }}>
                <div style={{ display: 'inline-flex'}}>
                    <p onClick={onPostLike} className={styles.p_likes}>{post.meta.likes_count} likes</p> 
                    <p>&nbsp;&nbsp; | &nbsp;&nbsp;</p>
                    <p>{post.meta.comments_count} comments</p>
                    <p>&nbsp;&nbsp; | &nbsp;&nbsp;</p>
                    <p>January 28, 2022</p>
                </div>
            </div>
        </div>
    )
}