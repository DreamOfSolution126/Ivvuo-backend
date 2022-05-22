
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId
const Ordenes = require('../../../models/works_orders');
const Cuentas = require('../../../models/account');
const Centros = require('../../../models/center');
const moment = require('moment-timezone');
const xl = require('excel4node')

const reporteActividades = async ( req, res ) => {

    const idCuenta = req.query.id;
    let desde
    let hasta
    if ( req.query.desde ) {
        
        desde = new Date( moment(req.query.desde, 'YYYY-MM-DD hh:mm a').format('YYYY-MM-DD hh:mm a') );
    } else {
        desde = new Date( moment( `${moment().format('YYYY-MM-')}01` ).format('YYYY-MM-DD') );
    }

    if ( req.query.hasta ) {
        hasta = new Date( moment(req.query.hasta, 'YYYY-MM-DD hh:mm a').add(1, 'day').format('YYYY-MM-DD hh:mm a') );
    } else {
        hasta = new Date( moment( `${moment().format('YYYY-MM-')}01` ).add(1, 'month').format('YYYY-MM-DD'));
    }
    let existeCuenta
    try {
        existeCuenta = await Cuentas.findById({ _id: idCuenta });
    } catch (error) {
        return res.status(500).send({
            estatus: false,
            resultadoOperacion: 'Error al consultar la cuenta',
            error: error
        })
    }
    

    if ( !existeCuenta || !existeCuenta.active ) {
        return res.status(401).send({
            estatus: false,
            resultadoOperacion: 'Esta cuenta fue desactivada'
        })
    }

    let actividades
    try {
        const id = ObjectId( idCuenta );
        actividades = await Ordenes.aggregate([
            { $match: { accountId: id }},
            { $match: { create: { $lte: hasta, $gte: desde }}},
            { $unwind: "$process"},
            { $unwind: "$process.checkList"},
            { $project: {
                cuenta: "$account",
                centro: "$center",
                id: "$id",
                or: "$or",
                placa: "$plate",
                vin: "$vin",
                linea: "$model",
                marca: "$brand",
                anoModelo: "$year",
                kilometraje: "$kiolometers",
                creado: "$create",

                nombreCliente: "$name",
                apellidoCliente: "$last_name",


                creadoPorNombre: "$creadoBy.nombres",
                creadoPorEmail: "$creadoBy.email",
                
                actividad: "$process.checkList.item",
                detalle: "$process.checkList.details",
                respuesta: "$process.checkList.answer.answer",
                codigoRespuesta: "$process.checkList.answer.value",

                total: "$process.checkList.total",
                manoObra: "$process.checkList.mo",
                repuestos: "$process.checkList.parts",
                terceros: "$process.checkList.terceros",

                aprobacion: "$process.checkList.resQuotation.status",
                link: "$shortUrl"
            }},
            { $match: { codigoRespuesta: { $in:[0, 1, 2, 99] } } }
        ]).sort( {"create": -1} )
    } catch (error) {
        return res.status(500).send({
            estatus: false,
            resultadoOperacion: 'Error al consultar los puntos de actividad',
            error: error
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

        // Encabezados


        ws.cell(1, 1).string( 'CUENTA' ).style(style);
        ws.cell(1, 2).string( 'CENTRO' ).style(style);
        ws.cell(1, 3).string( '# ORDEN' ).style(style);
        ws.cell(1, 4).string( '# ORDEN 2' ).style(style);
        ws.cell(1, 5).string( 'PLACA' ).style(style);
        ws.cell(1, 6).string( 'VIN' ).style(style);
        ws.cell(1, 7).string( 'LINEA' ).style(style);
        ws.cell(1, 8).string( 'MARCA' ).style(style);
        ws.cell(1, 9).string( 'ANO' ).style(style);
        ws.cell(1, 10).string( 'KILOMETRAJE' ).style(style);
        ws.cell(1, 11).string( 'FECHA' ).style(style);
        ws.cell(1, 12).string( 'HORA' ).style(style);

        ws.cell(1, 13).string( 'NOMBRE' ).style(style);
        ws.cell(1, 14).string( 'APELLIDO' ).style(style);

        ws.cell(1, 15).string( 'CREADO POR' ).style(style);
        ws.cell(1, 16).string( 'EMAIL USUARIO' ).style(style);

        ws.cell(1, 17).string( 'ACTIVIDAD' ).style(style);
        ws.cell(1, 18).string( 'DETALLE' ).style(style);
        ws.cell(1, 19).string( 'RESPUESTA' ).style(style);

        ws.cell(1, 20).string( 'COD. RESPUESTA' ).style(style);

        ws.cell(1, 21).string( 'TOTAL' ).style(style);

        ws.cell(1, 22).string( 'MANO OBRA' ).style(style);
        ws.cell(1, 23).string( 'REPUESTOS' ).style(style);
        ws.cell(1, 24).string( 'TERCEROS' ).style(style);

        ws.cell(1, 25).string( 'APROBACION' ).style(style);
        ws.cell(1, 26).string( 'LINK' ).style(style);

        actividades.map( (i, index) => {
            ws.cell(index + 2, 1).string( i.cuenta ? i.cuenta: '' ).style(style);
            ws.cell(index + 2, 2).string( i.centro ? i.centro: '' ).style(style);
            ws.cell(index + 2, 3).string( i.id? i.id: '' ).style(style);
            ws.cell(index + 2, 4).string( i.or? i.or: '' ).style(style);

            ws.cell(index + 2, 5).string( i.placa ? i.placa : '' ).style(style);
            ws.cell(index + 2, 6).string( i.vin ? i.vin: '' ).style(style);
            ws.cell(index + 2, 7).string( i.linea ? i.linea : '' ).style(style);
            ws.cell(index + 2, 8).string( i.marca ? i.marca : '' ).style(style);
            ws.cell(index + 2, 9).string( i.anoModelo ? i.anoModelo : '' ).style(style);
            ws.cell(index + 2, 10).string( i.kilometraje ? i.kilometraje : '' ).style(style);
            ws.cell(index + 2, 11).string( moment(i.creado).tz('America/Bogota').format('DD-MM-YYYY') ).style(style);
            ws.cell(index + 2, 12).string( moment(i.creado).tz('America/Bogota').format('hh:mm:ss a') ).style(style);

            ws.cell(index + 2, 13).string( i.nombreCliente ? i.nombreCliente : '' ).style(style);
            ws.cell(index + 2, 14).string( i.apellidoCliente ? i.apellidoCliente : '' ).style(style);

            ws.cell(index + 2, 15).string( i.creadoPorNombre ? i.creadoPorNombre : '' ).style(style);
            ws.cell(index + 2, 16).string( i.creadoPorEmail ? i.creadoPorEmail : '' ).style(style);

            ws.cell(index + 2, 17).string( i.actividad ? i.actividad : '' ).style(style);
            ws.cell(index + 2, 18).string( i.detalle ? i.detalle : '' ).style(style);
            ws.cell(index + 2, 19).string( i.respuesta ? Array.isArray(i.respuesta) ? 99: i.respuesta : '' ).style(style);
            ws.cell(index + 2, 20).number( i.codigoRespuesta ? Array.isArray(i.codigoRespuesta) ? 99: i.codigoRespuesta : 99 ).style(style);

            ws.cell(index + 2, 21).number( i.total ? i.total : 0 ).style(style);
            ws.cell(index + 2, 22).number( i.manoObra ? i.manoObra : 0 ).style(style);
            ws.cell(index + 2, 23).number( i.repuestos ? i.repuestos : 0 ).style(style);
            ws.cell(index + 2, 24).number( i.terceros ? i.terceros : 0 ).style(style);

            ws.cell(index + 2, 25).string( i.aprobacion ? i.aprobacion : '' ).style(style);
            ws.cell(index + 2, 26).string( i.link ? i.link : '' ).style(style);

        } )

        await wb.write( `${existeCuenta.name.toUpperCase()} ${moment().format('DD-MM-YYYY hh:mm:ss a')}.xlsx`, res )

    } catch (error) {
        return res.status(500).send({
            estatus:false,
            resultadoOperacion: 'Error al enviar el reporte',
            error: error
        })
    }
}

const reporteActividadesCentro = async (req, res ) => {
    const idCentros = JSON.parse(req.query.id);

    let desde
    let hasta
    if ( req.query.desde ) {
        
        desde = new Date( moment(req.query.desde, 'YYYY-MM-DD hh:mm a').format('YYYY-MM-DD hh:mm a') );
    } else {
        desde = new Date( moment( `${moment().format('YYYY-MM-')}01` ).format('YYYY-MM-DD') );
    }

    if ( req.query.hasta ) {
        hasta = new Date( moment(req.query.hasta, 'YYYY-MM-DD hh:mm a').add(1, 'day').format('YYYY-MM-DD hh:mm a') );
    } else {
        hasta = new Date( moment( `${moment().format('YYYY-MM-')}01` ).add(1, 'month').format('YYYY-MM-DD'));
    }


    let idConvertidos = [];
    for(let i of idCentros) {
        idConvertidos.push( ObjectId(i) )
    }
    console.log('IdCentro Convertidos: ', idConvertidos )

    let actividades
    try {
        // const id = ObjectId( idCentros );
        actividades = await Ordenes.aggregate([
            { $match: { centerId: { $in: idConvertidos } }},
            { $match: { create: { $lte: hasta, $gte: desde }}},
            { $unwind: "$process"},
            { $unwind: "$process.checkList"},
            { $project: {
                cuenta: "$account",
                centro: "$center",
                id: "$id",
                or: "$or",
                placa: "$plate",
                vin: "$vin",
                linea: "$model",
                marca: "$brand",
                anoModelo: "$year",
                kilometraje: "$kiolometers",
                creado: "$create",

                nombreCliente: "$name",
                apellidoCliente: "$last_name",


                creadoPorNombre: "$creadoBy.nombres",
                creadoPorEmail: "$creadoBy.email",
                
                actividad: "$process.checkList.item",
                detalle: "$process.checkList.details",
                respuesta: "$process.checkList.answer.answer",
                codigoRespuesta: "$process.checkList.answer.value",

                total: "$process.checkList.total",
                manoObra: "$process.checkList.mo",
                repuestos: "$process.checkList.parts",
                terceros: "$process.checkList.terceros",

                aprobacion: "$process.checkList.resQuotation.status",
                link: "$shortUrl"
            }},
            { $match: { codigoRespuesta: { $in:[0, 1, 2, 99] } } }
        ]).sort( {"create": -1} )
    } catch (error) {
        return res.status(500).send({
            estatus: false,
            resultadoOperacion: 'Error al consultar los puntos de actividad',
            error: error
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

        // Encabezados


        ws.cell(1, 1).string( 'CUENTA' ).style(style);
        ws.cell(1, 2).string( 'CENTRO' ).style(style);
        ws.cell(1, 3).string( '# ORDEN' ).style(style);
        ws.cell(1, 4).string( '# ORDEN 2' ).style(style);
        ws.cell(1, 5).string( 'PLACA' ).style(style);
        ws.cell(1, 6).string( 'VIN' ).style(style);
        ws.cell(1, 7).string( 'LINEA' ).style(style);
        ws.cell(1, 8).string( 'MARCA' ).style(style);
        ws.cell(1, 9).string( 'ANO' ).style(style);
        ws.cell(1, 10).string( 'KILOMETRAJE' ).style(style);
        ws.cell(1, 11).string( 'FECHA' ).style(style);
        ws.cell(1, 12).string( 'HORA' ).style(style);

        ws.cell(1, 13).string( 'NOMBRE' ).style(style);
        ws.cell(1, 14).string( 'APELLIDO' ).style(style);

        ws.cell(1, 15).string( 'CREADO POR' ).style(style);
        ws.cell(1, 16).string( 'EMAIL USUARIO' ).style(style);

        ws.cell(1, 17).string( 'ACTIVIDAD' ).style(style);
        ws.cell(1, 18).string( 'DETALLE' ).style(style);
        ws.cell(1, 19).string( 'RESPUESTA' ).style(style);

        ws.cell(1, 20).string( 'COD. RESPUESTA' ).style(style);

        ws.cell(1, 21).string( 'TOTAL' ).style(style);

        ws.cell(1, 22).string( 'MANO OBRA' ).style(style);
        ws.cell(1, 23).string( 'REPUESTOS' ).style(style);
        ws.cell(1, 24).string( 'TERCEROS' ).style(style);

        ws.cell(1, 25).string( 'APROBACION' ).style(style);
        ws.cell(1, 26).string( 'LINK' ).style(style);

        actividades.map( (i, index) => {
            ws.cell(index + 2, 1).string( i.cuenta ? i.cuenta: '' ).style(style);
            ws.cell(index + 2, 2).string( i.centro ? i.centro: '' ).style(style);
            ws.cell(index + 2, 3).string( i.id? i.id: '' ).style(style);
            ws.cell(index + 2, 4).string( i.or? i.or: '' ).style(style);

            ws.cell(index + 2, 5).string( i.placa ? i.placa : '' ).style(style);
            ws.cell(index + 2, 6).string( i.vin ? i.vin: '' ).style(style);
            ws.cell(index + 2, 7).string( i.linea ? i.linea : '' ).style(style);
            ws.cell(index + 2, 8).string( i.marca ? i.marca : '' ).style(style);
            ws.cell(index + 2, 9).string( i.anoModelo ? i.anoModelo : '' ).style(style);
            ws.cell(index + 2, 10).string( i.kilometraje ? i.kilometraje : '' ).style(style);
            ws.cell(index + 2, 11).string( moment(i.creado).tz('America/Bogota').format('DD-MM-YYYY') ).style(style);
            ws.cell(index + 2, 12).string( moment(i.creado).tz('America/Bogota').format('hh:mm:ss a') ).style(style);

            ws.cell(index + 2, 13).string( i.nombreCliente ? i.nombreCliente : '' ).style(style);
            ws.cell(index + 2, 14).string( i.apellidoCliente ? i.apellidoCliente : '' ).style(style);

            ws.cell(index + 2, 15).string( i.creadoPorNombre ? i.creadoPorNombre : '' ).style(style);
            ws.cell(index + 2, 16).string( i.creadoPorEmail ? i.creadoPorEmail : '' ).style(style);

            ws.cell(index + 2, 17).string( i.actividad ? i.actividad : '' ).style(style);
            ws.cell(index + 2, 18).string( i.detalle ? i.detalle : '' ).style(style);
            ws.cell(index + 2, 19).string( i.respuesta ? Array.isArray(i.respuesta) ? 99: i.respuesta : '' ).style(style);
            ws.cell(index + 2, 20).number( i.codigoRespuesta ? Array.isArray(i.codigoRespuesta) ? 99: i.codigoRespuesta : 99 ).style(style);

            ws.cell(index + 2, 21).number( i.total ? i.total : 0 ).style(style);
            ws.cell(index + 2, 22).number( i.manoObra ? i.manoObra : 0 ).style(style);
            ws.cell(index + 2, 23).number( i.repuestos ? i.repuestos : 0 ).style(style);
            ws.cell(index + 2, 24).number( i.terceros ? i.terceros : 0 ).style(style);

            ws.cell(index + 2, 25).string( i.aprobacion ? i.aprobacion : '' ).style(style);
            ws.cell(index + 2, 26).string( i.link ? i.link : '' ).style(style);

        } )

        // await wb.write( `${existeCentro.name.toUpperCase()} ${moment().format('DD-MM-YYYY hh:mm:ss a')}.xlsx`, res )
        await wb.write( `Reporte actividades ${moment().format('DD-MM-YYYY hh:mm:ss a')}.xlsx`, res )

    } catch (error) {
        return res.status(500).send({
            estatus:false,
            resultadoOperacion: 'Error al enviar el reporte',
            error: error
        })
    }
}

module.exports = {
    reporteActividades,
    reporteActividadesCentro
}