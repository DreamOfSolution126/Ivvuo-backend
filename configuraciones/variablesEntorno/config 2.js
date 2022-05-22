'use strict'
require('dotenv').config()

module.exports = {
    port: process.env.PORT || 3001,
    db: process.env.MONGODB || 'mongodb://heroku_fvl252wx:gakfd0igg6ip2uis644h09uq13@ds123399.mlab.com:23399/heroku_fvl252wx',
    SECRET_TOKEN: 'mysecret',
    frontend: process.env.FRONTEND || 'https://ivvuo.com'
}