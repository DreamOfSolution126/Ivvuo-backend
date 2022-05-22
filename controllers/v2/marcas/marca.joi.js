const joi = require('joi')

const crearSchema = joi.object().keys({
    activo: joi.boolean().required(),
    marca: joi.string().required(),
    cuentas: joi.array().optional().allow([]),
    centros: joi.array().optional().allow([]),
    logo: joi.object().keys({
        url: joi.string().required(),
    }).required(),
    pais: joi.object().keys({
        codigo: joi.string().optional().allow(''),
        nombre: joi.string().optional().allow('')
    }).required()
}).required()

const consultaPorIdSchema = joi.object().keys({
    id: joi.string().required()
}).required()

const actualizarSchema = joi.object().keys({
    _id: joi.string().required(),
    activo: joi.boolean().required(),
    marca: joi.string().required(),
    cuentas: joi.array().optional().allow([]),
    centros: joi.array().optional().allow([]),
    logo: joi.object().keys({
        url: joi.string().required(),
    }).required(),
    pais: joi.object().keys({
        codigo: joi.string().optional().allow(''),
        nombre: joi.string().optional().allow('')
    }).required(),
    __v: joi.number().optional().allow('')
}).required()

module.exports = {
    actualizarSchema,
    consultaPorIdSchema,
    crearSchema
}