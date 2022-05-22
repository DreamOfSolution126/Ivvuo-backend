'use strict'

const mongoose = require('mongoose')
const Cuenta = require('../account')
const Centro = require('../center')
const Schema = mongoose.Schema
const { TIPO_DOCUMENTO } = require('../enum')
const moment = require('moment-timezone')

const ClienteSchema = new Schema({
    contrasena: { type: String, default:''},
    creado: { type: Date, default: moment().tz('America/Bogota').format() },
    creadoDesdeZonaCliente: { type: Boolean, default: false },
    cuenta: { type: Schema.Types.ObjectId, ref: Cuenta },
    email: { type: String, trim: true },
    identificacion: {
        numero: { type: String, trim: true },
        tipo: { type: String, enum:[
            TIPO_DOCUMENTO.CEDULA_CIUDADANIA,
            TIPO_DOCUMENTO.CEDULA_EXTRANJERIA,
            TIPO_DOCUMENTO.NIT,
            TIPO_DOCUMENTO.PASAPORTE
        ] }
    },
    nombre: {
        apellidos: { type: String, trim: true, default:''   },
        nombres: { type: String, trim: true, default:''  },
        tratamiento: { type: String, trim: true, default:''  },
        razonSocial: { type: String, trim: true, default:''  }
    },
    telefono: {
        codigoPais: { type: String, default:'' },
        numero: { type: String, default:'' },
        celular: { type: String, default:'' }
    },
    direcciones: [{
        pais: { type: String },
        ciudad: { type: String },
        barrio: { type: String },
        principal: { type: String },
        secondaria: { type: String },
        numero: { type: String },
        adicional: { type: String }
    }]
})

module.exports = mongoose.model('cliente', ClienteSchema )