'use strict'

const Cuenta = require('../../models/account')
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId

async function obtener ( payload ) {
    try {

        const id = ObjectId( payload.id )

        const existeCuenta = await Cuenta.findById({ _id: id })

        if ( !existeCuenta ) {
            return {
                estatus: false,
                resultadoOperacion: 'No se encontro informacion'
            }
        }

        return {
            estatus: true,
            cuenta: existeCuenta,
            resultadoOperacion: 'Se encontro informacion'
        }

    } catch ( error ) {
        console.log("Cuenta servicio: Error Obtener ", error)
        return {
            estatus: false,
            resultadoOperacion: 'Error al crear la orden',
            error: error
        }
    }
}

module.exports = {
    obtener
}