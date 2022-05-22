const Joi = require('joi')

const asignarListadoSchema = Joi.object().keys({
    idOrden: Joi.string().required(),
    idLista: Joi.string().required()
}).required()

module.exports = {
    asignarListadoSchema
}