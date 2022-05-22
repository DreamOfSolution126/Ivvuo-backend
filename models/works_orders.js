'use strict'

const mongoose = require('mongoose')
const Account = require('./account')
const Center = require('./center')
const List = require('./list')
const DireccionesCliente = require('./direccionesCliente.model')
const moment = require('moment-timezone')
const Schema = mongoose.Schema

const WorksOrdersSchema = new Schema({
    key: { type:String, unique: true },
    create: { type:Date, default: moment().tz('America/Bogota').format() },
    notes:{ type:Array, default:[]},
    id: { type: String, trim: true },
    or: { type: String, trim: true },
    status: {
        abierto: {
            estatus:{ type: Boolean, default: true}, 
            date:{ type:Date, default: moment().tz('America/Bogota').format() }
        }, 
        cerrado: { 
            estatus:{ type: Boolean, default: false}, 
            date:{ type:Date, default: moment().tz('America/Bogota').format() }
        }
    },
    shortUrl: { type: String },
    // datos del cliente
    name: { type: String, default: '' },
    last_name: { type: String, default: '' },
    kiolometers:{ type: String, default: '' },
    nit:{ type: String, default: '' },
    email:{ type: String, lowercase: true, trim: true },
    telephone:{ type: String, default: '' },

    // Crear la orden
    creadoBy: { type: Object, default:{ nombres:'Sistema', email:'System', id:'Sytem' } },
    // Datos del vehículo
    plate:{ type: String, default: '', trim: true },
    vin:{ type: String, default: '', trim: true },
    model:{ type: String, default: '', trim: true },
    brand:{ type: String,  default: '', trim: true },
    year:{ type: String,  default: '', trim: true },

    process:[{
        seeProcess: { type: Boolean, default: false },
        key: { type: Boolean, default: false },
        id: { type: String, default: '' },
        listId: { type:Schema.ObjectId, ref:List },
        account_code: { type:String },
        icon:{ type: String },
        name:{ type:String },
        description:{ type:String },
        weight:{ type:Number, default: 100 },
        advanceValue:{ type:Number, default:0 },
        notifyCustomer: { type:Boolean },
        index:{ type:Number, default: 0 },
        asignado: [{ 
            nombres: { type: String, default: '' },
            email:{ type: String, default: '' }, 
            id:{ type: String, default: '' }
        }],
        checkList:[{
            item: { type: String, default: '' },
            id: { type: String },
            details: { type: String, default: ''},
            asnwer_options: [{
                    value: { type: Number },
                    answer: { type: String }
            }],
            answer: {
                value: { type: Number, default: null },
                answer: { type: String, default: ''}
            },
            attach: [{
                url: { type: String },
                type: { type: String },
                date: { type: Date },
                cargado: {
                    url: { type: String, default: '' },
                    estatus: { type: Boolean, default: false }
                }
            }],
            comments: [{
                text: { type: String },
                date: { type: Date },
                user: { type: String }
            }],
            parts: { type: Number, default: 0 },
            terceros: { type: Number, default: 0 },
            mo: { type: Number, default: 0 },
            total: { type: Number, default: 0 },
            totalIva: { type: Number, default: 0 },
            approved: { type: String, default: '' },
            listId: { type: String, default: '' },
            processId: { type: String, default: '' },
            account_code: { type: String, default: '' },
            weight: { type: Number, default: 0 },
            type: { type: String },
            quotation: {
                parts: { type: Array, default: [] },
                mo: { type: Array, default: [] }
            },
            resQuotation: { 
                status: { type: String, default: '' },
                date: { type: Date },
                block: { type: Boolean, default: false }
            },
            cotizacion: [{
                tipo: { type: String },
                referencia: { type: String },
                descripcion: { type: String },
                codigoDeParte: { type: String },
                cantidad: { type: Number, default: 1 },
                valorUnitario: { type: Number, default: 0 },
                valorIva: {type: Number,default:0 },
                valorTotal: { type: Number, default: 0 },
            }],
            esCotizacion: { type: Boolean, default: false },
            seeCustomer: { type: Boolean, default: true },
            index: { type: Number, default: 0 },
        }]
    }],
    total:{ type: Number, default:0 },
    parts:{ type: Number, default:0 },
    mo:{ type: Number, default:0 },
    tercero: { type: Number, default: 0},

    total_approve:{ type:Number, default:0 },
    parts_approve:{ type:Number, default:0 },
    mo_approve:{ type:Number, default:0 },
    tercero_aprobado:{ type:Number, default:0 },

    total_ban:{ type:Number, default:0 },
    parts_ban:{ type:Number, default:0 },
    mo_ban:{ type:Number, default:0 },
    tercero_rechazado:{ type:Number, default:0 },

    send_to_customer:{ type: Boolean, default: false },
    date_send:{ type: Date },
    customer_response:{ type: Boolean, default: false },
    reception: { type: Boolean, default: false },

    accountId: { type:Schema.ObjectId, ref:Account },
    centerId: { type:Schema.ObjectId, ref:Center },

    center_code: { type: String},
    account_code: { type: String},
    address_center: { type: String }, // deprecate

    account: { type:String},
    center: { type:String},

    // moreInfo:{ type:Array, default:[]},
    nit_account: { type:String},
    logo: { type: Object},
    address_account: { type: String},
    city_account: { type: String},
    country_account: { type: String},
    telephone_account: { type: String},
    list: { type:Object },
    factura: { 
        url: { type: String },
        type: { type: String },
        name: { type: String },
        date: { type: Date }
    },
    servicioDomicilio: {
        direcciones: { type: Schema.Types.ObjectId, ref: DireccionesCliente },
        recogida: {
            solicitarServicio: { type: Boolean, default: false },
            direccion: {
                callePricipal: { type: String, default: '' },
                calleSecundaria: { type: String, default: '' },
                complemento: { type: String, default: '' },
                otros: { type: String, default: '' },
                ciudad: { type: String, default: ''}
            },
            fecha: { type: Date, default: moment().tz('America/Bogota').format() },
            conductorAsignado: { type: Schema.Types.ObjectId }
        },
        entrega: {
            solicitarServicio: { type: Boolean, default: false },
            direccion: {
                callePricipal: { type: String, default: '' },
                calleSecundaria: { type: String, default: '' },
                complemento: { type: String, default: '' },
                otros: { type: String, default: '' },
                ciudad: { type: String, default: ''}
            },
            fecha: { type: Date, default: moment().tz('America/Bogota').format() },
            conductorAsignado: { type: Schema.Types.ObjectId }
        }
    },
    vistasCliente: {
        unica: {
            estatus: { type: Boolean, default: false },
            plataforma: { type: String, default: ''},
            usuario: { type: String, default: ''},
            fecha: { type: Date },
            geolocalizacion: {
                coordenadas: { 
                    altitud: { type: Number, default: 0 },
                    altitudPrecision: { type: Number, default: 0 },
                    latitud: { type: Number, default: 0 },
                    longitud: { type: Number, default: 0 },
                    precision: { type:Number, default: 0 },
                 },
                marcaDeTiempo: { type: Number, default: 0 }
                
            }
        },
        vistasTotales: { type: Number, default: 0 }
    },
    modoPresentacion: {
        prioridad: { type: Boolean, default: true },
        procesos: { type: Boolean, default: false }
    },
    informacionCentro: {
        direccion: { type: String, default: '' },
        ciudad: { type: String, default: '' },
        telefono: { type: String, default: '' }
    },
    notas: { type: String, default: '' }
})

module.exports = mongoose.model('worksOrders', WorksOrdersSchema)