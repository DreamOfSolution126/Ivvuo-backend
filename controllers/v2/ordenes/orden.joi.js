'use strict'
const Joi = require('joi')

const ordenSchema = Joi.object().keys({
    or: Joi.string().required(),
    create: Joi.string().required(),
    
    cliente: Joi.string().required(),
    vehiculo: Joi.string().required(),

    cuenta: Joi.string().required(),
    centro: Joi.string().required(),
    
    listas: Joi.array().required().allow([]),
    solicitudes: Joi.array().required().allow([]),
    cotizaciones: Joi.array().required().allow([]),

    recogida: Joi.object().required(),

    comunicaciones: Joi.object().keys({
        smsEnviado: Joi.array().required().allow([]),
        emailEnviado: Joi.array().required().allow([]),
    }).required()

}).required()

const crearOrdenSchema = Joi.object().keys({
    cuenta: Joi.string().required(),
    centro: Joi.string().required(),
    create: Joi.string().required(),
    creadoPor: Joi.object().keys({
        nombres: Joi.string().required(),
        email: Joi.string().required(),
        id: Joi.string().required(),
    }).required(),
    or: Joi.string().required().when( 'numeroAutomatico', { is: Joi.valid( true ), then: Joi.valid('') } ),
    placa: Joi.string().required().allow(''),
    numeroAutomatico: Joi.boolean().required(),
    identificacion: Joi.object().keys({
        tipo: Joi.string().required().allow(''),
        numero: Joi.string().required().allow('')
    }).required()
}).required()

const obternerOrdenSchema = Joi.object().keys({
    id: Joi.string().required()
}).required()

const editarOrdenSchema = Joi.object().keys({
    id: Joi.string().required(),
    data: Joi.object().required()
}).required()

const obtenerOrdenesListados = Joi.object().keys({
    centro: Joi.string().required(),
    salto: Joi.number().optional().allow(''),
    limite: Joi.number().optional().allow(''),
    usuario: Joi.string().optional().allow('')
}).required()

module.exports = {
    crearOrdenSchema,
    editarOrdenSchema,
    obternerOrdenSchema,
    obtenerOrdenesListados,
    ordenSchema
}