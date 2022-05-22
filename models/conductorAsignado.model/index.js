'use strict'
const Cuenta = require('../account')
const Centro = require('../center')
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const { TIPO_DOCUMENTO } = require('../enum')

const ConductoAsigandoSchema = new Schema({
    activo: { type: Boolean, default: true },
    identificacion: {
        tipo: { type: String, enum:[
            TIPO_DOCUMENTO.CEDULA_CIUDADANIA,
            TIPO_DOCUMENTO.CEDULA_EXTRANJERIA,
            TIPO_DOCUMENTO.NIT,
            TIPO_DOCUMENTO.PASAPORTE,
        ]},
        numero: { type: String }
    },
    nombre: {
        nombres: { type: String, default:''},
        apellidos: { type: String, default:''},
    },
    imagenPerfil: {
        url: { type: String, default: 'https://ivvuo.com/assets/img/default/user.png' },
        extension: { type: String }
    },
    centro: { type: Schema.Types.ObjectId, ref: Centro },
    cuenta: { type: Schema.Types.ObjectId, ref: Cuenta },
    contrasena: { type: String },
    rol: { type: String, default:''},

})

module.exports = mongoose.model('conductorAsignado', ConductoAsigandoSchema );