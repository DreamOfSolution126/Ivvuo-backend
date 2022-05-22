'use strict'

const joi = require('joi')

const orderTrabajoSchema = joi.object().keys({
    or: joi.string().required(),
    // create: joi.string().required(),
    name: joi.string().optional().allow(''),
    last_name: joi.string().optional().allow(''),
    kiolometers: joi.string().optional().allow(''),
    nit: joi.string().optional().allow(''),
    email: joi.string().optional().allow(''),
    telephone: joi.string().optional().allow(''),
    plate: joi.string().optional().allow(''),
    model: joi.string().optional().allow(''),
    brand: joi.string().optional().allow(''),
    year: joi.string().optional().allow(''),
    vin: joi.string().optional().allow(''),
    accountId: joi.string().required(),
    centerId: joi.string().required(),
    center_code: joi.string().required(),
    account_code: joi.string().required()
}).required()

const agregarCotizacionesSchema = joi.object().keys({
    clasificarPor: joi.number().required(),
    actividad: joi.string().optional().allow(''),
    grupo: joi.string().optional().allow(''),
    tipo: joi.string().required(),
    referencia: joi.string().required(),
    descripcion: joi.string().required(),
    codigoDeParte: joi.string().optional().allow(''),
    cantidad: joi.number().required(),
    valorUnitario: joi.number().required(),
    valorTotal: joi.number().required(),
    orden: joi.string().required(),
    accountId: joi.string().required(),
    centerId: joi.string().required(),
    center_code: joi.string().required(),
    account_code: joi.string().required(),
}).required()

module.exports = {
    agregarCotizacionesSchema,
    orderTrabajoSchema
}