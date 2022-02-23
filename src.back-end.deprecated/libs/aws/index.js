const aws = require("aws-sdk");

aws.config.update({
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    region: process.env.S3_REGION //"us-east-1"
})

module.exports = new aws.S3({
    params: { Bucket: process.env.S3_BUCKET }
})