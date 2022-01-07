
const { ErrorHandler, handleError } = require("../utils/error");

module.exports = (err, req, res, next) => {
    if (process.env.DEBUG)
        console.log(
            err,900,JSON.stringify(err),err instanceof ErrorHandler,"\n",
            "----------------------------------------------"
        )
    if (err instanceof ErrorHandler) return handleError(err, res);
    else if (err.errors) {
        let err_ = new ErrorHandler(403, "ValidationError", err.errors.map(err => err.message))
        return handleError(err_, res);
    }
    else if (err.name === 'UnauthorizedError') {
        return res.status(401).json({
            status: "error",
            message:"Unauthorized",
            code: 401,
        })
    } else {
        if (process.env.DEVELOPMENT) throw err;
        else return res.status(500).json()
    }
}