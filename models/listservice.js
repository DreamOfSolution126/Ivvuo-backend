'use strict'

const mongoose = require('mongoose')
const Account = require('../models/account')
const Center = require('../models/center')
const Service = require('../models/service')
const Schema = mongoose.Schema

const ListServiceSchema = new Schema({
    account:{ type: Schema.ObjectId, ref:Account},
    center:{ type:Schema.ObjectId, ref:Center, unique:true },
    services:[{type:Schema.ObjectId, ref:Service}],
})

module.exports = mongoose.model('ListService', ListServiceSchema)