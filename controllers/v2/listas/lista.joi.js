const joi = require('joi')

const crearListadoSchema = joi.object().keys({
    creado: joi.string().required(),
    nombre: joi.string().required(),
    descripcion: joi.string().required(),
    cuenta: joi.string().required()
}).required()

const editarListadoSchema = joi.object().keys({
    id: joi.string().required(),
    data: joi.object().required()
}).required()

const eliminarListadoSchema = joi.object().keys({
    id: joi.string().required()
}).required()

const obtenerListasPorCuentaSchema = joi.object().keys({
    cuenta: joi.string().required()
}).required()




module.exports = {
    crearListadoSchema,
    editarListadoSchema,
    eliminarListadoSchema,
    obtenerListasPorCuentaSchema
}