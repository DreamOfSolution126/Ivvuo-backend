'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const WhatsappSchema = new Schema({
    account: { type:mongoose.Schema.Types.ObjectId },
    nombre: { type: String, trim: true },
    cuerpo: { type: String, trim: true },
    encabezado: { type: String },
    default: { type:Boolean}
})

module.exports = mongoose.model('whatsappTemplates', WhatsappSchema)

// public plantilla = {
//     account: '',
//     nombre: '',
//     cuerpo: '',
//     default: false
//   };