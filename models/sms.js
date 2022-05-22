'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const SmsSchema = new Schema({
    name: { type:String },
    api: { type:String },
    default:{ type:Boolean },
    cliente: { type:Number },
    account_code: { type:String },
    sms_header:{ type:String },
    sms_body:{ type:String },
    sms_link:{ type:Boolean }
})

module.exports = mongoose.model('sms', SmsSchema)