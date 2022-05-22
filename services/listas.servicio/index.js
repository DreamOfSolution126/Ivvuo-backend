'use strict'

const Lista = require('../../models/listas.model')
const Proceso = require('../../models/procesos.model')
const Actividad = require('../../models/actividades.model')
const ObjectId = require('mongoose').Types.ObjectId

async function crear ( payload ) {
    try {

        const data = payload
        const idCuenta = ObjectId( data.cuenta )
        
        const existeLista = await Lista.findOne({ 
            nombre: data.nombre,
            cuenta: idCuenta
        })

        if ( existeLista ) {
            return {
                estatus: false,
                resultadoOperacion: 'Este listado ya existe'
            }
        }

        const newListado = new Lista( data )
        await newListado.save()

        return {
            estatus: true,
            resultadoOperacion:'Listado creado'
        }


    } catch ( error ) {
        console.log("Lista servicio: Crear Error ", JSON.stringify(error))
        return {
            estatus: false,
            resultadoOperacion:'Error al  crear la lista',
            error: error
        }
    }
}

async function editar ( payload ) {
    try {

        const id = Object( payload.id )
        const lista = payload.data

        const existeLista = await Lista.findById({_id: id })

        if ( !existeLista ) {
            return {
                estatus: false,
                resultadoOperacion: 'Esta lista no existe o fue eliminada'
            }
        }

        const { nombre, descripcion } = lista

        const newLista = {
            nombre: nombre ? nombre : existeLista.nombre,
            descripcion: descripcion ? descripcion : existeLista.descripcion
        }

        await Lista.findByIdAndUpdate({_id: id}, newLista )

        return {
            estatus: true,
            resultadoOperacion: 'Listado editado con exito'
        }

    } catch ( error ) {
        console.log("Lista servicio: Editar Error ", JSON.stringify(error))
        return {
            estatus: false,
            resultadoOperacion:'Error al  editar la lista',
            error: error
        }
    }
}

async function elimnar ( payload ) {
    try {

        const id  = ObjectId( payload.id )

        const existeLista = await Lista.findById({ _id: id })

        if ( !existeLista ) {
            return {
                estatus: false,
                resultadoOperacion: 'Esta lista no existe o ya fue eliminada'
            }
        }

        await Proceso.deleteMany({ lista: id })

        await Actividad.deleteMany({ lista: id })

        return {
            estatus: true,
            resultadoOperacion: 'Listado eliminado con exito'
        }

    } catch ( error ) {
        console.log("Lista servicio: Eliminar Error ", JSON.stringify(error))
        return {
            estatus: false,
            resultadoOperacion:'Error al  eliminar la lista',
            error: error
        }
    }
}

async function obtenerListasPorCuenta ( payload ) {
    try {

        
        const idCuenta = ObjectId( payload.cuenta )
        const listados = await Lista.find({
            cuenta: idCuenta
        })

        return {
            estatus: true,
            resultadoOperacion: 'Listas obtenidas',
            listas: listados
        }

    } catch ( error ) {
        console.log("Lista servicio: Eliminar Error ", JSON.stringify(error))
        return {
            estatus: false,
            resultadoOperacion:'Error al  obtenerListasPorCuenta',
            error: error
        }
    }
}

module.exports = {
    crear,
    editar,
    elimnar,
    obtenerListasPorCuenta
}