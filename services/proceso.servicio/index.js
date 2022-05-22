'use strict'

const Proceso = require('../../models/procesos.model')
const ObjectId = require('mongoose').Types.ObjectId

async function crear ( payload ) {
    try {

        const nombre = payload.nombre
        const lista = ObjectId( payload.lista )

        const existeProceso = await Proceso.findOne({
            nombre: nombre,
            lista: lista
        })

        if ( existeProceso ) {
            return {
                estatus: false,
                resultadoOperacion: 'Este proceso ya existe en esta lista'
            }
        }

        const nuevoProceso = new Proceso( payload )

        await nuevoProceso.save( )

        return {
            estatus: true,
            resultadoOperacion: 'Proceso creado'
        }

    } catch ( error ) {
        console.log("Proceso servicio: Crear Error ", JSON.stringify(error))
        return {
            estatus: false,
            resultadoOperacion: 'Error al crear el proceso',
            error: error
        }
    }
}

module.exports = {
    crear
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