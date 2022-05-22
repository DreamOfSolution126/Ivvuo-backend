'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema
const Account = require('../models/account')
const Center = require('../models/center')
const Marca = require('../models/marcas.model')
const bcrypt = require('bcrypt-nodejs')
const crypto = require('crypto')
const { ROL, TIPO_DOCUMENTO, CATEGORIA_LICENCIA } = require('./enum')
const moment = require('moment-timezone')


const UserSchema = new Schema({
    active: {type: Boolean, default:true },
    account: [{type: Schema.ObjectId, ref:Account}],
    centers: [{type: Schema.ObjectId, ref:Center}],
    email: { type:String, unique: true, lowercase: true },
    last_name: {type:String, lowercase: true},
    identificacion: {
        tipo: { type: String, enum:[
            TIPO_DOCUMENTO.CEDULA_CIUDADANIA,
            TIPO_DOCUMENTO.CEDULA_EXTRANJERIA,
            TIPO_DOCUMENTO.NIT,
            TIPO_DOCUMENTO.PASAPORTE,
        ], default: TIPO_DOCUMENTO.CEDULA_CIUDADANIA },
        numero: { type: String, default: '' }
    },
    imagenPerfil: {
        url: { type: String, default: 'https://ivvuo.com/assets/img/default/user.png' },
        extension: { type: String, default: 'png' }
    },
    lastLogin: { type: Date, default: moment().tz('America/Bogota').format() },
    name: {type:String, lowercase: true},
    marca: { type: String, default: '' },
    password: { type:String, select: true },
    
    role: { type: String, enum: [
        ROL.ADMINISTRADOR_CUENTA,
        ROL.CENTRO_SERVICIO,
        ROL.MANAGER,
        ROL.REPRESENTANTE_MARCA
    ], default: ROL.CENTRO_SERVICIO },
    singupDate: { type: Date, default: moment().tz('America/Bogota').format() },
    perfilConductor: {
        estatus: { type: Boolean, default: false },
        licencia: {
            tipo: { type: String, enum:[
                CATEGORIA_LICENCIA.A1,
                CATEGORIA_LICENCIA.A2,
                CATEGORIA_LICENCIA.B1,
                CATEGORIA_LICENCIA.B2,
                CATEGORIA_LICENCIA.B3,
                CATEGORIA_LICENCIA.C1,
                CATEGORIA_LICENCIA.C2,
                CATEGORIA_LICENCIA.C3,
                ''
            ], default: CATEGORIA_LICENCIA.C3 },
            numero: { type: String, default: '' },
            fechaExpedicion: { type: String, default: '' }
        }
    },
    accesos: {
        tableroControl: { type: Boolean, default: true },
        reporteActividades: { type: Boolean, default: false }
    }
})

UserSchema.pre('save', function (next){
    let user = this
    
    if(!user.isModified('password')) return next()

    bcrypt.genSalt(10, (err, salt)=>{
        if(err) return next(err)

        bcrypt.hash(user.password, salt, null, (err, hash)=>{
            if(err) return next(err)
            user.password = hash
            next()
        })
    })
})


UserSchema.methods.comparePass = function(password, cb){
    bcrypt.compare(password, this.password, (err, isMacht)=>{
        if(err) {return cb(err);}
        return cb(null, isMacht)
    })
}


module.exports = mongoose.model('User', UserSchema)

