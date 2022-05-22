const joi = require('joi')

const setAnySchema = joi.object().keys({
    _id: joi.string().required(),
    activityIndex: joi.number().required(),
    processIndex: joi.number().required(),
    setName: joi.string().required(),
    value: joi.array().items({
        _id: joi.string().optional().allow(''),
        url: joi.string().optional().allow(''),
        type: joi.string().optional(),
        name: joi.string().optional(),
        date: joi.string().optional(),
        cargado: joi.object().optional(),
        text: joi.string().optional()
    })
}).required()

module.exports = {
    setAnySchema
}