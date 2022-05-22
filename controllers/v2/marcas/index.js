'use strict'
const joi = require('joi')
const { actualizarSchema, consultaPorIdSchema, crearSchema } = require('./marca.joi')
const Marca = require('../../../models/marcas.model')
const Centro = require('../../../models/center')
const Ordenes = require('../../../models/works_orders')
const mime = require('mime');
const xl = require('excel4node')
const ObjectId = require('mongoose').Types.ObjectId
const moment = require('moment-timezone')


const crear = async ( req, res ) => {
    try {

        const data = req.body
        const validar = joi.validate( data, crearSchema )

        if ( validar.error ) {
            return res.status(400).send({
                estatus: false,
                resultadoOperacion: 'Datos invalidos'
            })
        }

        const existeMarca = await Marca.findOne({ marca: data.marca })
        if ( existeMarca ) {
            return res.status(500).send({
                estatus: false,
                resultadoOperacion: 'Esta marca ya existe'
            })
        }


        const nuevaMarca = new Marca( data )
        await nuevaMarca.save()

        return res.status(200).send({
            estatus: true,
            resultadoOperacion: 'Marca creada con exito'
        })


    } catch ( error ) {
        res.status(500).send({
            estatus: false,
            resultadoOperacion: 'Error al crear la marca'
        })
    }
}

const consulta = async ( req, res ) => {
    try {
        const marcas = await Marca.find({}).sort({ marca: 1})

        return res.status(200).send({
            estatus: true,
            resultadoOperacion: 'Marcas obtenidas',
            data: marcas
        })

    } catch ( error ) {
        res.status(500).send({
            estatus: false,
            resultadoOperacion: 'Error al consultar marcas'
        })
    }
}

const consultaPorId = async ( req, res ) => {
    try {
        const data = req.body;
        const validar = joi.validate( data, consultaPorIdSchema )

        if ( validar.error ) {
            return res.status(400).send({
                estatus: false,
                resultadoOperacion: 'Datos invalidos',
                error: validar.error
            })
        }

        const id = ObjectId( data.id )
        const marca = await Marca.findById({ _id: id })

        if ( !marca ) {
            return res.status(404).send({
                estatus: false,
                resultadoOperacion: 'No se encontro esta marca'
            })
        }

        return res.status(200).send({
            estatus: true,
            resultadoOperacion: 'datos obtenidos',
            data: marca
        })


    } catch ( error ) {
        res.status(500).send({
            estatus: false,
            resultadoOperacion: 'Error al consultar la marca'
        })
    }
}

const actualizar = async ( req, res ) => {
    try {
        const data = req.body;
        const id = ObjectId( data._id )

        const validar = joi.validate( data, actualizarSchema )

        if ( validar.error ) {
            return res.status(400).send({
                estatus: false,
                resultadoOperacion: 'Datos invalidos',
                error: validar.error
            })
        }

        const existeMarca = await Marca.findById({ _id: id })
        if ( !existeMarca ) {
            return res.status({
                estatus: false,
                resultadoOperacion: 'Esta marca no existe o fue eliminada'
            })
        }

        const resultado = await Marca.findByIdAndUpdate({ _id: id }, data )

        return res.status(200).send({
            estatus: true,
            resultadoOperacion: 'Marca actualizada correctamente',
            resultado
        })

    } catch ( error ) {
        res.status(500).send({
            estatus: false,
            resultadoOperacion: 'Error al actualizar la marca',
            error: error
        })
    }
}

const consultaPorIdCentros = async ( req, res ) => {
    try {
        const data = req.body;
        const validar = joi.validate( data, consultaPorIdSchema )

        const id = ObjectId( data.id );
        const existeMarca = await Marca.findById({ _id: id })

        if ( !existeMarca ) {
            return res.status(404).send({
                estatus: false,
                resultadoOperacion: 'No existe esta marca o fue eliminada'
            })
        }

        const centros = await Centro.find({ _id: existeMarca.centros })

        return res.status(200).send({
            estatus: true,
            resultadoOperacion: 'Consulta exitosa',
            data: {
                datosMarca: existeMarca,
                datosCentros: centros
            }
        })

    } catch ( error ) {
        res.status(500).send({
            estatus: false,
            resultadoOperacion: 'Error al consultar los Centros de servicio'
        })
    }
}

const reporteXls = async ( req, res ) => {

    const idMarca = req.params.id;
    const desde = req.query.desde ? new Date (req.query.desde) : new Date( moment( `${moment().format('YYYY-MM-')}01` ).format('YYYY-MM-DD') );
    const hasta = req.query.hasta ? new Date (req.query.hasta) : new Date( moment( `${moment().format('YYYY-MM-')}01` ).add(1, 'month').subtract(1, 'minute').format('YYYY-MM-DD'));

    const id = ObjectId( idMarca );
    
    let existeMarca
    
    try {
        existeMarca =  await Marca.findById({ _id: id })
    } catch (error) {
        return res.status(500).send({
            estatus: false,
            resultadoOperacion: 'Error al consultar los datos de la marca'
        })
    }

    if ( !existeMarca ) {
        return res.status(404).send({
            estatus: false,
            resultadoOperacion: 'No existe esta marca o fue eliminada'
        })
    }

    let ordenes

    try {
        ordenes = await Ordenes.find({ 
            centerId: existeMarca.centros,
            create: { $gte: desde, $lte: hasta }
        }).limit(0)
    } catch ( error ) {
        return res.status(500).send({
            estatus: false,
            resultadoOperacion: 'Error al consultar los centros de '
        })
    }

    try {

        const wb = new xl.Workbook()

        const ws = wb.addWorksheet(`Reportes Ordenes`);

        const style = wb.createStyle({
            font: {
                // color: '#FF0800',
                size: 12,
            },
            numberFormat: '#,##0.00; (#,##0.00); -'
        });

        // Set Encabezados

        ws.cell(1, 1).string( 'CENTRO SERVICIO' ).style(style);
        ws.cell(1, 2).string( '# ORDEN' ).style(style);
        ws.cell(1, 3).string( 'FECHA' ).style(style);
        ws.cell(1, 4).string( 'HORA' ).style(style);
        ws.cell(1, 5).string( 'CREADO POR' ).style(style);
        ws.cell(1, 6).string( 'MARCA' ).style(style);
        ws.cell(1, 7).string( 'MODELO' ).style(style);
        ws.cell(1, 8).string( 'ANO' ).style(style);
        ws.cell(1, 9).string( 'PLACA' ).style(style);
        ws.cell(1, 10).string( 'VIN' ).style(style);
        ws.cell(1, 11).string( 'KILOMETRAJE' ).style(style);

        ws.cell(1, 12).string( 'TOTAL COTIZADO' ).style(style);
        ws.cell(1, 13).string( 'TOTAL APROBADO' ).style(style);
        ws.cell(1, 14).string( 'TOTAL RECHAZADO' ).style(style);

        ws.cell(1, 15).string( 'ENVIADO' ).style(style);
        ws.cell(1, 16).string( 'FECHA ENVIO' ).style(style);
        ws.cell(1, 17).string( 'TIEMPO ENVIO (Minutos)' ).style(style);

        ws.cell(1, 18).string( 'VISTO POR CLIENTE' ).style(style);
        ws.cell(1, 19).string( 'TOTAL VISTAS' ).style(style);

        ws.cell(1, 20).string( 'LINK' ).style(style);

        ws.cell(1, 21).string( 'TOTAL REPUESTOS COTIZADOS' ).style(style);
        ws.cell(1, 22).string( 'TOTAL REPUESTOS APROBADOS' ).style(style);
        ws.cell(1, 23).string( 'TOTAL REPUESTOS RECHAZADOS' ).style(style);

        ws.cell(1, 24).string( 'TOTAL MANO OBRA COTIZADOS' ).style(style);
        ws.cell(1, 25).string( 'TOTAL MANO OBRA APROBADOS' ).style(style);
        ws.cell(1, 26).string( 'TOTAL MANO OBRA RECHAZADOS' ).style(style);

        ws.cell(1, 27).string( 'TOTAL TERCEROS COTIZADOS' ).style(style);
        ws.cell(1, 28).string( 'TOTAL TERCEROS APROBADOS' ).style(style);
        ws.cell(1, 29).string( 'TOTAL TERCEROS RECHAZADOS' ).style(style);




        ordenes.map( (i, index) => {
            ws.cell(index + 2, 1).string( i.center ).style(style);
            ws.cell(index + 2, 2).string( i.id? i.id: i.or ).style(style);
            ws.cell(index + 2, 3).string( moment(i.create).tz('America/Bogota').format('DD-MM-YYYY') ).style(style);
            ws.cell(index + 2, 4).string( moment(i.create).tz('America/Bogota').format('hh:mm:ss a') ).style(style);

            ws.cell(index + 2, 5).string( i.creadoBy.nombres ).style(style);
            
            ws.cell(index + 2, 6).string( i.brand ).style(style);
            ws.cell(index + 2, 7).string( i.model ).style(style);
            ws.cell(index + 2, 8).string( i.year ).style(style);

            ws.cell(index + 2, 9).string( i.plate ).style(style);
            ws.cell(index + 2, 10).string( i.vin ).style(style);
            ws.cell(index + 2, 11).string( i.kiolometers ).style(style);


            ws.cell(index + 2, 12).number( i.total ).style(style);
            ws.cell(index + 2, 13).number( i.total_approve ).style(style);
            ws.cell(index + 2, 14).number( i.total_ban ).style(style);

            ws.cell(index + 2, 15).string( i.send_to_customer ? 'ENVIADO' : 'NO ENVIADO' ).style(style);
            ws.cell(index + 2, 16).string( i.send_to_customer ? moment(i.date_send).tz('America/Bogota').format('DD-MM-YYYY hh:mm:ss a') : '' ).style(style);
            ws.cell(index + 2, 17).number( i.send_to_customer ? moment(i.date_send).diff(i.create, 'minute', true) : 0 ).style(style);

            ws.cell(index + 2, 18).string( i.vistasCliente.unica.estatus ? 'VISTO' : 'NO VISTO').style(style);
            ws.cell(index + 2, 19).number( i.vistasCliente.vistasTotales ).style(style);

            ws.cell(index + 2, 20).link( i.shortUrl ? i.shortUrl : 'n/a' ).style(style);

            ws.cell(index + 2, 21).number( i.parts ).style(style);
            ws.cell(index + 2, 22).number( i.parts_approve ).style(style);
            ws.cell(index + 2, 23).number( i.parts_ban ).style(style);

            ws.cell(index + 2, 24).number( i.mo ).style(style);
            ws.cell(index + 2, 25).number( i.mo_approve ).style(style);
            ws.cell(index + 2, 26).number( i.mo_ban ).style(style);

            ws.cell(index + 2, 27).number( i.tercero ).style(style);
            ws.cell(index + 2, 28).number( i.tercero_aprobado ).style(style);
            ws.cell(index + 2, 29).number( i.tercero_rechazado ).style(style);

        } )

        wb.write( `${existeMarca.marca.toUpperCase()} ${moment().format('DD-MM-YYYY hh:mm:ss a')}.xlsx`, res )


        
    } catch ( error ) {
        res.status(500).send({
            estatus:false,
            resultadoOperacion: 'Error al enviar el reporte'
        })
    }
    
}

module.exports = {
    actualizar,
    consulta,
    consultaPorId,
    consultaPorIdCentros,
    reporteXls,
    crear
}