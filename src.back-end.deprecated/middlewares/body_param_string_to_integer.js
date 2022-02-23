

module.exports = (key) => (req,res,next) => {
    // console.log("TEST[key]: ",req.body.body ? req.body.body.vkb_id : req.body)
    console.log(key,req.body[key],typeof(req.body[key]) === "string",!isNaN(Number(req.body[key])))
    if (req.body[key] && typeof(req.body[key]) === "string" && !isNaN(Number(req.body[key]))) {
        req.body[key] = Number(req.body[key])
    }
    return next();
}