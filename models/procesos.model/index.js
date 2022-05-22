'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema
const Lista = require('../listas.model')
const Cuenta = require('../account')

const ProcesoSchema = new Schema({
    lista: { type: Schema.Types.ObjectId, ref: Lista },
    cuenta: { type: Schema.Types.ObjectId, ref: Cuenta },
    icono: { 
        nombre: { type: String },
        html: { type: String }
    },
    nombre: { type: String, trim: true },
    descripcion: { type: String, trim: true, default: '' },
    avance: { type: Number, default: 0 },
    notificaciones: {
        cuandoEsteTerminado: { type: Boolean, default: false },
        cuandoInicie: { type: Boolean, default: false },
    },
    asignado: [
        { 
            nombres: { type:String },
            email:{ type:String }, 
            id:{ type:String },
        }
    ]
})

module.exports = mongoose.model('proceso', ProcesoSchema )