'use strict'

/**
 * Editar Orden
 */

const Orden = require('../../../models/works_orders')

const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId

const TYPES = require('../../../services/types')

async function editarOrden ( req, res, next ) {
    const data = req.body
    const id = ObjectId( data.orden._id )

    // Construir payload
    let payload = await construirPayload(data.accion, data.payload)


    // res.status(200).send(data)
    Orden.findByIdAndUpdate( {_id: id}, { $set: payload }, ( e, result ) => {
        if( e ) return res.status(500).send({
            error:`EditarOrden: ${data.accion}: Error`,
            data: e
        })
        res.status(200).send({
            data:{
                msg:`EditarOrden: ${data.accion}: Exitosa`,
                payload
            }
        })
    })
}

async function construirPayload (accion, data ) {
    let payload = {}
    switch(accion) {

        case TYPES.TYPES.SETSHORLINK:
            payload["shortUrl"] = data.shortUrl
        return payload

        default: return payload
    }
}

module.exports = {
    editarOrden
}
