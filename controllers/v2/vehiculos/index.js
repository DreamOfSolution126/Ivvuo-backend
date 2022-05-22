'use strict'

const Vehiculo = require( '../../../services/vehiculo.servicio')

const Joi = require('joi')
const { editarVehiculoSchema, obtenerPorPlacaSchema, vehiculoSchema, obtenerPorIdSchema } = require('./vehiculo.joi')

async function crear ( req, res ) { 
    try {

        const data = req.body

        const validacion = Joi.validate( data, vehiculoSchema )

        if( validacion.error ) {
            return res.status(402).send({
                estatus: false,
                resultadoOperacion: 'Payload Inválido',
                val: validacion.error
            })
        }

        const respuesta = await Vehiculo.crear( data )

        res.status( 200 ).send( respuesta )

    } catch ( error ) {
        return res.status(500).send({
            estatus: true,
            error: error
        })
    }
}

async function editar ( req, res ) { 
    try {

        const data = req.body

        const validacion = Joi.validate( data, editarVehiculoSchema )

        if( validacion.error ) {
            return res.status(402).send({
                estatus: false,
                resultadoOperacion: 'Payload Inválido',
                val: validacion.error
            })
        }

        const respuesta = await Vehiculo.editar( data )

        res.status( 200 ).send( respuesta )

    } catch ( error ) {
        return res.status(500).send({
            estatus: true,
            error: error
        })
    }
}

async function obtenerPorPlaca ( req, res ) {
    try {

        const data = req.body

        const validacion = Joi.validate( data,  obtenerPorPlacaSchema)

        if( validacion.error ) {
            return res.status(402).send({
                estatus: false,
                resultadoOperacion: 'Payload Inválido',
                val: validacion.error
            })
        }

        const respuesta = await Vehiculo.obtenerPorPlaca( data )

        res.status(200).send( respuesta )

    } catch ( error ) {
        return res.status(500).send({
            estatus: true,
            error: error
        })
    }
}

async function obtenerPorId ( req, res ) {
    try {

        const data = req.body

        const validacion = Joi.validate( data, obtenerPorIdSchema )

        if( validacion.error ) {
            return res.status(402).send({
                estatus: false,
                resultadoOperacion: 'Payload Inválido',
                val: validacion.error
            })
        }

        const respuesta = await Vehiculo.obtenerPorId( data )

        res.status(200).send( respuesta )

    } catch ( error ) {
        return res.status(500).send({
            estatus: true,
            error: error
        })
    }
}

module.exports = {
    crear, 
    editar,
    obtenerPorId,
    obtenerPorPlaca
}