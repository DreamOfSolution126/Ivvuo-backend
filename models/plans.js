'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const PlansSchema = new Schema({
    plan:{ type:String},
    value:{ type:Number },
    off:{ type:Number},
    total:{ type:Number },
    frequency:{ type:Number },
    description:{ type:String},
    active:{ type:Boolean, default:true},
    created: { type:Date, default: Date.now()}
})

module.exports = mongoose.model('Plan', PlansSchema)