'use strict'

const Vehiculo = require('../../models/vehiculos.model')
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId


async function crear ( payload ) {
    try {
        
        const vehiculo = payload; 
        const cuentaId = vehiculo.cuenta

        const existeVehiculo = await Vehiculo.findOne({
            placa: vehiculo.placa,
            cuenta: cuentaId,
        })

        if(existeVehiculo) {
            return {
                estatus: false,
                resultadoOperacion: 'Vehiculo ya existe',
                id: existeVehiculo._id
            }
        }

        const nuevoVehiculo = new Vehiculo( vehiculo )

        const vehiculoCreado = await nuevoVehiculo.save()

        return {
            estatus: true,
            resultadoOperacion:'Vehiculo creado',
            id: vehiculoCreado._id
        }
    } catch ( error ) {
        console.log("Vehiculo servicio: Error Crear", JSON.stringify(error))
        return {
            estatus: false,
            resultadoOperacion: 'Error al crear el vehiculo',
            error: error
        }
    }
}

async function editar ( payload ) {
    try {

        const idVehiculo = ObjectId( payload.id )
        const data = payload.data
        const existeVehiculo = await Vehiculo.findById({ _id: idVehiculo })

        if ( !existeVehiculo ) {
            return {
                estatus: false,
                resultadoOperacion: 'Este vehiculo no existe o fué eliminado'
            }
        }

        const { ano, cuenta, placa, marca, linea, version, vin, motor, soat, cambioAceite, mantenimiento } = data;

        const cuentaId = ObjectId( cuenta )
        if ( placa !== existeVehiculo.placa ) {
            const vehiculoNoDisponible = await Vehiculo.findOne({
                cuenta: cuentaId,
                placa: placa
            })

            if ( vehiculoNoDisponible ) {
                return {
                    estatus: false,
                    id: vehiculoNoDisponible._id,
                    resultadoOperacion: 'Esta placa pertenece a otro vehiculo'
                }
            }
        }

        const newVehiculo = {
            ano: ano? ano : existeVehiculo.ano,
            placa: placa? placa : existeVehiculo.placa,
            marca: marca? marca : existeVehiculo.marca,
            linea: linea? linea : existeVehiculo.linea,
            version: version? version : existeVehiculo.version,
            vin: vin? vin : existeVehiculo.vin,
            motor: motor? motor : existeVehiculo.motor,
            soat: soat? soat : existeVehiculo.soat,
            cambioAceite: cambioAceite? cambioAceite : existeVehiculo.cambioAceite,
            mantenimiento: mantenimiento? mantenimiento : existeVehiculo.mantenimiento,
        }

        await Vehiculo.findByIdAndUpdate({ _id: idVehiculo }, newVehiculo )

        return {
            estatus: true,
            resultadoOperacion: 'Cliente actualizado'
        }

    } catch ( error ) {
        console.debug("Vehiculo servicio Error: Editar ", JSON.stringify( error ) )
        return {
            estatus: false,
            resultadoOperacion: 'Error al editar el vehiculo',
            error: error
        }
    }
}

async function obtenerPorPlaca ( payload ) {
    try { 
        
        const data = payload
        const cuentaId = ObjectId( data.cuenta )
        const placa = data.placa

        const existeVehiculo = await Vehiculo.findOne({ placa: placa, cuenta: cuentaId })
        
        if ( !existeVehiculo ) {
            return {
                estatus: false,
                resultadoOperacion: 'No se econtro vehiculo'
            }
        }
        return {
            estatus: true,
            resultadoOperacion: 'Se encontro vehiculo',
            data: existeVehiculo
        }

    } catch ( error ) {
        console.debug("Vehiculo servicio Error: Obtener Por Placa ", JSON.stringify( error ) )
        return {
            estatus: false,
            resultadoOperacion: 'Error al obtener el vehiculo',
            error: error
        }
    }
}

async function obtenerPorId ( payload ) {
    try {

        const idVehiculo = ObjectId( payload.id )

        const existeVehiculo = await Vehiculo.findById( {_id: idVehiculo } )

        if (!existeVehiculo) {
            return {
                estatus: false,
                resultadoOperacion: 'No se encontró información'
            }
        }

        return {
            estatus: true,
            resultadoOperacion: 'Vehiculo encontrado',
            vehiculo: existeVehiculo
        }

    } catch ( error ) {
        console.debug("Vehiculo servicio Error: Obtener Por Id ", JSON.stringify( error ) )
        return {
            estatus: false,
            resultadoOperacion: 'Error al obtener el vehiculo',
            error: error
        }
    }
}

module.exports = {
    crear,
    editar,
    obtenerPorPlaca,
    obtenerPorId
}