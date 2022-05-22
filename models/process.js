'use strict'

const mongoose = require('mongoose')
const List = require('../models/list')
const Schema = mongoose.Schema

const ProcessSchema = new Schema({
    listId: { type:Schema.ObjectId, ref:List },
    account_code: { type:String },
    icon:{ type:String},
    iconName:{ type:String },
    process:{ type:String },
    description:{ type:String },
    weight:{ type:Number },
    advanceValue:{ type:Number, default:0 },
    notifyCustomer: { type:Boolean },
    index:{ type:Number, default:0},
    asignado: [
        { 
            nombres: { type:String },
            email:{ type:String }, 
            id:{ type:String },
        }
    ]
})

module.exports = mongoose.model('process', ProcessSchema)