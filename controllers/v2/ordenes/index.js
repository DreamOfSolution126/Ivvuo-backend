const OrdenesService = require('../../../services/ordenes.servicio')
const ClienteService = require('../../../services/cliente.servicio')
const CuentaServicie = require('../../../services/cuenta.servicio')
const VehiculoService = require('../../../services/vehiculo.servicio')
const { crearOrdenSchema, obternerOrdenSchema, editarOrdenSchema, obtenerOrdenesListados } = require('./orden.joi')
const joi = require('joi')

async function crear ( req, res ) {
    try {

        let data = req.body
        const validacion = joi.validate( data, crearOrdenSchema )

        if( validacion.error ) {
            return res.status(402).send({
                estatus: false,
                resultadoOperacion: 'Datos inválidos',
                val: validacion.error
            })
        }

        const cliente = await ClienteService.obtener({
            identificacion: data.identificacion.numero,
            cuenta: data.cuenta
        })

        if( cliente.estatus ) {
            const { _id } = cliente.data
            data.cliente = _id.toString()
        } else {
            const datosCuenta = await CuentaServicie.obtener( {
                id: data.cuenta
            })

            const telefono = {
                celular: '',
                numero: '',
                codigoPais: datosCuenta.cuenta.phone_code.toString()
            }

            const clienteCreado = await ClienteService.crear( {
                identificacion: data.identificacion,
                cuenta: data.cuenta,
                telefono: telefono
            } )

            data.cliente = clienteCreado.id;
        }

        if ( data.placa ) {

            const placa = data.placa.toUpperCase()
            console.log('placa en controlodaor: ', placa )
            const vehiculo = await VehiculoService.obtenerPorPlaca({
                placa: placa,
                cuenta: data.cuenta
            })
    
            if ( vehiculo.estatus ) {
                const { _id } = vehiculo.data
                data.vehiculo = _id
            } else {
                const vehiculoCreado = await VehiculoService.crear({
                    placa: data.placa,
                    cuenta: data.cuenta
                })
    
                data.vehiculo = vehiculoCreado.id
            }

        }
        
        
        const respuesta = await OrdenesService.crear( data )

        return res.status(200).send( respuesta )

    } catch ( error ) {
        console.error('ORDEN CONTROLADOR: CREAR', error )
        return res.status(500).send({
            estatus: false,
            resultadoOperacion: 'Error al crear la orden'
        })
    }
}

async function editar ( req, res ) {
    try {
        const data = req.body
        const validacion = joi.validate( data, editarOrdenSchema )

        if ( validacion.error ) {
            return res.status(402).send({
                estatus: false,
                resultadoOperacion: 'Datos inválidos',
                val: validacion.error
            })
        }

        const respuesta = await OrdenesService.editar( data );

        return res.status(200).send( respuesta )

    } catch ( error ) {
        console.error('ORDEN CONTROLADOR: EDITAR', error )
        return res.status(500).send({
            estatus: false,
            resultadoOperacion: 'Error al editar la orden'
        })
    }
}

async function obtener ( req, res ) {
    try {

        const data = req.body
        const validacion = joi.validate( data, obternerOrdenSchema )

        if( validacion.error ) {
            return res.status(402).send({
                estatus: false,
                resultadoOperacion: 'Datos inválidos',
                val: validacion.error
            })
        }

        const respuesta = await OrdenesService.obtener( data )

        return res.status(200).send( respuesta )

    } catch ( error ) {
        console.error('ORDEN CONTROLADOR: OBTENER', error )
        return res.status(500).send({
            estatus: false,
            resultadoOperacion: 'Error al obtener la orden'
        })
    }
}

async function listado ( req, res ) {
    try {

        const data = req.body
        const validacion = joi.validate( data, obtenerOrdenesListados )

        if( validacion.error ) {
            return res.status(402).send({
                estatus: false,
                resultadoOperacion: 'Datos inválidos',
                val: validacion.error
            })
        }

        const respuesta = await OrdenesService.listado( data )

        return res.status(200).send( respuesta )

    } catch ( error ) {
        console.error('ORDEN CONTROLADOR: LISTADO', error )
        return res.status(500).send({
            estatus: false,
            resultadoOperacion: 'Error al obtener la orden'
        })
    }
}

module.exports = {
    crear,
    editar,
    listado,
    obtener
}