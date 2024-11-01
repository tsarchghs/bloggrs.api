import * as  yup from "yup";
import CategoriesList from "../components/CategoriesList";
import CommentsPanel from "../components/CommentsPanel";
import Footer from "../components/Footer";
import Header from "../components/Header";
import PostList from "../components/PostList";
import SingleComment from "../components/SingleComment";
import SinglePost from "../components/SinglePost";
import React from "react";

const block_fields = {
  name: yup.string().required(),
  attributes: yup.object().required()
}

const blocks_schema = yup.array().of(
  yup.object().shape({
    ...block_fields,
    children: yup.array().of(
        yup.object().shape({
            ...block_fields,
            children: yup.array().of(
                yup.object().shape({
                    ...block_fields
                })
            )
        })
    )
  })
)

const bloggrs_components_map = {
    "categories-list": CategoriesList,
    "comments-panel": CommentsPanel,
    "footer": Footer,
    "header": Header,
    "posts-list": PostList,
    "single-comment": SingleComment,
    "single-post": SinglePost
}

const getBlock = async (block) => {
    const {
        name,
        attributes,
        children
    } = block;
    const bloggrs_component = bloggrs_components_map[name]
    
    let props = attributes;
    // for (let attr_key of Object.keys(attributes)) {
    //     let attr_value = attributes[attr_key];
    //     props[attr_key] = attr_value
    // }
    
    const block_children = []
    for (let child of children){
        block_children.push(
            await getBlock(child)
        )
    }

    if (bloggrs_component) {
        const Component = bloggrs_component;
        const { getComponentProps } = Component.prototype;
        if (getComponentProps) {
            const comp_props = await getComponentProps();
            props = {
                ...comp_props,
                ...props
            }
        }
        // return "DSADAS222"
        // const _Component = <Component {...props}>{block_children}</Component>
        console.log({ sss: React.createElement(Component, props, block_children),
            child: React.createElement(Component, props, block_children).props.children
        })
        return <Component {...props}>{block_children}</Component> // React.createElement(Component, props, block_children)
    } else {
        props.className = name;
        return React.createElement("div", props, block_children);
    }
}

const getBlocks = async blocks => {
    const react_blocks = [];
    for (let block of blocks){
        const react_block = await getBlock(block);
        react_blocks.push(react_block);
    }
    return react_blocks
}

const parseBlocks = async blocks => {
    blocks_schema.validateSync(blocks);
    return await getBlocks(blocks);
}

export default parseBlocks;