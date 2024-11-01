if (global.docs_collector) docs_collector.generalAddYAML(__dirname + "/docs.yaml")

const express = require("express");
const app = module.exports = express();

const { allowCrossDomain, validateRequest, jwtRequired, passUserFromJWT, adminRequired, checkPermission } = require("../../middlewares");

const { post_users, post_users_unrestricted, patch_users_unrestricted, only_user_id_param_required } = require("./validations");
const createToken = require("../utils/createToken");
const { 
    updateUser,
    deleteUser, 
    createUser, 
    createUserUnrestricted, 
    findAll, 
    findByPk
} = require("./users-dal");
const { ErrorHandler } = require("../../utils/error");
const { addPermissionsToUser, findOrCreatePermission } = require("./permissions-dal");
const { addRoleToUser, findOrCreateRole } = require("./roles-dal");

app.use(allowCrossDomain)

app.get("/users", [
    jwtRequired, passUserFromJWT,
    checkPermission('users', 'read')
], async (req,res) => {
    let users = await findAll(); 
    return res.json({
        message: "success",
        code: 200,
        data: { users }
    })
})

app.get("/users/:user_id", [
    jwtRequired, passUserFromJWT, 
    checkPermission('users', 'read'),
    validateRequest(only_user_id_param_required)
], async (req,res) => {
    let user = await findByPk(req.params.user_id);
    if (!user) throw ErrorHandler.get404("User")
    return res.json({
        message: "success",
        code: 200,
        data: { user }
    })
})

app.delete("/users/:user_id", [
    jwtRequired, passUserFromJWT, 
    checkPermission('users', 'delete'),
    adminRequired,
    validateRequest(only_user_id_param_required)
], async (req,res) => {
    await deleteUser(req.params.user_id)
    return res.json({
        message: "success",
        code: 204
    })
})

app.patch("/users/:user_id", [
    jwtRequired, passUserFromJWT, 
    checkPermission('users', 'update'),
    adminRequired,
    validateRequest(only_user_id_param_required),
    validateRequest(patch_users_unrestricted)
], async (req,res) => {
    let user = await updateUser({
        pk: req.params.user_id,
        data: req.body
    })
    return res.json({
        message: "success",
        code: 200,
        data: { user }
    })
})

async function addDefaultPermissionsToUser(userId, skipDefaultPermissions = false) {
    if (skipDefaultPermissions) return;
    
    const defaultPermissions = [
        { resource: 'blogs', actions: ['create', 'read'] },
        { resource: 'blog_categories', actions: ['create', 'read'] },
        { resource: 'posts', actions: ['create', 'read'] }
    ];

    const permissionIds = await Promise.all(
        defaultPermissions.flatMap(({ resource, actions }) =>
            actions.map(async action => {
                const permission = await findOrCreatePermission({ resource, action });
                return permission.id;
            })
        )
    );

    await addPermissionsToUser(userId, permissionIds);
}

async function addDefaultRoleToUser(userId) {
    const defaultRole = await findOrCreateRole('moderator');
    await addRoleToUser(userId, defaultRole.id);
}

app.post("/users", [
    validateRequest(post_users),
], async (req, res) => {
    try {
        console.log('Creating user with body:', req.body);
        let user = await createUser(req.body);
        if (!user) {
            throw new Error('User creation failed - no user returned from createUser');
        }
        console.log('Created user:', user);
        
        await Promise.all([
            addDefaultPermissionsToUser(user.id),
            addDefaultRoleToUser(user.id)
        ]);
        
        const token = createToken(user.id);
        if (!token) {
            throw new Error('Token generation failed');
        }
        
        const responseData = {
            message: "success",
            code: 201,
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    first_name: user.first_name,
                    last_name: user.last_name,
                },
                token: token
            }
        };
        
        console.log('User object:', user);
        console.log('Token:', token);
        console.log('Response data before send:', JSON.stringify(responseData));
        
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify(responseData));
    } catch (error) {
        console.error('User creation error:', error);
        
        // Handle specific Prisma errors
        if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
            return res.status(400).json({
                message: "error",
                code: 400,
                error: "Email address is already in use"
            });
        }
        
        // Handle other errors
        return res.status(500).json({
            message: "error",
            code: 500,
            error: error.message || "An unexpected error occurred"
        });
    }
})

app.post("/users/unrestricted", [
    jwtRequired, passUserFromJWT, 
    checkPermission('users', 'create'),
    adminRequired,
    validateRequest(post_users_unrestricted)
], async (req, res) => {
    let user = await createUserUnrestricted(req.body);
    await Promise.all([
        addDefaultPermissionsToUser(user.id, req.body.skipDefaultPermissions),
        addDefaultRoleToUser(user.id)
    ]);
    
    return res.json({
        message: "success",
        code: 201,
        data: { user }
    })
})