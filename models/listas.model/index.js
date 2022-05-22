'use strict'

const mongoose = require('mongoose')
const Cuenta = require('../account')
const Schema = mongoose.Schema


const ListaSchema = new Schema({
    creado: { type: Date },
    nombre: { type: String, trim: true },
    descripcion: { type: String },
    cuenta: { type: Schema.Types.ObjectId, ref: Cuenta }
})

module.exports = mongoose.model('lista', ListaSchema )

