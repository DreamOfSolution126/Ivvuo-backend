'use strict'

const ClienteService = require('../../../services/cliente.servicio')
const CuentaService = require('../../../services/cuenta.servicio')
const { 
    autenticarZonaClienteSchema,
    cambiarContrasenaZonaClienteSchema,
    clienteSchema, 
    editarSchema,
    iniciarSesionSchema,
    obtenerSchema,
    identificacionSchema,
    registroClienteZonaClienteSchema ,
    enviarMensajeRestablecerContrasenaSchema
} = require('./cliente.joi')
const Joi = require('joi')

async function crear ( req, res ) {
    try {

        const data = req.body

        const validacion = Joi.validate( data, clienteSchema )

        if( validacion.error ) {
            return res.status(402).send({
                estatus: false,
                resultadoOperacion: 'Datos inválidos',
                val: validacion.error
            })
        }

        
        const respuestaCuenta = await CuentaService.obtener( { id: data.cuenta } )

        if ( respuestaCuenta.estatus ) {
            data.telefono.codigoPais = respuestaCuenta.cuenta.phone_code.toString()
        }

        const cliente = await ClienteService.crear( data )

        return res.status(200).send( cliente )

    } catch ( error ) {
        return res.status(500).send({
            estatus: false,
            resultadoOperacion: 'Error al crear el cliente',
            error: error
        })
    }
}

async function obtenerPorId ( req, res ) {
    try {
        const data = req.body

        const validacion = Joi.validate( data, obtenerSchema )

        if( validacion.error ) {
            return res.status(402).send({
                estatus: false,
                resultadoOperacion: 'Datos inválidos',
                val: validacion.error
            })
        }

        const respuesta = await ClienteService.obtenerPorId( data )

        return res.status(200).send( respuesta )

    } catch ( error ) {
        console.error ('CLIENTE CONTROLADOR: OBTENER POR ID ', error );
        return res.status(500).send({
            estatus: false,
            resultadoOperacion: 'Error al obtener el cliente',
            error: error
        })
    }
}

async function editar ( req, res ) {
    try {
        const data = req.body
        const validacion = Joi.validate( data, editarSchema )

        if( validacion.error ) {
            return res.status(402).send({
                estatus: false,
                resultadoOperacion: 'Datos inválidos',
                val: validacion.error
            })
        }

        const respuesta = await ClienteService.editar( data )

        return res.status(200).send( respuesta )        

    } catch ( error ) {
        console.error ('CLIENTE CONTROLADOR: EDITAR ', error );
        return res.status(500).send({
            estatus: false,
            resultadoOperacion: 'Error al obtener el cliente',
            error: error
        })
    }
}

async function obtener ( req, res ) {
    try {
        const data = req.body
        const validacion = Joi.validate( data, identificacionSchema )

        if( validacion.error ) {
            return res.status(402).send({
                estatus: false,
                resultadoOperacion: 'Datos inválidos',
                val: validacion.error
            })
        }

        const respuesta = await ClienteService.obtener( data )

        return res.status(200).send( respuesta )        

    } catch ( error ) {
        console.error ('CLIENTE CONTROLADOR: OBTENER ', error );
        return res.status(500).send({
            estatus: false,
            resultadoOperacion: 'Error al obtener el cliente',
            error: error
        })
    }
}

async function registroClienteZonaCliente ( req, res ) {
    try {
        const data = req.body
        const validacion = Joi.validate( data, registroClienteZonaClienteSchema )

        if( validacion.error ) {
            return res.status(402).send({
                estatus: false,
                resultadoOperacion: 'Datos inválidos',
                val: validacion.error
            })
        }

        const respuesta = await ClienteService.registroClienteZonaClientes( data )

        return res.status(200).send( respuesta )        

    } catch ( error ) {
        console.error ('CLIENTE CONTROLADOR: registroClienteZonaCliente ', error );
        return res.status(500).send({
            estatus: false,
            resultadoOperacion: 'Error al obtener el cliente',
            error: error
        })
    }
}

async function iniciarSesion ( req, res ) { 
    try {
        const data = req.body
        const validacion = Joi.validate( data, iniciarSesionSchema )

        if( validacion.error ) {
            return res.status(402).send({
                estatus: false,
                resultadoOperacion: 'Datos inválidos',
                val: validacion.error
            })
        }

        const respuesta = await ClienteService.iniciarSesion( data )

        return res.status(200).send( respuesta )        

    } catch ( error ) {
        console.error ('CLIENTE CONTROLADOR: iniciarSesion ', error );
        return res.status(500).send({
            estatus: false,
            resultadoOperacion: 'Error al iniciar sesion',
            error: error
        })
    }
}

async function autenticarZonaCliente ( req, res, next ) {
    try {

        const data = req.body;
        const validacion = Joi.validate( data, autenticarZonaClienteSchema )

        if( validacion.error ) {
            return res.status(402).send({
                estatus: false,
                resultadoOperacion: 'Datos inválidos',
                val: validacion.error
            })
        }

        const respuesta = await ClienteService.autenticar( data )

        if ( !respuesta.estatus ) {
            return res.status(200).send({
                estatus: false,
                resultadoOperacion: 'Usuario no autenticado'
            })
        }

        req.body = respuesta.cliente
        next()

    } catch ( error ) {
        console.error ('CLIENTE CONTROLADOR: autenticarZonaCliente ', error );
        return res.status(500).send({
            estatus: false,
            resultadoOperacion: 'Error al autenticarZonaCliente',
            error: error
        })
    }
}

async function enviarMensajeRestablecerContrasena (req, res ) {
    try {

        const data = req.body;
        const validacion = Joi.validate( data, enviarMensajeRestablecerContrasenaSchema)

        if ( validacion.error ) {
            return {
                estatus: false,
                resultadoOperacion: 'Payload invalido',
                val: validacion.error
            }
        }

        const respuesta = await ClienteService.enviarMensajeRestablecerContrasena( data )

        return res.status(200).send( respuesta )

    } catch ( error ) {
        return res.status(500).send({
            estatus: false,
            resultadoOperacion: 'Error al enviar el email de instrucciones',
            error: error
        })
    }
}

async function cambiarContrasenaZonaCliente (req, res ) {
    try {

        const data = req.body;
        const validacion = Joi.validate( data, cambiarContrasenaZonaClienteSchema)

        if ( validacion.error ) {
            return {
                estatus: false,
                resultadoOperacion: 'Payload invalido',
                val: validacion.error
            }
        }

        const respuesta = await ClienteService.cambiarContrasenaZonaCliente( data )

        return res.status(200).send( respuesta )

    } catch ( error ) {
        return res.status(500).send({
            estatus: false,
            resultadoOperacion: 'Error al enviar el email de instrucciones',
            error: error
        })
    }
}

module.exports = {
    autenticarZonaCliente,
    cambiarContrasenaZonaCliente,
    crear,
    editar,
    enviarMensajeRestablecerContrasena,
    iniciarSesion,
    obtener,
    obtenerPorId,
    registroClienteZonaCliente
}