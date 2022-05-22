const mongoose = require('mongoose')
const Schema = mongoose.Schema
const Cuenta = require('../account')
const Centro = require('../center')

const MarcaSchema = new Schema ({
    activo: { type: Boolean, default: true },
    marca: { type: String, default: '', lowercase: true, trim: true },
    cuentas: [{
        type: Schema.ObjectId, ref: Cuenta
    }],
    centros: [{
        type: Schema.ObjectId, ref: Centro
    }],
    logo: {
        url: { type: String, default: '' }
    },
    pais: {
        codigo: { type: String, default: '' },
        nombre: { type: String, default: '' }
    }
})

module.exports = mongoose.model('marca', MarcaSchema )