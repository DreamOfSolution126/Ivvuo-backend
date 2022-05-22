const Ordenes = require('../../../models/works_orders')
const Cuenta = require('../../../models/account')
const Whatsapp = require('../../../models/whatsapp.model')
const moment = require('moment')
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId
const { TIPO_ITEM_COTIZACION } = require('../../../models/enum')

const OrdenService = require('../../../services/ordenes.servicio')

const obtenerOrdenesTableroControl = async ( req, res ) => {
    try {

        let limit = req.body.limit;
        let skip = req.body.skip;
        let or = new RegExp( req.body.or, 'i');
        let vin = new RegExp( req.body.vin, 'i');
        let center_code = req.body.center_code;
        let plate = new RegExp(req.body.plate, 'i');
        let idUsuario = req.body.idUsuario ? req.body.idUsuario: 'Todos'


        if( idUsuario === 'Todos'){
            idUsuario = new RegExp('', 'i')
        }

        let dateInit
        let dateEnd
        if ( req.body.dateInit ) {
            
            dateInit = new Date( moment(req.body.dateInit, 'YYYY-MM-DD hh:mm a').tz('America/Bogota').format('YYYY-MM-DD hh:mm a') );
        } else {
            dateInit = new Date( moment( `${moment().format('YYYY-MM-')}01` ).tz('America/Bogota').format('YYYY-MM-DD') );
        }

        if ( req.body.dateEnd ) {
            dateEnd = new Date( moment(req.body.dateEnd, 'YYYY-MM-DD hh:mm a').tz('America/Bogota').add( 24, 'hours').format('YYYY-MM-DD hh:mm a') );
        } else {
            dateEnd = new Date( moment( `${moment().format('YYYY-MM-')}01` ).tz('America/Bogota').add(1, 'month').format('YYYY-MM-DD'));
        }

        if(dateInit > dateEnd) {
            return res.status(500).send({msg:'Este rango de fechas no es válido'})
        }

        const ordenes = await Ordenes.aggregate([
            { $match: { center_code: center_code } },
            { $match: { 
                create: {
                    $gte: dateInit,
                    $lte: dateEnd
                } } 
            },    
            { $match: { $or:[
                { or: or },
                { id: or }
            ] }},
            { $match: { vin: vin }},
            { $match: { plate: plate } },
            { $match: { $or:[ 
                { 'creadoBy.id': { $exists: false  } },
                { 'creadoBy.id': idUsuario }
             ] } },
            { $project: {
                whatsapp:{
                    idCuenta: "$accountId",
                    telefonoCliente: "$telephone",
                    mensajesNuevos: { $sum:0 }
                },
                emailEnviado:{
                    estatus: "$send_to_customer",
                    fecha: "$date_send"
                },
                estatus: "$status",
                fechaCreacion: "$create",
                id:"$id",
                or:"$or",
                totales: {
                    aprobado: "$total_approve",
                    cotizado: "$total",
                    rechazado: "$total_ban"
                },
                vehiculo:{
                    marca: "$brand",
                    linea: "$model",
                    placa: "$plate",
                    ano_modelo: "$year",
                    vin: "$vin"
                },
                vistasCliente: "$vistasCliente",
                procesos:"$process",
                nivelPrioridad:""
            }},
            { $sort: { fechaCreacion: -1 } },
            { $skip: skip },
            { $limit: limit }
        ])
        console.log('Ordenes: ', ordenes)

        ordenes.map( (i) => {
            i.nivelPrioridad = resumenNivelPrioridad(i.procesos)
        })
        
        ordenes.map( (i) => {
            i.procesos = avancesDelProceso(i.procesos)

        } )

        return res.status(200).send({ 
            data: ordenes,
            estatus: true,
            resultadoOperacion: 'Ordenes de trabajo obtenidas'
        })

    } catch ( error ) {
        console.log('Error: ', error )
        return res.status(500).send({ 
            data: [],
            estatus: false,
            resultadoOperacion: 'ocurrió un error al obtener las ordenes',
            error: error
        })

    }
}

const avancesDelProceso = ( proceso ) => {
    const resumenProceso = [];
    let avanceProceso = 0;
    let totalActividades = 0;
    

    if( !proceso ) return []
    proceso.map( ( i, index ) => {

        let asignadoA = ''

        if ( i.asignado && i.asignado.length > 0) {
    
            for ( let j =0; j < i.asignado.length; j ++ ) {

                asignadoA += i.asignado[j].nombres.toString().toUpperCase();
                if( j !== i.asignado.length -1) {
                    asignadoA += ', ';
                }
                
            }
        } else {
            asignadoA = 'Sin asignacion'
        }

        let actividadesCompletadas = 0
        let cantidadActividades = i.checkList.length;
        totalActividades +=  i.checkList.length;
        for(let j = 0; j < i.checkList.length; j++ ) {

            if (!i.checkList[j]) {

            } else {
                if(i.checkList[j].answer && i.checkList[j].answer.answer) {
                    actividadesCompletadas += 1;
                    avanceProceso += 1;
                }
            }
            
        }

        resumenProceso.push({
            asinado: asignadoA,
            icon: i.icon,
            nombre: i.name,
            cantidadActividades: cantidadActividades,
            advanceValue: actividadesCompletadas / cantidadActividades
        })
    } )

    return {
        avanceProceso: avanceProceso / totalActividades,
        totalActividades: totalActividades,
        actividadesTerminadas: avanceProceso,
        detalles:resumenProceso
    }
}

const resumenNivelPrioridad = ( proceso ) => {

    const nivelPrioridad = {
        urgente: 0,
        pronto: 0,
        normal: 0
    }

    proceso.map( (i)=> {

        if (!i) {
            // Hacer nada.
        } else {

            i.checkList.map( (j) => {

                if (j && j.answer) {
                    if ( j.answer.value === 0 ) {
                        nivelPrioridad.urgente += 1;
                    }
                    if ( j.answer.value === 1 ) {
                        nivelPrioridad.pronto += 1;
                    }
                    if ( j.answer.value === 2 ) {
                        nivelPrioridad.normal += 1;
                    }
                }
                
            } )
            
        }
        
    } )

    return nivelPrioridad
}

const obtenerNotificacionesWhastapp = async ( req, res ) => {
    try {
        const prefijoWhatsapp = 'whatsapp:+'
        const cuentaId = ObjectId(req.body.idCuenta)
        const datosCuenta = await Cuenta.findById({_id: cuentaId})
        const numeroClienteSinFormato = req.body.telefonoCliente

        const numeroCliente = (prefijoWhatsapp + datosCuenta.phone_code + numeroClienteSinFormato).toString()
        const numeroCuenta = (prefijoWhatsapp + datosCuenta.whatsapp.numero).toString()
        const notificaciones = await Whatsapp.countDocuments({ 
            direccion: 'Incoming',
            de: numeroCliente,
            para: numeroCuenta,
            estatusMensaje: { $ne:"read"}
         })
         
        return res.status(200).send({
            data: notificaciones,
            estatus: true,
            resultadoOperacion: 'Notificaciones Obtenidas con éxito'
        })

    } catch ( error ) {

        return res.status(500).send({
            data: 0,
            estatus: false,
            resultadoOperacion: 'Error al obtener las Notificaciones',
            error:error
        })
    }
}

const crearOrden = async ( req, res ) => {
    try {
        await OrdenService.crear( req.body )

        return res.status(200).send({
            data: notificaciones,
            estatus: true,
            resultadoOperacion: 'Se ha creado la Orden'
        })

    } catch ( error ) {
        console.log('Error crear orden', JSON.stringify(error))
        return res.status(500).send({ 
            data: [],
            estatus: false,
            resultadoOperacion: 'Ocurrió un error al crear la orden',
            error: error
        })
    }
}

const actualizarCotizacion = async ( req, res ) => {
    try {
        const data = req.body;
        const idOrden = ObjectId( data.idOrden );
        const actividad = data.actividad;
        const orden = await Ordenes.findById({ _id: idOrden })

        if ( !orden ) {
            return res.status(400).send({
                estatus: false,
                resultadoOperacion: 'Esta orden no existe',
                data:{
                    idOrde: idOrden,
                    actividad: actividad
                }
            })
        }

        // Asignar nueva cotizacion a la orden
        for ( let i of orden.process ) {
            for ( let j of i.checkList ) {
    
                if (j.id === actividad.id ) {
                    j.cotizacion = actividad.cotizacion
                }
            }
        }

        // Calcular cotizacion
        orden.total = 0;
        orden.mo = 0;
        orden.parts = 0;
        orden.tercero = 0;

        orden.process.map( i => {

            i.checkList.map( j => {
                j.total = 0;
                j.totalIva = 0;
                j.parts = 0;
                j.tercero = 0;
                j.mo = 0;

                if ( j.answer.value === 0 || j.answer.value === 1 ) {
                    if ( j.cotizacion ) {

                        j.cotizacion.map( k => {
    
                            if ( k.tipo === TIPO_ITEM_COTIZACION.REPUESTO) {
                                orden.parts += k.valorTotal
                                orden.total += k.valorTotal
                                j.total += k.valorTotal
                                j.parts += k.valorTotal
                            }
            
                            if ( k.tipo === TIPO_ITEM_COTIZACION.MANO_OBRA) {
                                orden.mo += k.valorTotal
                                orden.total += k.valorTotal
                                j.total += k.valorTotal
                                j.mo += k.valorTotal
                            }
            
                            if ( k.tipo === TIPO_ITEM_COTIZACION.TERCERO) {
                                orden.tercero += k.valorTotal
                                orden.total += k.valorTotal
                                j.total += k.valorTotal
                                j.tercero += k.valorTotal
                            }
                        })
                    }
                } else {
                    j.total = 0;
                    j.parts = 0;
                    j.mo = 0;
                    j.tercero = 0;
                }
                
            } )
        } )

        await Ordenes.findByIdAndUpdate({ _id: idOrden }, orden )

        return res.status(200).send({
            estatus: true,
            resultadoOperacion: 'Actualizacion exitosa'
        })

    } catch ( error ) {
        console.log('Error actualizar cotizacion orden', JSON.stringify(error))
        return res.status(500).send({ 
            data: [],
            estatus: false,
            resultadoOperacion: 'Ocurrió un error al actualizar la cotizacion',
            error: error
        })
    }
}

const obtenerOrdenesPorCliente = async ( req, res ) => {
    try {

        const data = req.body
        const idCentro = ObjectId( data.idCentro );
        const fechaDesde = new Date( moment(data.fechaDesde, "YYYY-MM-DD").tz('America/Bogota').format() );
        const fechaHasta = new Date( moment(data.fechaHasta, "YYYY-MM-DD").tz('America/Bogota').add(1, 'month').format() );
        const nit = new RegExp( data.nit );
        const limite = data.limite;
        const salto = data.salto
        const ordenes = await Ordenes.aggregate([
            { $match: { create: { $gte: fechaDesde, $lte: fechaHasta } } },
            { $match: { centerId: idCentro } },
            { $match: { nit: nit }},
            { $match: { "status.abierto.estatus": true } },
            { $group: {
                _id: { nit:"$nit" },
                nombres: { $push: { $concat:["$name"," ", "$last_name"] } },
                ordenes: { $sum: 1 },
                total_cotizado: { $sum: "$total"},
                manoObra_cotizado: { $sum: "$mo"},
                repuestos_cotizado: { $sum: "$parts"},
                tercero_cotizado: { $sum: "$tercero"},

                total_aprobado: { $sum: "$total_approve"},
                manoObra_aprobado: { $sum: "$mo_approve"},
                repuestos_aprobado: { $sum: "$parts_approve"},
                tercero_aprobado: { $sum: "$tercero_aprobado"},

                total_rechazado: { $sum: "$total_ban"},
                manoObra_rechazado: { $sum: "$mo_ban"},
                repuestos_rechazado: { $sum: "$parts_ban"},
                tercero_rechazado: { $sum: "$tercero_rechazado"},
                idOrdenes: { $push: {
                    id: "$_id",
                    placa: "$plate"
                }},
                procesos: { 
                    $push: { 
                        orden: "$process", 
                        totalActividades:{ 
                            $sum: 0 
                        },
                        actividadesTerminadas:{ 
                            $sum: 0 
                        },

                    } 
                },
                totalActividades: { $sum: 0 },
                actividadesTerminadas: { $sum: 0 }
            }},
            { $sort: { "_id.nit":1 }},
            { $skip: salto },
            { $limit: limite }
        ])

        ordenes.map( async i => {
           await i.procesos.map( ( j ) => {
                j.orden = avancesDelProceso(j.orden);
                j.totalActividades += j.orden.totalActividades;
                j.actividadesTerminadas += j.orden.actividadesTerminadas;
                i.totalActividades += j.orden.totalActividades;
                i.actividadesTerminadas += j.orden.actividadesTerminadas
            })
        })

        return res.status(200).send({
            estatus: true,
            resultadoOperacion: 'Ordenes obtenidas con exito',
            data: ordenes
        })

    } catch ( error ) {
        console.log('Error al obtener las ordenes', JSON.stringify(error))
        return res.status(500).send({ 
            data: [],
            estatus: false,
            resultadoOperacion: 'Ocurrió un error al obtener las ordenes',
            error: error
        })
    }
}

const contarOrdenesPorClienteSinFiltro = async ( req, res ) => {
    try {

        const data = req.body
        const idCentro = ObjectId( data.idCentro );
        const fechaDesde = new Date( data.fechaDesde );
        const fechaHasta = new Date( data.fechaHasta );

        const ordenes = await Ordenes.aggregate([
            { $match: { create: { $gte: fechaDesde, $lte: fechaHasta } } },
            { $match: { centerId: idCentro } },
            { $match: { "status.abierto.estatus": true } },
            { $group: {
                _id: { nit:"$nit", nombres: { $concat: ["$name"," ", "$last_name"] }}
            }},
            { $project: {
                id: "$_id"
            }}
        ])

        return res.status(200).send({
            estatus: true,
            resultadoOperacion: 'Ordenes obtenidas con exito',
            data: ordenes.length
        })

    } catch ( error ) {
        console.log('Error al contar las ordenes', JSON.stringify(error))
        return res.status(500).send({ 
            data: [],
            estatus: false,
            resultadoOperacion: 'Ocurrió un error al contar las ordenes',
            error: error
        })
    }
}

const obtenerOrdenesDeCliente = async ( req, res ) => {
    try {

        const data = req.body;
        const identificacion = data.identificacion
        const cuenta = ObjectId( data.cuenta )
        const centro = ObjectId( data.centro )
        
        const ordenes = await Ordenes.aggregate([
            // { $match: { create: { $gte: dateInit, $lte: dateEnd } } },
            // { $match: { center_code: center_code } },
            // { $match: { plate: plate } },
            { $match: { "status.abierto.estatus": true } },
            { $match: { nit: identificacion }},
            { $match: { accountId: cuenta } },
            { $match: { centerId: centro } },
            { $project: {
                whatsapp:{
                    idCuenta: "$accountId",
                    telefonoCliente: "$telephone",
                    mensajesNuevos: { $sum:0 }
                },
                emailEnviado:{
                    estatus: "$send_to_customer",
                    fecha: "$date_send"
                },
                estatus: "$status",
                fechaCreacion: "$create",
                id:"$id",
                or:"$or",
                totales: {
                    aprobado: "$total_approve",
                    cotizado: "$total",
                    rechazado: "$total_ban"
                },
                vehiculo:{
                    marca: "$brand",
                    linea: "$model",
                    placa: "$plate",
                    ano_modelo: "$year",
                    vin: "$vin"
                },
                vistasCliente: "$vistasCliente",
                procesos:"$process",
                nivelPrioridad:""
            }},
            { $sort: { fechaCreacion: -1 } }
        ])

        if ( ordenes && ordenes.length < 1 ) {
            return res.status(200).send({
                estatus: false,
                resultadoOperacion: 'No hay ordenes asignadas a esta identificacion',
                data: []
            })
        }

        ordenes.map( (i) => {
            i.nivelPrioridad = resumenNivelPrioridad(i.procesos)
        })

        ordenes.map( (i) => {
            i.procesos = avancesDelProceso(i.procesos)
        } )

        return res.status(200).send({
            estatus: true,
            resultadoOperacion: 'Se encontraron ordenes',
            data: ordenes
        })

    } catch ( error ) {
        console.log('[obtenerOrdenesDeCliente] Error al obtener las ordenes', JSON.stringify(error))
        return res.status(500).send({ 
            data: [],
            estatus: false,
            resultadoOperacion: 'Ocurrió un error al consultar las ordenes',
            error: error
        })
    }
}

const obtenerValoresOrdenesCliente = async ( req, res ) => {
    try {

        const data = req.body;
        const identificacion = data.identificacion
        const cuenta = ObjectId( data.cuenta )
        const centro = ObjectId( data.centro )

        const valores = await Ordenes.aggregate([
            { $match: { nit: identificacion }},
            { $match: { accountId: cuenta } },
            { $match: { centerId: centro } },
            { $match: { "status.abierto.estatus": true } },
            { $group: {
                _id: "$nit",
                totalCotizado: { $sum: "$total"},
                totalAprobado: { $sum: "$total_approve"},
                totalRechazado: { $sum: "$total_ban"},
                detalle: { $push: {
                    _id: "$_id",
                    creado: "$create",
                    placa: "$plate",
                    or: "$or",
                    id: "$id",
                    totalCotizado: { $sum: "$total" },
                    totalAprobado: { $sum: "$total_approve"},
                    totalRechazado: { $sum: "$total_ban"}
                } }
            }}
        ])

        return res.status(200).send({
            estatus: true,
            resultadoOperacion: 'Se encontraron ordenes',
            data: valores
        })

    } catch ( error ) {
        console.log('obtenerValoresOrdenesCliente: Error', JSON.stringify(error))
        return res.status(500).send({ 
            data: [],
            estatus: false,
            resultadoOperacion: 'Ocurrió un error al contar las ordenes',
            error: error
        })
    }
}

const obtenerOrdenesDeClienteZonaCliente = async ( req, res ) => {
    try {

        
        const data = req.body;
        const identificacion = data.identificacion.numero
        const cuenta = ObjectId( data.cuenta )
        
        const ordenes = await Ordenes.aggregate([
            { $match: { "status.abierto.estatus": true } },
            { $match: { nit: identificacion }},
            { $match: { accountId: cuenta } },
            { $project: {
                fechaCreacion: "$create",
                id:"$id",
                or:"$or",
                totales: {
                    aprobado: "$total_approve",
                    cotizado: "$total",
                    rechazado: "$total_ban"
                },
                vehiculo:{
                    marca: "$brand",
                    linea: "$model",
                    placa: "$plate",
                    ano_modelo: "$year",
                    vin: "$vin"
                },
                url: "$shortUrl",
                procesos:"$process",
                nivelPrioridad:""
            }},
            { $sort: { fechaCreacion: -1 } }
        ])

        if ( ordenes && ordenes.length < 1 ) {
            return res.status(200).send({
                estatus: false,
                resultadoOperacion: 'No hay ordenes asignadas a esta identificacion',
                data: []
            })
        }

        ordenes.map( (i) => {
            i.nivelPrioridad = resumenNivelPrioridad(i.procesos)
        })

        ordenes.map( (i) => {
            i.procesos = avancesDelProceso(i.procesos)
        } )

        return res.status(200).send({
            estatus: true,
            resultadoOperacion: 'Se encontraron ordenes',
            data: ordenes
        })

    } catch ( error ) {
        console.log('obtenerOrdenesDeClienteZonaCliente: Error', JSON.stringify(error))
        return res.status(500).send({ 
            data: [],
            estatus: false,
            resultadoOperacion: 'Ocurrió un error al contar las ordenes',
            error: error
        })
    }
}

const obtenerValoresOrdenesClienteZonaCliente = async ( req, res ) => {
    try {

        const data = req.body;
        const identificacion = data.identificacion.numero
        const cuenta = ObjectId( data.cuenta )

        const valores = await Ordenes.aggregate([
            { $match: { nit: identificacion }},
            { $match: { accountId: cuenta } },
            { $match: { "status.abierto.estatus": true } },
            { $group: {
                _id: "$nit",
                totalCotizado: { $sum: "$total"},
                totalAprobado: { $sum: "$total_approve"},
                totalRechazado: { $sum: "$total_ban"},
                detalle: { $push: {
                    _id: "$_id",
                    creado: "$create",
                    placa: "$plate",
                    or: "$or",
                    id: "$id",
                    url: "$shortUrl",
                    totalCotizado: { $sum: "$total" },
                    totalAprobado: { $sum: "$total_approve"},
                    totalRechazado: { $sum: "$total_ban"}
                } }
            }}
        ])

        return res.status(200).send({
            estatus: true,
            resultadoOperacion: 'Se encontraron ordenes',
            data: valores
        })

    } catch ( error ) {
        console.log('obtenerValoresOrdenesCliente: Error', JSON.stringify(error))
        return res.status(500).send({ 
            data: [],
            estatus: false,
            resultadoOperacion: 'Ocurrió un error al contar las ordenes',
            error: error
        })
    }
}

module.exports = {
    contarOrdenesPorClienteSinFiltro,
    crearOrden,
    obtenerOrdenesDeCliente,
    obtenerOrdenesDeClienteZonaCliente,
    obtenerValoresOrdenesClienteZonaCliente,
    obtenerOrdenesPorCliente,
    obtenerOrdenesTableroControl,
    obtenerNotificacionesWhastapp,
    obtenerValoresOrdenesCliente,
    actualizarCotizacion
}