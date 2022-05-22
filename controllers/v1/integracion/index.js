'use strict'

const WorkOrders = require('../../../models/works_orders')
const Cuenta = require('../../../models/account')
const Centro = require('../../../models/center')
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId
const Joi = require('joi')
const schemas = require('./orden.model')
const TYPES = require('../../../services/types')
const { TIPO_ITEM_COTIZACION, CLASIFICAR_POR } = require('../../../models/enum');
const moment = require('moment-timezone')

function crearOrdenTrabajo ( req, res, next ) {
    
    let data = req.body 

    data.accountId = ObjectId(data.accountId)
    data.centerId = ObjectId(data.centerId)
    data.id = data.or
    data.key = `${data.account_code}-${data.center_code}-${data.or}` 
    data.process = []
    data.create = Date.now( moment().tz('America/Bogota').format )
    data.plate = data.plate.toUpperCase();
    
    // Espacio para crear la Orden
    const order = new WorkOrders(data)

    order.save( (e, result) => {
        if(e) return res.status(500).send({
            error:'ERP CrearOrden: Error al guardar la orden',
            data: e
        })
        req.body = {
            accion: TYPES.TYPES.SETSHORLINK,
            orden:result
        };
        next()
    } )
}

function validarOrdenDuplicada ( req, res, next ) {
    let data = req.body 
    const validacionPayload = Joi.validate(data, schemas.orderTrabajoSchema)
    

    if(validacionPayload.error){
        return res.status(422).send({
            error:'ERP CrearOrden: Error en la validacion del payload',
            data: validacionPayload.error
        })
    } else { 
        data.accountId = ObjectId(data.accountId)
        data.centerId = ObjectId(data.centerId)
        
        WorkOrders.find({ 
            or: data.or,
            accountId: data.accountId,
            centerId: data.centerId
        }, ( e, result ) => {
            if(e) return res.status(500).send({
                error:'ERP CrearOrden: Error al validar si la orden ya existe',
            })
            if(result && result.length>0) {
                    return res.status(200).send({
                    data:{
                        msg: 'ERP CrearOrden: Esta orden ya existe'
                    }
                })
            } else {
                next()
            }
        })
    }
}

function obtenerDatosCuenta ( req, res, next ) {
    let data = req.body
    const id = ObjectId( data.accountId )
    const codigoCuenta = data.account_code

    Cuenta.findOne( { 
        _id: id, 
        code:codigoCuenta,
    }, ( e, result) => {
        if( e ) return res.status(500).send({
            error: 'ERP CrearOrden: Error al obtener la información de la cuenta'
            
        })
        if(!result) return res.status(500).send({
            error: 'ERP CrearOrden: No se encontró esta Cuenta'
        })
        let or = req.body
        or = {
            ...or,
            account: result.name,
            account_code: result.code,
            city_account: result.city,
            address_account: result.addres,
            nit_account: result.nit,
            telephone_account: result.telephone,
            logo: result.logo,
            country_account: result.country
        }
        
        req.body = or
        next()
    } )
}

function obtenerDatosCentro ( req, res, next ) {
    let data = req.body
    const id = ObjectId( data.centerId )
    const codigoCentro = data.center_code

    Centro.findOne({ _id: id, code: codigoCentro}, ( e, result) => {
        if( e ) return res.status(500).send({
            error: 'ERP CrearOrden: Error al obtener la información del centro de servicio'
        })
        if(!result) return res.status(500).send({
            error: 'ERP CrearOrden: No se encontró este centro de servicio'
        })

        let or = req.body
        or = {
            ...or,
            center_code: result.code,
            center: result.name,
            informacionCentro: {
                direccion: result.direccion.direccion,
                ciudad: `${result.direccion.ciudad} ${result.direccion.pais}`,
                telefono: `${result.telefono.indicativo} ${result.telefono.numero}`
            },
            notas: result.notas
        }

        req.body = or
        next()
    })
}

const agregarCotizaciones = async ( req, res ) => {

    const data = req.body;
    const idCentro = ObjectId( data.centerId );
    const orden = data.orden;

    const validacion = Joi.validate( data, schemas.agregarCotizacionesSchema )

    const valorTotal = data.valorUnitario * data.cantidad
    if(validacion.error){
        return res.status(400).send({
            error:'ERP CrearOrden: Error en la validacion del payload',
            data: validacion.error
        })
    }

    let existeOrden;
    try {
        existeOrden = await WorkOrders.findOne(
            {
                $or:[
                    { or: orden },
                    { id: orden }
                ],
                $and: [
                    { centerId: idCentro }
                ]
            }
        )

    } catch ( error ) {
        return res.status(500).send({
            estatus: false,
            resultadoOperacion: 'Ocurrio un error al buscar la cotizacion',
            error: error
        })
    }

    if (!existeOrden) {
        return res.status(404).send({
            estatus: false,
            resultadoOperacion: 'Esta orden no existe. no es posible agregar la cotizacion a una orden no existente'
        })
    }
    // Proceso por defecto
    const proceso = {
        key: true,
        id: 'customProcess',
        listid: '5df6cc56eb05d6000410b530',
        account_code: 'AC001',
        icon: '<i class="fas fa-thumbtack"></i>',
        name: 'Diagnóstico',
        description: 'Solicitudes del cliente',
        weight: 100,
        index: 0,
        notifyCustomer: true,
        advanceValue: 0,
        checkList:[]
    }

    let existeActividad = false;
    // Valida si el proceso existe, si no existe lo crea
    if ( existeOrden.process[0].key ) {
        
        existeOrden.process[0].checkList.map( i => {
            if ( i.esCotizacion && data.clasificarPor === CLASIFICAR_POR.ACTIVIDAD ) {
                existeActividad = true
            } else if ( i.item === data.grupo && data.clasificarPor === CLASIFICAR_POR.GRUPO ) {
                existeActividad = true
            }
        } )

    } else {

        existeOrden.process.unshift( proceso )
    }

    const actividad = {
        item: 'Cotización',
        esCotizacion: true,
        id: parseInt(Date.now()),
        details: 'Hemos estimado un presupuesto.',
        asnwer_options: [
            {
                value: 2,
                answer: 'Ok'
            },
            {
                value: 1,
                answer: 'Regular'
            },
            {
                value: 0,
                answer: 'Urgente'
            },
            {
                value: 99,
                answer: 'N/A'
            }
        ],
        answer: {
            value: 0,
            answer: 'Urgente'
        },
        attach: [],
        comments: [],
        parts: 0,
        mo: 0,
        total: 0,
        approved: '',
        listId: '',
        processId: 'customProcess',
        account_code: '',
        weight: 100,
        type: 'inspection',
        quotation: {
            parts: [],
            mo: []
        },
        resQuotation: {
            status: false,
            date: '',
            block: false
        },
        cotizacion: [],
        seeCustomer: true,
        index: 0
    }

    if (data.clasificarPor === CLASIFICAR_POR.GRUPO ) {
        actividad.item = data.grupo
    }

    if (!existeActividad) {
        existeOrden.process[0].checkList.unshift( actividad )
    }

    let existeReferencia;

    existeOrden.process[0].checkList.map( ( i ) => {

        if ( i.esCotizacion && data.clasificarPor === CLASIFICAR_POR.ACTIVIDAD ) {

            existeReferencia = i.cotizacion.find( j => {
                if ( data.referencia === j.referencia ) {
                    return j
                }
            } )

            // console.log('Existe referencia: ', existeReferencia )

            if ( !existeReferencia ) {
            
                i.cotizacion.push({
                    tipo: data.tipo,
                    descripcion: data.descripcion,
                    referencia: data.referencia,
                    codigoDeParte: data.codigoDeParte,
                    cantidad: data.cantidad,
                    valorUnitario: data.valorUnitario,
                    valorTotal: valorTotal
                })
            }
            
        } else if ( i.item === data.grupo && data.clasificarPor === CLASIFICAR_POR.GRUPO ) {
            existeReferencia = i.cotizacion.find( j => {
                if ( data.referencia === j.referencia ) {
                    return j
                }
            } )

            // console.log('Existe referencia: ', existeReferencia )

            if ( !existeReferencia ) {
            
                i.cotizacion.push({
                    tipo: data.tipo,
                    descripcion: data.descripcion,
                    referencia: data.referencia,
                    codigoDeParte: data.codigoDeParte,
                    cantidad: data.cantidad,
                    valorUnitario: data.valorUnitario,
                    valorTotal: valorTotal
                })
            }
        }
    })

    if ( existeReferencia ) {
        return res.status(200).send({
            estatus: false,
            resultadoOperacion: `La referencia: ${data.referencia} ya ha sigo agregada`
        })
    }

    existeOrden.total = 0;
    existeOrden.mo = 0;
    existeOrden.parts = 0;
    existeOrden.tercero = 0;

    existeOrden.process.map( i => {

        i.checkList.map( j => {
            j.total = 0;
            j.parts = 0;
            j.tercero = 0;
            j.mo = 0;
            if ( j.cotizacion ) {

                j.cotizacion.map( k => {

                    if ( k.tipo === TIPO_ITEM_COTIZACION.REPUESTO) {
                        existeOrden.parts += k.valorTotal
                        existeOrden.total += k.valorTotal
                        j.total += k.valorTotal
                        j.parts += k.valorTotal
                    }
    
                    if ( k.tipo === TIPO_ITEM_COTIZACION.MANO_OBRA) {
                        existeOrden.mo += k.valorTotal
                        existeOrden.total += k.valorTotal
                        j.total += k.valorTotal
                        j.mo += k.valorTotal
                    }
    
                    if ( k.tipo === TIPO_ITEM_COTIZACION.TERCERO) {
                        existeOrden.tercero += k.valorTotal
                        existeOrden.total += k.valorTotal
                        j.total += k.valorTotal
                        j.tercero += k.valorTotal
                    }
                })
            }
        } )
    } )

    try {
        await WorkOrders.findByIdAndUpdate({ _id: ObjectId( existeOrden._id ) }, existeOrden )
        
    } catch (error) {
        return res.status(500).send({
            estatus: false,
            resultadoOperacion: 'Ocurrio un error al actulizar la orden'
        })
    }

    return res.status(200).send({
        estatus: true,
        resultadoOperacion: 'Se agregado la cotizacion a la orden',
        orden: existeOrden.process[0]
    })
} 

module.exports = {
    agregarCotizaciones,
    crearOrdenTrabajo,
    obtenerDatosCentro,
    obtenerDatosCuenta,
    validarOrdenDuplicada
}