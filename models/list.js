'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ListSchema = new Schema({
    createdUp:{ type:Date, default: Date.now() },
    list:{ type:String, require:true },
    key:{ type:String, unique:true},
    description:{ type:String },
    account_code:{ type:String },
    advanceVisible:{ type:Boolean },
    advanceValue:{ type:Number, default:0}
})

module.exports = mongoose.model('list', ListSchema)