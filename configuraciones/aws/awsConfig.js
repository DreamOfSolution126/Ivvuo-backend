'user strict'
require('dotenv').config()

const awsConfig = {
    // region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
}

module.exports = awsConfig