const joi = require('joi')

const vehiculoSchema = joi.object().keys({
    ano: joi.string().optional().allow(''),
    creado: joi.string().optional().allow(''),
    placa: joi.string().required(),
    marca: joi.string().optional().allow(''),
    linea: joi.string().optional().allow(''),
    version: joi.string().optional().allow(''),
    vin: joi.string().optional().allow(''),
    motor: joi.object().keys({
        cilindrada: joi.string().optional().allow(''),
        combustible: joi.string().optional().allow(''),
        tipoCaja: joi.string().optional().allow('')
    }).optional(),
    cliente: joi.string().required().allow(''),
    cuenta: joi.string().required(),
    centro: joi.string().required(),
    soat: joi.object().keys({
        fechaVencimiento: joi.string().optional().allow(''),
        frecuenciaMeses: joi.number().optional().allow(''),
        notificar: joi.boolean().optional()
    }).optional(),
    cambioAceite: joi.object().keys({
        fechaUltimo: joi.string().optional().allow(''),
        frecuenciaMeses: joi.number().optional().allow(''),
        notificar: joi.boolean().optional(),
    }).optional(),
    mantenimiento: joi.object().keys({
        kilometraje: joi.number().optional().allow(''),
        fechaUltimo: joi.string().optional().allow(''),
        frecuenciaMeses: joi.number().optional().allow(''),
        notificar: joi.boolean().optional()
    }).optional()
}).required()

const obtenerPorPlacaSchema = joi.object().keys({
    placa: joi.string().required(),
    cuenta: joi.string().required()
}).required()

const crearVehiculo = joi.object().keys({
    placa: joi.string().required(),
    cuenta: joi.string().required(),
}).required()

const obtenerPorIdSchema = joi.object().keys({
    id: joi.string().required()
}).required()

const editarVehiculoSchema = joi.object().keys({
    id: joi.string().required(),
    data: joi.object().required()
}).required()

module.exports = {
    crearVehiculo,
    editarVehiculoSchema,
    obtenerPorIdSchema,
    obtenerPorPlacaSchema,
    vehiculoSchema
}