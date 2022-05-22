'use strict'

const mongoose = require('mongoose')

const Schema = mongoose.Schema;

const WhatsAppSchema = new Schema({
    sid: { type: String },
    direccion: { type: String },
    estatusMensaje: { type:String },
    mensaje: { type: String },
    fecha_creacion: { type: Date },
    fecha_enviado: { type: Date },
    fecha_actualizacion: { type: Date },

    de: { type: String },
    para: { type: String }
})

module.exports = mongoose.model('whatsapp', WhatsAppSchema)
