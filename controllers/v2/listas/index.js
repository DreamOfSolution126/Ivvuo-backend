'use strict'

const ListaService = require('../../../services/listas.servicio')
const {
    crearListadoSchema,
    editarListadoSchema,
    eliminarListadoSchema,
    obtenerListasPorCuentaSchema,
    enviarMensajeRestablecerContrasenaSchema 
} = require('./lista.joi')
const joi = require('joi')

async function crear ( req, res ) {
    try {

        const data = req.body
        const validacion = joi.validate( data, crearListadoSchema )

        if ( validacion.error ) {
            return res.status(402).send({
                estatus: false,
                resultadoOperacion: 'Datos inválidos',
                val: validacion.error
            })
        }

        const respuesta = await ListaService.crear( data )

        return res.status(200).send( respuesta )

    } catch ( error ) {
        return res.status(500).send({
            estatus: false,
            resultadoOperacion: 'Error al crear el listado',
            error: error
        })
    }
}

async function editar ( req, res ) {
    try {

        const data = req.body
        const validacion = joi.validate( data, editarListadoSchema )

        if ( validacion.error ) {
            return {
                estatus: false,
                resultadoOperacion: 'Payload invalido',
                val: validacion.error
            }
        }

        const respuesta = await ListaService.editar( data )

        return res.status(200).send( respuesta )

    } catch ( error ) {
        return res.status(500).send({
            estatus: false,
            resultadoOperacion: 'Error al editar el listado',
            error: error
        })
    }
}

async function eliminar ( req, res ) {
    try {

        const data = req.body
        const validacion = joi.validate( data, eliminarListadoSchema )

        if ( validacion.error ) {
            return {
                estatus: false,
                resultadoOperacion: 'Payload invalido',
                val: validacion.error
            }
        }

        const respuesta = await ListaService.elimnar( data )

        return res.status(200).send( respuesta )

    } catch ( error ) {
        return res.status(500).send({
            estatus: false,
            resultadoOperacion: 'Error al eliminar el listado',
            error: error
        })
    }
}

async function obtenerListasPorCuenta ( req, res ) {
    try {

        
        const data = req.body
        const validacion = joi.validate( data, obtenerListasPorCuentaSchema )

        if ( validacion.error ) {
            return {
                estatus: false,
                resultadoOperacion: 'Payload invalido',
                val: validacion.error
            }
        }

        const respuesta = await ListaService.obtenerListasPorCuenta( data )

        return res.status(200).send( respuesta )

    } catch ( error ) {
        return res.status(500).send({
            estatus: false,
            resultadoOperacion: 'Error al obtener el listado',
            error: error
        })
    }
}



module.exports = {
    crear,
    editar,
    eliminar,
    obtenerListasPorCuenta
}