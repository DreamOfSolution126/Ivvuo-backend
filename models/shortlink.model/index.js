'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const shortLinkSchema = new Schema ({
    short: { type:String, unique: true },
    idOrden: { type:String }
})

module.exports = mongoose.model('shortLink', shortLinkSchema)