'use strict'

const joi = require('joi')

const clienteSchema = joi.object().keys({
    creado: joi.string().optional().allow(''),
    creadoDesdeZonaCliente: joi.boolean().required(),
    centro: joi.string().optional().allow(''),
    cuenta: joi.string().required(),
    contrasena: joi.string().optional().allow(''),
    email: joi.string().optional().allow(''),
    identificacion: joi.object().keys({
        numero: joi.string().required(),
        tipo: joi.string().required(),
    }).required(),
    nombre: joi.object().keys({
        apellidos: joi.string().optional().allow(''),
        nombres: joi.string().optional().allow(''),
        tratamiento: joi.string().optional().allow(''),
        razonSocial: joi.string().optional().allow('')
    }).required(),
    orden: joi.string().optional().allow(''),
    telefono: joi.object().keys({
        codigoPais: joi.string().optional().allow(''),
        numero: joi.string().optional().allow(''),
        celular: joi.string().optional().allow(''),
    }).required(),
    direcciones: joi.array().required()
}).required()

const identificacionSchema = joi.object().keys({
    identificacion: joi.string().required(),
    cuenta: joi.string().required()
}).required()

const editarSchema = joi.object().keys({
    id: joi.string().required(),
    data: joi.object().required()
}).required()

const obtenerSchema = joi.object().keys({
    id: joi.string().required()
})

const registroClienteZonaClienteSchema = joi.object().keys({

        orden: joi.string().optional().allow(''),
        centro: joi.string().optional().allow(''),
        creado: joi.string().optional().allow(''),
        contrasena: joi.string().required(),
        cuenta: joi.string().required(),
        email: joi.string().email().required(),
        identificacion: joi.object().keys({
          tipo: joi.string().required(),
          numero: joi.string().required()
        }).required(),
        nombre: {
          nombres: joi.string().required().allow(''),
          apellidos: joi.string().required().allow(''),
          razonSocial: joi.string().required().allow(''),
          tratamiento: joi.string().optional().allow('')
        },
        telefono: joi.object().keys({
          codigoPais: joi.string().optional().allow(''),
          celular: joi.string().optional().allow(''),
          numero: joi.string().optional().allow(''), 
        }).required(),
        direcciones: joi.array().optional(),
        creadoDesdeZonaCliente: joi.boolean().default( true )
      
}).required()

const iniciarSesionSchema = joi.object().keys({
    cuenta: joi.string().required(),
    identificacion: joi.object().keys({
        tipo: joi.string().required(),
        numero: joi.string().required()
    }).required(),
    contrasena: joi.string().required(),
    aceptarTerminosyCondiciones: joi.boolean().required()
}).required()

const autenticarZonaClienteSchema = joi.object().keys({
    token: joi.string().required()
}).required()

const enviarMensajeRestablecerContrasenaSchema = joi.object().keys({
    email: joi.string().required(),
    cuenta: joi.string().required(),
    identificacion: joi.object().keys({
        tipo: joi.string().required(),
        numero: joi.string().required(),
    }).required()
}).required()

const cambiarContrasenaZonaClienteSchema = joi.object().keys({
    contrasena: joi.string().required(),
    token: joi.string().required()
}).required()


module.exports = {
    autenticarZonaClienteSchema,
    cambiarContrasenaZonaClienteSchema,
    clienteSchema,
    editarSchema,
    enviarMensajeRestablecerContrasenaSchema,
    iniciarSesionSchema,
    obtenerSchema,
    identificacionSchema,
    registroClienteZonaClienteSchema,
}