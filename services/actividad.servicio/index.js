'use strict'

const Actividad = require('../../models/actividades.model')
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId

async function crear ( payload ) {
    try {

        const data = payload

        const nuevaActividad = new Actividad( data )

        const actividadCreada = await nuevaActividad.save()

        return {
            estatus: true,
            resultadoOperacion: 'Actividad creada',
            id: actividadCreada._id
        }

    } catch ( error ) {
        console.log("Actividad servicio: Crear Error ", JSON.stringify(error))
        return {
            estatus: false,
            resultadoOperacion:'Error al  crear la actividad',
            error: error
        }
    }
}

async function editar ( payload ) {
    try {
        const actividad = payload.data

        const id = ObjectId( data.id )

        const existeActividad = await Actividad.findById({ _id: id })

        if ( !existeActividad ) {
            return {
                estatus: false,
                resultadoOperacion: 'Esta actividad no existe'
            }
        }

        const { nombre, detalle, tipo, opcionesRespuesta, cotizacionItems, contizacion, indice, respuesta } = actividad

        const newActividad = {
            nombre: nombre ? nombre: existeActividad.nombre,
            detalle: detalle ? detalle: existeActividad.detalle,
            tipo: tipo ? tipo: existeActividad.tipo,
            opcionesRespuesta: opcionesRespuesta ? opcionesRespuesta: existeActividad.opcionesRespuesta,
            cotizacionItems: cotizacionItems ? cotizacionItems: existeActividad.cotizacionItems,
            contizacion: contizacion ? contizacion: existeActividad.contizacion,
            indice: indice ? indice: existeActividad.indice,
            respuesta: respuesta ? respuesta: existeActividad.respuesta,
        }

        await Actividad.findByIdAndUpdate( { _id: id }, newActividad )

        return {
            estatus: true,
            resultadoOperacion: 'Actividad actualizada con exito'
        }

    } catch ( error ) {
        console.log("Actividad servicio: Editar Error ", JSON.stringify(error))
        return {
            estatus: false,
            resultadoOperacion:'Error al  editar la actividad',
            error: error
        }
    }
}

async function eliminar ( payload ) {
    try {

        const id = payload.id

        const existeActividad = await Actividad.findById({_id: id})

        if ( !existeActividad ) {
            return {
                estatus: false,
                resultadoOperacion: 'Esta actividad no existe o ya fue eliminada'
            }
        }

        await Actividad.findByIdAndRemove({ _id: id })

        return {
            estatus: true,
            resultadoOperacion: 'Actvidad eliminada con exito'
        }

    } catch ( error ) {
        console.log("Actividad servicio: eliminar Error ", JSON.stringify(error))
        return {
            estatus: false,
            resultadoOperacion:'Error al  eliminar la actividad',
            error: error
        }
    }
}

// async function obtener ( payload ) {
//     try {

//         const data = payload

//     } catch ( error ) {
//         console.log("Actividad servicio: obtener Error ", JSON.stringify(error))
//         return {
//             estatus: false,
//             resultadoOperacion:'Error al  eliminar la actividad',
//             error: error
//         }
//     }
// }

module.exports = {
    crear,
    editar,
    eliminar
}