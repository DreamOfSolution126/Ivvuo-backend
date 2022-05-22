'use strict'

const mongoose = require('mongoose')
const Cliente = require('../clientes.model')
const Cuenta = require('../account')
const Centro = require('../center')
const Schema = mongoose.Schema
const { TIPO_CAJA, TIPO_COMBUSTIBLE } = require('../enum')

const vehiculoSchema = new Schema({
    ano: { type: String },
    creado: { type: Date,  default: new Date( Date.now() )},
    placa: { type: String, trim: true, uppercase: true },
    marca: { type: String, trim: true, default:''  },
    linea: { type: String, trim: true, default:''  },
    version: { type: String, trim: true, default:''  },
    vin: { type: String, trim: true, uppercase: true, default:''  },
    motor: { 
        cilindrada: { type: String, default:'' },
        combustible: { 
            type: String,
            default:'', 
            enum: [ 
                TIPO_COMBUSTIBLE.DIESEL, 
                TIPO_COMBUSTIBLE.ELECTRICO,
                TIPO_COMBUSTIBLE.GASOLINA,
                TIPO_COMBUSTIBLE.HIBRIDO,
                ''
            ] 
        },
        tipoCaja: { type: String, enum: [TIPO_CAJA.AUTOMATICA, TIPO_CAJA.MECANICA, ''], default:'' }
    },
    // cliente: { type: Schema.Types.ObjectId, ref: Cliente },
    cuenta: { type: Schema.Types.ObjectId, ref: Cuenta },
    centro: { type: Schema.Types.ObjectId, ref: Centro },
    soat: {
        fechaVencimiento: { type: Date, default:'' },
        frecuenciaMeses: { type: Number, default:'' },
        notificar: { type: Boolean, default: false }
    },
    cambioAceite: {
        fechaUltimo: { type: Date, default:'' },
        frecuenciaMeses: { type: Number, default: 0 },
        notificar: { type: Boolean, default: false }
    },
    mantenimiento: {
        kilometraje: { type: Number, default: 0 },
        fechaUltimo: { type: Date, default:'' },
        frecuenciaMeses: { type: Number, default: 0 },
        notificar: { type: Boolean, default: false }
    }
})

module.exports = mongoose.model('vehiculos', vehiculoSchema)