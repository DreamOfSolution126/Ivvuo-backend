'use strict'

const ProcesoService = require('../../../services/proceso.servicio')
const { crearProcesoSchema } = require('./procesos.joi')
const joi = require('joi')

async function crear ( req, res ) {
    try {
        const data = req.body
        const validacion = joi.validate( data, crearProcesoSchema)

        if ( validacion.error ) {
            return res.status(402).send({
                estatus: false,
                resultadoOperacion: 'Datos inválidos',
                val: validacion.error
            })
        }

        const respuesta = await ProcesoService.crear( data )

        return res.status(200).send( respuesta )

    } catch ( error ) {
        console.error('PROCESO CONTROLADOR: CREAR', error )
        return res.status(500).send({
            estatus: false,
            resultadoOperacion: 'Error al crear la orden'
        })
    }
}

module.exports = {
    crear
}