'use strict'

const mongoose = require('mongoose');
const Orden = require('../ordenes.model');
const Cuenta = require('../account')
const Schema = mongoose.Schema;
const { TIPO_ACTIVIDAD, COTIZACION_APROBADA } = require('../../models/enum');

const ActividadSchema = new Schema({
    cuenta: { type: Schema.Types.ObjectId, ref: Cuenta },
    nombre: { type: String, trim: true },
    detalle: { type: String, trim: true },
    proceso: { type: Schema.Types.ObjectId  },
    lista: { type: Schema.Types.ObjectId },
    orden: { type: Schema.Types.ObjectId, ref: Orden },
    tipo: { type: String, enum:[
        TIPO_ACTIVIDAD.CHEQUEO,
        TIPO_ACTIVIDAD.ENCUESTA,
        TIPO_ACTIVIDAD.INSPECCION,
        TIPO_ACTIVIDAD.PERSONALIZADO,
        TIPO_ACTIVIDAD.REVISION
    ]},
    opcionesRespuesta: { type: Array, default: [] },
    cotizacionItems: [{
        tipo: { type: String },
        referencia: { type: String },
        nombre: { type: String },
        descripcion: { type: String },
        cantidad: { type: Number },
        valorUnitario: { type: Number },
        impuesto: { type: Number },
        valorTotal: { type: Number },
        valorIva: {type: Number}
    }],
    contizacion: {
        valorTotal: { type: Number, default: 0 },
        valorManoDeObra: { type: Number, default: 0 },
        valorRepuestos: { type: Number, default: 0 },
        aprobado: { type: String, enum: [
            COTIZACION_APROBADA.APROBADA,
            COTIZACION_APROBADA.PENDIENTE,
            COTIZACION_APROBADA.PROGRAMADO,
            COTIZACION_APROBADA.RECHAZADA,
            COTIZACION_APROBADA.SIN_COTIZACION
        ], default: COTIZACION_APROBADA.SIN_COTIZACION },
        fechaProximoAviso: { type: Date },
        bloqueado: { type: Boolean }
    },
    indice: { type: Number, default: 0 },
    respuesta: {
        valor: { type: Number },
        respuesta: { type: String }
    },
    verPorElCliente: { type: Boolean, default: true }
})

module.exports = mongoose.model('actividad', ActividadSchema );