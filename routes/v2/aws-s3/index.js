'use strict'

const express = require('express')
const awsS3 = require('../../../controllers/v2/aws-s3');

const aws = express.Router()

aws.post('/crear', awsS3.crearBucketController )
aws.get('/getFile', awsS3.getFileController )



module.exports = aws