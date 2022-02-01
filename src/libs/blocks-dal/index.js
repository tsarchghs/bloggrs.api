const prisma = require("../../prisma");
const yup = require("yup");

const setBlocks = async ({ BlogId, blocks, BlockId }) => {
    if (!blocks.length && blocks) blocks = [ blocks ]
    if (BlockId) {
        for (block of blocks){
            const _block_ = await prisma.blocks.create({
                data: { 
                    name: block.name, 
                    BlogId,
                    isChild: true
                }
            })

            for (attr_key of Object.keys(block.attributes)){
                const attr = { 
                    key: attr_key, 
                    value: block.attributes[attr_key],
                    type: typeof(block.attributes[attr_key]) 
                }
                await prisma.blockattributes.create({
                    data: { ...attr, BlockId: _block_.id }
                })
            }

            const child = await prisma.children.create({
                data: { BlockId: _block_.id }
            })
            await prisma.blockchildrens.create({
                data: {
                    BlockId,
                    ChildrenId: child.id
                }
            })    
            if (block.children.length) await setBlocks({
                BlogId, blocks: block.children, BlockId: _block_.id
            }) 
            
        }

    } else {
        for (block of blocks){
            const _block_ = await prisma.blocks.create({
                data: { 
                    name: block.name, 
                    BlogId 
                } 
            })
            for (attr_key of Object.keys(block.attributes)){
                const attr = { 
                    key: attr_key, 
                    value: block.attributes[attr_key],
                    type: typeof(block.attributes[attr_key]) 
                }
                await prisma.blockattributes.create({
                    data: { ...attr, BlockId: _block_.id }
                })
            }

            if (block.children.length) await setBlocks({
                BlogId, blocks: block.children, BlockId: _block_.id
            }) 
        }    
    }
}

const getBlock = async (block) => {
    const { id: BlockId } = block;
    const formatted_block = { ... block }
    const attributes = await prisma.blockattributes.findMany({
        where: { BlockId: block.id }
    })
    formatted_block.attributes = {}
    attributes.forEach(attr => 
        formatted_block.attributes[attr.key] = attr.value
    )

    formatted_block.children = [];
    const blockchildrens = await prisma.blockchildrens.findMany({
        where: { BlockId }
    })
    for (blockchildren of blockchildrens){
        const child = await prisma.children.findUnique({
            where: { id: blockchildren.ChildrenId }
        })
        const block__ = await prisma.blocks.findUnique({
            where: { id: child.BlockId }
        })
        const childblock = await getBlock(block__)
        formatted_block.children.push(childblock)
    }
    return formatted_block;
}

module.exports = {
    getBlocks: async ({ BlogId }) => {
        const formatted_blocks = []
        const blocks = await prisma.blocks.findMany({
            where: { BlogId: BlogId, isChild: false }
        })

        for (block of blocks) {
            const formatted_block = await getBlock(block)
            formatted_blocks.push(formatted_block)
        }
        return formatted_blocks
    },
    setBlocks
}