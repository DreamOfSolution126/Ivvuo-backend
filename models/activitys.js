'use strict'

const mongoose = require('mongoose')
const List = require('./list')
const Process = require('./process')
const Schema = mongoose.Schema
const { TIPO_ACTIVIDAD, TIPO_ITEM_COTIZACION } = require('./enum')

const ActivitySchema = new Schema({
    listId: { type:Schema.ObjectId, ref:List },
    processId: { type:Schema.ObjectId, ref:Process },
    account_code: { type:String },
    name: { type:String, default: '' },
    details: { type:String, default: '' },
    weight: {type:Number },
    type: { type:String, enum:[
        TIPO_ACTIVIDAD.CHEQUEO,
        TIPO_ACTIVIDAD.ENCUESTA,
        TIPO_ACTIVIDAD.INSPECCION,
        TIPO_ACTIVIDAD.PERSONALIZADO,
        TIPO_ACTIVIDAD.REVISION
    ] },
    attach: [{
        url: { type: String },
        type: { type: String },
        date: { type: Date },
        cargado: {
            url: { type: String, default: '' },
            estatus: { type: Boolean, default: false }
        }
    }],
    asnwer_options:[],
    parts:{ type: Number },
    mo:{ type:Number},
    total:{ type:Number},
    quotation:{ type:Object, default:{ parts:[], mo:[] } },
    cotizacion:[{
        tipo: { type: String, enum:[
            TIPO_ITEM_COTIZACION.MANO_OBRA,
            TIPO_ITEM_COTIZACION.REPUESTO,
            TIPO_ITEM_COTIZACION.TERCERO
        ] },
        referencia: { type: String },
        descripcion: { type: String },
        codigoDeParte: { type: String },
        cantidad: { type: Number, default: 0 },
        valorUnitario: { type: Number, default: 1 },
        valorIva: {type: Number,default:0 },
        valorTotal: { type: Number, default: 0 }
        // TODO: Incluir variables para iva
    }],
    resQuotation:{
        status: { type: String, default: '' },
        date: { type: Date },
        block: { type: Boolean, default: false }
    },
    seeCustomer:{ type:Boolean, default:true },
    createUp:{ type:Date, default: Date.now() },
    index:{ type: Number, default:0 },
    seguimiento: {
        activar: { type: Boolean, default: false },
        fechaProximoContacto: { type: Date, default: new Date( Date.now() ) },
        razonRechazo: { type: String, default: '' }
    }
})

module.exports = mongoose.model('activity', ActivitySchema)