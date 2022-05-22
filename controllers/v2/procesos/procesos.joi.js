const joi = require('joi')

const crearProcesoSchema = joi.object().keys({
    lista: joi.string().required(),
    cuenta: joi.string().required(),
    icono: joi.object().keys({
        nombre: joi.string().required(),
        html: joi.string().required(),
    }).required(),
    nombre: joi.string().required(),
    descripcion: joi.string().optional().allow(''),
    avance: joi.number().optional().allow(''),
    notificaciones: joi.object().keys({
        cuandoEsteTerminado: joi.boolean.optional().allow(''),
        cuandoInicie: joi.boolean.optional().allow(''),
    }).required(),
    asignado: joi.array().required()
}).required()

module.exports = {
    crearProcesoSchema
}

// lista: { type: Schema.Types.ObjectId, ref: Lista },
// cuenta: { type: Schema.Types.ObjectId, ref: Cuenta },
// icono: { 
//     nombre: { type: String },
//     html: { type: String }
// },
// nombre: { type: String, trim: true },
// descripcion: { type: String, trim: true, default: '' },
// avance: { type: Number, default: 0 },
// notificaciones: {
//     cuandoEsteTerminado: { type: Boolean, default: false },
//     cuandoInicie: { type: Boolean, default: false },
// },
// asignado: [
//     { 
//         nombres: { type:String },
//         email:{ type:String }, 
//         id:{ type:String },
//     }
// ]