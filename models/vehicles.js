'use strict'

const mongoose = require('mongoose')
const Center = require('./center')
const Customer = require('./customer')

const Schema = mongoose.Schema


const VehiclesSchema = new Schema({
    plate: { type:String, minlength:6, maxlength:6, unique:true},
    type: { typr:String, enum:['Automóvil', 'Camionetas', 'Campero', 'Camión', 'Doble Troque', 'Cabezote', 'Tolba']}, //Camioneta, campero, dobletroque, tolba, cabezote etc...
    use: { type:String }, //Publico particular
    img: { type:String },
    //Who create this
    centerId:{type: Schema.ObjectId, ref:Center},
    last_service: { type:Date, default: Date.now()},

    //Owner customer
    customer:{ type:Schema.ObjectId, ref:Customer },
    customer_nit: { type:Number },
    customer_name:{ type:String },
    customer_enterprise: { type:String }
})

module.exports = mongoose.model('vehicle', VehiclesSchema)