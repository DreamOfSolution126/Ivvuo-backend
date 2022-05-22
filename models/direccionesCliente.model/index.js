'use strict'

const mongoose = require('mongoose')
const Cuenta = require('../account')
const Schema = mongoose.Schema

const direccionesClienteSchema = new Schema ({
    identificacion: {
        numero: { type: String },
        tipo: { type: String },
    },
    cuenta: { type: Schema.Types.ObjectId, ref: Cuenta },
    direcciones: [{
        callePricipal: { type: String },
        calleSecundaria: { type: String },
        complemento: { type: String },
        otros: { type: String },
        ciudad: { type: String}
    }]
})

module.exports = mongoose.model('direccionesCliente', direccionesClienteSchema )