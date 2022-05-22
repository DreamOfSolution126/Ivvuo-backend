'use strict'

const Ordenes = require('../../models/ordenes.model')
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId

async function crear ( payload ) {
    try {

        let or = payload.or
        const cuenta = payload.cuenta
        const centro = payload.centro
        const numeroAutomatico = payload.numeroAutomatico
        
        if( numeroAutomatico ) {
            
            const cantidadOrdenes = await Ordenes.countDocuments({
                cuenta: cuenta,
                centro: centro
            })
            const codigo = Date.now()

            const numeroGenerado = { arg: '' }
            numeroGenerado.arg += codigo.toString()
            numeroGenerado.arg += '-'
            numeroGenerado.arg += parseInt(cantidadOrdenes + 1).toString()
            or = numeroGenerado.arg
            payload.or = or
        }

        const existeOrden = await Ordenes.findOne({
            or: or,
            cuenta: cuenta,
            centro: centro
        })

        if( existeOrden ) {
            return {
                estatus: false,
                data: {
                    id: existeOrden._id
                },
                resultadoOperacion: 'Esta orden ya existe'
            }
        }

        console.log( 'Crear Orden payload: ', payload )

        const nuevaOrden = new Ordenes( payload )

        await nuevaOrden.save()

        return {
            estatus: true,
            resultadoOperacion: 'Orden creada'
        }

    } catch ( error ) {
        console.log("Orden servicio: Error ", JSON.stringify(error))
        return {
            estatus: false,
            resultadoOperacion: 'Error al crear la orden',
            error: error
        }
    }
}

async function obtener ( payload ) {
    try {

        const id = ObjectId( payload.id )
        const existeOrden = await Ordenes.findById({ _id: id })

        if( !existeOrden ) {
            return {
                estatus: false,
                resultadoOperacion: 'No se encontro informacion'
            }
        }

        return {
            estatus: true,
            resultadoOperacion: 'Orden obtenida con exito',
            orden: existeOrden
        }

    } catch ( error ) {
        console.error( 'ORDENES SERVICIO: OBTENER', error )
        return {
            estatus: false,
            resultadoOperacion: 'Error al obtener la orden'
        }
    }
}

async function editar ( payload ) {
    try {
        const id = ObjectId( payload.id )
        const data = payload.data;
        const existeOrden = await Ordenes.findById({ _id: id })

        if( !existeOrden ) {
            return {
                estatus: false,
                resultadoOperacion: 'No se encontro informacion'
            }
        }

        const { cliente, vehiculo, listas, solicitudes, cotizaciones, recogida, comunicaciones, recepcionCliente } = data

        const nuevaOrden = {
            cliente: cliente? cliente : existeOrden.cliente,
            vehiculo: vehiculo? vehiculo : existeOrden.vehiculo,
            listas: listas? listas : existeOrden.listas,
            solicitudes: solicitudes? solicitudes : existeOrden.solicitudes,
            cotizaciones: cotizaciones? cotizaciones : existeOrden.cotizaciones,
            recogida: recogida? recogida : existeOrden.recogida,
            comunicaciones: comunicaciones? comunicaciones : existeOrden.comunicaciones,
            recepcionCliente: recepcionCliente? recepcionCliente : existeOrden.recepcionCliente
        }

        await Ordenes.findByIdAndUpdate({ _id: id }, nuevaOrden )

        return {
            estatus: true,
            resultadoOperacion: 'Actualizacion exitosa'
        }

    } catch ( error ) {
        console.error( 'ORDENES SERVICIO: EDITAR', error )
        return {
            estatus: false,
            resultadoOperacion: 'Error al editar la orden'
        }
    }
}

async function listado ( payload ) {
    try {
        const salto = payload.salto
        const limite = payload.limite
        const centro = ObjectId( payload.centro )
        const usuario = payload.id

        const existeOrdenes = await Ordenes.find( {
            centro: centro
        } ).sort( { create: 1 })

        return {
            estatus: true,
            ordenes: existeOrdenes,
            resultadoOperacion: 'Listado obtenido con exito'
        }

    } catch ( error ) {
        console.error( 'ORDENES SERVICIO: LISTADO', error )
        return {
            estatus: false,
            resultadoOperacion: 'Error al editar la orden'
        }
    }
}

module.exports = {
    crear,
    editar,
    listado,
    obtener
}