'use strict'

const mongoose = require('mongoose')

const Cliente = require('../clientes.model')
const Vehiculo = require('../vehiculos.model')
const Cuenta = require('../account')
const Centro = require('../center')
const Lista = require('../list')

const Schema = mongoose.Schema
const ObjectId = Schema.Types.ObjectId


const ordenesSchema = new Schema ({

    or: { type: String },
    create: { type: Date, default: new Date( Date.now() ) },

    creadoPor: {
        nombres: { type:String, default: 'Sistema' },
        email: { type:String, default: 'Sistema' },
        id: { type:String, default: 'Sistema' },
    },

    cliente: { type: ObjectId, ref: Cliente,  },
    vehiculo: { type: ObjectId, ref: Vehiculo },

    cuenta: { type: ObjectId, ref: Cuenta },
    centro: { type: ObjectId, ref: Centro },

    listas: [ { type: ObjectId, ref: Lista } ],

    solicitudes: [],

    cotizaciones: [],

    recogida: {

        solicitudRecogida: { type: Boolean, default: false },
        solicitudEntrega: { type: Boolean, default: false },
        mensajeroRecogida: { type: String },
        mensajeroEntrega: { type: String },
        fechaRecogida: { type: Date },
        direccionRecogida: {
            incioRecogida: { type: Boolean },
            activa: { type: Boolean },
            ciudad: { type: String },
            pais: { type: String },
            direccion: { type: String },
            adicional: { type: String }
        },
        direccionEntrega: {
            incioEntrega: { type: Boolean },
            activa: { type: Boolean },
            ciudad: { type: String },
            pais: { type: String },
            direccion: { type: String },
            adicional: { type: String }
        }
    },

    comunicaciones: {
        smsEnviado: [{
            estatus: { type: Boolean, default: false },
            fechaEnvio: { type: Date },
            usuario: { type: String }
        }],
        emailEnviado: [{
            estatus: { type: Boolean, default: false },
            fechaEnvio: { type: Date },
            usuario: { type: String }
        }]
    },

    recepcionCliente: {
        vistaUnica: { type: Boolean, default: false },
        cargas: { type: Number, default: 0 },
        detalles: [ {
            dispositivo: { type:String  },
            ip: { type: String },
            fecha: { type: Date }
        } ]
    }
    
});

module.exports = mongoose.model('ordenes', ordenesSchema)
