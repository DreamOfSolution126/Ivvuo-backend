'use strict'
const request = require('request')
const fs = require('fs')
const multer = require('multer')
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId
const joi = require('joi');

const WorkOrders = require('../../models/works_orders')
const ClienteConcesionario = require('../../models/clientes-concesionario/clientesConcesionario.model')
const Mail = require('./mailerController')
const Activity = require('../../models/activitys')
const Process = require('../../models/process')
const Centro = require('../../models/center')
const moment = require('moment-timezone')
const ShortLinkHelper = require('./shortLink')
const ShortLink = require('../../models/shortlink.model')
mongoose.set('useFindAndModify', false);
const { TIPO_ITEM_COTIZACION } = require('../../models/enum');
const { setAnySchema } = require('../v1/ordenes/ordenes.joi');

let transporter = Mail.transporter;
let process = []
let activities = []

// Obtener los procesos de la lista seleccionada
function getProcessByListId(req, res, next){
    let id = req.body.list._id
    Process.aggregate([
        { $match:{ listId:ObjectId(id)}},
        { $group:{
            _id:{ id:"$_id",  
                process:"$process",
                icon:"$icon",
                description:"$description",
                weight:"$weight",
                notifyCustomer:"$notifyCustomer",
                index:"$index",
                advanceValue:"$advanceValue"
                }
        } },
        { $project:{
            _id:0,
            id:"$_id.id",
            name:"$_id.process",
            icon:"$_id.icon",
            description:"$_id.description",
            weight:"$_id.weight",
            notifyCustomer:"$_id.notifyCustomer",
            index:"$_id.index",
            advanceValue:"$_id.advanceValue",
            checkList:[]
        } },
        { $sort:{ index:1 }}
    ], (err, result)=>{
        if(err) res.status(500).send({msg:'Lo sentimos ocurrio un problema al obtener los procesos', err:err})
        process = result;
        next()
    })
}
// Obtener las actividades
function getActivitiesByListId(req, res, next){
    let id = req.body.list._id
    Activity.aggregate([
        { $match:{ listId:ObjectId(id) }},
        { $group:{
            _id:{ id:"$_id",
            processId:"$processId",
            account_code:"$account_code",
            name:"$name",
            details:"$details",
            weight:"$weight",
            type:"$type",
            parts:"$parts",
            mo:"$mo",
            total:"$total",
            index:"$index",
            seeCustomer:"$seeCustomer",
            cotizacion: "$cotizacion",
            quotation:"$quotation",
            asnwer_options:"$asnwer_options"
         }
        }},
        { $project:{
            _id:0,
            id:"$_id.id",
            processId:"$_id.processId",
            account_code:"$_id.account_code",
            item:"$_id.name",
            details:"$_id.details",
            weight:"$_id.weight",
            type:"$_id.type",
            parts:"$_id.parts",
            mo:"$_id.mo",
            total:"$_id.total",
            index:"$_id.index",
            seeCustomer:"$_id.seeCustomer",
            cotizacion: "$_id.cotizacion",
            quotation:"$_id.quotation",
            asnwer_options:"$_id.asnwer_options",
            resQuotation:{ status:'', date:'', block: { $toBool: false }},
            answer:[],
            attach:[],
            comments:[]
        }},
        { $sort:{ index:1 }}
    ], (err, result)=>{
        if(err) res.status(500).send({msg:'Lo sentimos ocurrio un problema al obtener las actividades', err:err})
        activities = result;
        next()
    })
}

//buscar Orden antes de crearla
function findOrder(req, res, next) {
    const data = req.body

    if(req.body.generateOrAuto){
        ot = count+1
    } else {
        ot = req.body.id
    }

    WorkOrders.findOne({ot: ot}, (error, result) => {
        if(error) return res.status(500).send({msg:'Error al contar las ordenes'})
        if(result) return res.status(201).send({msg:'La orden ya existe'})
         next()
    })
}

async function newOrder(req, res ){

    const data = req.body
    const idCentro = ObjectId( data.centerId )

    const lista = []

    for(let i=0; i<process.length; i++){
        lista.push({
            id:process[i].id,
            name: process[i].name,
            icon: process[i].icon,
            description: process[i].description,
            weight: process[i].weight,
            notifyCustomer: process[i].notifyCustomer,
            index: process[i].index,
            advanceValue: process[i].advanceValue,
            checkList: process[i].checkList
        })
        for(let j=0; j<activities.length; j++){
            if(lista[i].id.toString() == activities[j].processId.toString()){
                lista[i].checkList.push(
                    activities[j]
                )
            }
        }
    }

    data.process = lista;
    let datosCentro

    try {

        datosCentro = await Centro.findById({ _id: idCentro })

        data.informacionCentro = {
            direccion: datosCentro.direccion.direccion,
            ciudad: `${datosCentro.direccion.ciudad} ${datosCentro.direccion.pais}`,
            telefono: `${datosCentro.telefono.indicativo} ${datosCentro.telefono.numero}`
        }

        data.notas = datosCentro.notas;

    } catch ( error ) {
        return res.status(500).send({
            msg: 'Error al obtener los datos del centro de servicio',
            error: error
        })
    }

    if ( data.generateOrAuto ) {

        let cantidadOrdenes
        try {

            cantidadOrdenes = await WorkOrders.countDocuments({
                centerId: idCentro
            })

            const tiempo = 1593901966000
            data.id = `${cantidadOrdenes + 1} - ${Date.now() - tiempo}`;
            data.or = `${cantidadOrdenes + 1} - ${Date.now() - tiempo}`;
            
        } catch (error) {
            return res.status(500).send({
                msg: 'Error al calcular el consecutivo de la orden',
                error: error
            })
        }

    } else {

        try {
            const validarOrdenDuplicada = await WorkOrders.findOne({
                centerId: idCentro,
                id: data.id
            })
    
            if ( validarOrdenDuplicada ) {
                return res.status(200).send(validarOrdenDuplicada)
            }
        } catch (error) {
            return res.status(500).send({
                msg: 'Error al validar si la orden esta duplicada',
                error: error
            })
        }
        
    }

    let datosUltimaOrden

    try {
        const placa = new RegExp( data.plate, 'i' )
        const ultimaOrden = (await WorkOrders.find({ plate: placa, accountId: data.accountId }).sort({ create: -1 }))
        if (ultimaOrden.length > 0 ) {
            datosUltimaOrden = ultimaOrden[0];
        }
    } catch (error) {
        console.log('Error: datosUltimaOrden => ', error)
    }

    if ( datosUltimaOrden ) {
        data.vin = datosUltimaOrden.vin;
        data.name = datosUltimaOrden.name;
        data.last_name = datosUltimaOrden.last_name;
        data.model = datosUltimaOrden.model;
        data.brand = datosUltimaOrden.brand;
        data.year = datosUltimaOrden.year;
        data.nit = datosUltimaOrden.nit;
        data.email = datosUltimaOrden.email;
        data.telephone = datosUltimaOrden.telephone;

    } else {
        try {
            const placa = new RegExp( data.plate, 'i' )
            datosUltimaOrden = await ClienteConcesionario.findOne({ placa: placa, codigoCuenta: data.account_code })

            if ( datosUltimaOrden ) {
                data.vin = datosUltimaOrden.vin;
                data.name = datosUltimaOrden.nombre;
                data.last_name = datosUltimaOrden.apellido;
                data.model = datosUltimaOrden.modelo;
                data.brand = datosUltimaOrden.marca;
                data.year = datosUltimaOrden.ano;
                data.nit = datosUltimaOrden.identificacion;
                data.email = datosUltimaOrden.email;
                data.telephone = datosUltimaOrden.telefono;
            }
        } catch (error) {
            console.log('Error: ClienteConcesionario => ', error)
        }
    }

    data.key = `${data.account_code}-${data.center_code}-${data.or? data.or : data.id}` 
    data.create = Date.now( moment().tz('America/Bogota').format )
    const nuevaOrden = new WorkOrders( data )
    
    try {
        const orden = await nuevaOrden.save()

        await generateShortUrl(orden)

        return res.status(200).send(orden)
    } catch (error) {
        return res.status(500).send({
            msg: 'Ocurrio un error al guardar la orden',
            error: error
        })
    }
    

    
}

function updateOrder(req, res){
    let id = req.body._id;
    let body = req.body;
    
    if(!req.body.status.abierto || !req.body.status.cerrado){
        req.body.status = {
            abierto:{ estatus:true, date: req.body.create },
            cerrado:{ estatus:false, date: req.body.create }
        }
        // return res.status(500).send({msg:'paila'})
    }
    let abierto = req.body.status.abierto.estatus;
    let cerrado = req.body.status.cerrado.estatus;
    
    if(!abierto && cerrado){
        return res.status(500).send({msg:'Esta orden se encuentra cerrada'})
    } else if (abierto && cerrado){
        req.body.status.abierto.estatus = false;
        req.body.status.cerrado.date = new Date( Date.now() );
    } 
    
    
    for(let i of body.process){
        for(let j of i.checkList){
            if(j.resQuotation.status && j.resQuotation.status === 'approved'){
                j.resQuotation.block = true;
            } else {
                j.resQuotation.block = false;
            }
        }
    }

    body.parts = 0;
    body.total = 0;
    body.mo = 0;
    body.tercero = 0;

    body.process.map( i => {

        i.checkList.map( j => {
            j.total = 0;
            j.parts = 0;
            j.tercero = 0;
            j.mo = 0;

            if ( j.answer.value === 0 || j.answer.value === 1 ) {
                if ( j.cotizacion ) {

                    j.cotizacion.map( k => {

                        if ( k.tipo === TIPO_ITEM_COTIZACION.REPUESTO) {
                            body.parts += k.valorTotal
                            body.total += k.valorTotal
                            j.total += k.valorTotal
                            j.parts += k.valorTotal
                        }
        
                        if ( k.tipo === TIPO_ITEM_COTIZACION.MANO_OBRA) {
                            body.mo += k.valorTotal
                            body.total += k.valorTotal
                            j.total += k.valorTotal
                            j.mo += k.valorTotal
                        }
        
                        if ( k.tipo === TIPO_ITEM_COTIZACION.TERCERO) {
                            body.tercero += k.valorTotal
                            body.total += k.valorTotal
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

    WorkOrders.findByIdAndUpdate(id, body, (err, success)=>{
        if(err) return res.status(500).send({msg:'Error al actualizar la orden'})
        res.status(200).send(success)
    })
}

async function setActivityAnswer(req, res){

    console.log('SetActivityAnswer', req.body)
    let id = req.body._id;
    let processIndex = req.body.processIndex;
    let activityIndex = req.body.activityIndex;
    let answer = req.body.answer;
    let setObject = {};
    setObject["process."+processIndex+".checkList."+activityIndex+".answer"] = answer;

    let orden
    try {
        orden = await WorkOrders.findById({ _id: id })
    } catch (error) {
        return res.status(500).send({ msg:'Error al comprobar la orden'})
    }

    if ( !orden ) {
        return res.status(500).send({
            mgs: 'No se encontro esta orden'
        })
    }

    orden.process[processIndex].checkList[activityIndex].answer = answer

    orden.parts = 0;
    orden.total = 0;
    orden.mo = 0;
    orden.tercero = 0;

    orden.process.map( i => {

        i.checkList.map( j => {
            j.total = 0;
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

    

    try {

        const respuesta = await WorkOrders.findByIdAndUpdate({ _id: id }, orden );

        console.log('Se actualizo la or')
        return res.status(200).send( respuesta )
        
    } catch (error) {
        return res.status(500).send({msg:'Error al actualizar la orden'})
    }

    // WorkOrders.findByIdAndUpdate(id, { $set:setObject }, (err, success)=>{
    //     if(err) return res.status(500).send({msg:'Error al actualizar la orden'})
    //     res.status(200).send(success)
    // })
}

function setActivityComment(req, res){
    let id = req.body._id;
    let processIndex = req.body.processIndex;
    let activityIndex = req.body.activityIndex;
    let comments = req.body.comments;
    let setObject = {};
    setObject["process."+processIndex+".checkList."+activityIndex+".comments"] = comments;

    WorkOrders.findByIdAndUpdate(id, { $set:setObject}, (err, success)=>{
        if(err) return res.status(500).send({msg:'Error al actualizar la orden'})
        res.status(200).send(success)
    })
}

async function setActivityAny(req, res){

    const data = req.body;
    console.log('setActivityAny: ', req.body)

    let validacion
    try {
        validacion = joi.validate(data, setAnySchema )
        console.log('Validacion: ', validacion );
        if (validacion.error) {
            return res.status(400).send({
                msg: 'Lo sentimos ocurrio un error al actualizar la orden: Peticion mal formada.'
            })
        }
    } catch (error) {
        return res.status(500).send({
            msg: 'Ocurrio un error al validar la peticion'
        })
    }
    let id = data._id;
    let processIndex = req.body.processIndex;
    let activityIndex = req.body.activityIndex;
    let value = req.body.value;
    let setName = req.body.setName;
    let setObject = {};
    setObject["process."+processIndex+".checkList."+activityIndex+"."+setName] = value;

    let respuesta
    try {
        respuesta = await WorkOrders.findByIdAndUpdate( {_id: id }, { $set: setObject } )
        console.log('Respuesta: ', respuesta );
        return res.status(200).send( respuesta )
    } catch (error) {
        return res.status(500).send({msg:'Error al actualizar la orden'})
    }
    // WorkOrders.findByIdAndUpdate(id, { $set:setObject}, (err, success)=>{
        
    //     if(err) {
    //         console.log('Error: setActivityAny', error )
    //         return res.status(500).send({msg:'Error al actualizar la orden'})
    //     }
    //     console.log('Success: ', success );
    //     res.status(200).send(success)
    // })
}

async function getOrders(req, res){

    let limit = req.body.limit;
    let skip = req.body.skip;
    let center_code = req.body.center_code;
    let dateInit = new Date(moment(req.body.dateInit, "YYYY-MM-DD"));
    let dateEnd = new Date(moment(req.body.dateEnd, "YYYY-MM-DD").add(1, 'day') );
    let plate = new RegExp(req.body.plate, 'i');


    if(dateInit > dateEnd) {
        return res.status(500).send({msg:'Este rango de fechas no es válido'})
    }

    try {
        const ordenes = await WorkOrders.find({
            create: { $gte: dateInit, $lte: dateEnd },
            plate: plate,
            center_code: center_code
        }).skip(skip).limit(limit).sort({create:-1})

        console.log('Ordenes: ', ordenes )
        return res.status(200).send(ordenes)
    } catch ( error ) {
        return res.status(500).send({msg:'Error al obtener las ordenes'})
    }

    
}

function countOrders(req, res){

    let center_code = req.body.center_code;
    let plate = new RegExp(req.body.plate, 'i');
    let idUsuario = req.body.idUsuario ? req.body.idUsuario: 'Todos'


    if( idUsuario === 'Todos'){
        idUsuario = new RegExp('', 'i')
    }

    let dateInit
    let dateEnd
    if ( req.body.dateInit ) {
        
        dateInit = new Date( moment(req.body.dateInit, 'YYYY-MM-DD').tz('America/Bogota').format('YYYY-MM-DD') );
    } else {
        dateInit = new Date( moment( `${moment().format('YYYY-MM-')}01` ).tz('America/Bogota').format('YYYY-MM-DD') );
    }

    if ( req.body.dateEnd ) {
        dateEnd = new Date( moment(req.body.dateEnd, 'YYYY-MM-DD').tz('America/Bogota').add(1, 'day').format('YYYY-MM-DD') );
    } else {
        dateEnd = new Date( moment( `${moment().format('YYYY-MM-')}01` ).tz('America/Bogota').add(1, 'month').format('YYYY-MM-DD'));
    }

    WorkOrders.countDocuments({
        create:{ $gte: dateInit, $lte: dateEnd },
        plate: plate,
        center_code: center_code,
        'creadoBy.id': idUsuario
    }, (err, count)=>{
        if(err) return res.status(500).send({msg:'Error al contar las ordenes'})
        res.status(200).send({count:count})
    })
}

function getOrderById(req, res){
    let id = req.body.id
    WorkOrders.findById(id, (err, order)=>{
        if(err) return res.status(500).send({msg:'Error al obtener las ordenes'})
        res.status(200).send(order)
    })
}

function getOrderByIdToCustomer(req, res){
    let id = req.params.id
    
    WorkOrders.aggregate([
        { $match:{ _id:ObjectId(id) }},
        { $unwind:"$process"},
        { $group:{
            _id:{ process:"$process" }
        }},
        { $project:{
            _id:0,
            checkList:"$_id.process.checkList"
        }},
        { $unwind: "$checkList" },
        { $sort: { "checkList.index": 1 }},
        { $sort: { "checkList.processId": 1 }},
        { $group:{
            _id:{ 
                processId: "$checkList.processId",
                index: "$checkList.index",
                item:"$checkList.item",
                details:"$checkList.details",
                type:"$checkList.type",
                asnwer:"$checkList.answer.answer", 
                value:"$checkList.answer.value",
                attach:"$checkList.attach",
                comments:"$checkList.comments",
                seeCustomer:"$checkList.seeCustomer"
            }
        }},
        { $project:{
            _id:0,
            processId:"$_id.processId",
            index: "$_id.index",
            item:"$_id.item",
            details:"$_id.details",
            type:"$_id.type",
            answer:"$_id.asnwer",
            value:"$_id.value",
            attach:"$_id.attach",
            comments:"$_id.comments",
            string: { $type: "$_id.asnwer" },
            seeCustomer:"$_id.seeCustomer"
        }},
        { $match: { string: "string" }},
        { $match: { seeCustomer: true }},
        { $sort: { index:1 }},
        { $sort: { processId:1 }},
        { $match: { value: { $in: [ 0, 1, 2 ] } }},
        { $group:{
            _id:{
                value:"$value"
            },
            items:{ $sum: 1},
            answers:{ $push:{
                processId:"$processId",
                item:"$item",
                details:"$details",
                type:"$type",
                answer:"$answer",
                value:"$value",
                attach:"$attach",
                comments:"$comments",
                seeCustomer:"$seeCustomer"

            }}
        }},
        { $project:{
            _id:0,
            value:"$_id.value",
            items:"$items",
            priority:{
                $cond:[ 
                    { $eq:[ "$_id.value", 0 ]}, "URGENTE", 
                    { $cond:[ 
                        { $eq:[ "$_id.value", 1 ]}, "PRONTO", 
                        { $cond:[ 
                            { $eq:[ "$_id.value", 2 ]}, "OK", "N/A"
                         ]}
                     ]}
                ]
            },
            answers:"$answers"
        }},
        { $match:{ value:{ $ne: 99 } }},
        { $sort:{ value: 1}}
        
    ], (err, order)=>{
        if(err) return res.status(500).send({msg:'Error al obtener las ordenes', error:err})
        res.status(200).send(order)
    })
}

async function generateShortUrl(order){
    try {
        
        let id = order._id

        const codigo = await ShortLinkHelper.generarCodigo()

        const shortLink = new ShortLink({
            short: codigo,
            idOrden: id
        })

        await shortLink.save()

        let link = 'ivvuo.com/#/C/'
        link += codigo
        
        await WorkOrders.findByIdAndUpdate({_id: ObjectId(id)}, {shortUrl: link})

        return 'Se ha generado el link y se actualizó en la orden'

    } catch( error ) {
        return `Error al generar el SHORLINK de la orden: ${JSON.stringify(error)}`
    }
}

// function createAccountDir(account){
//     let dirname = './uploads/profiles/'+account+'/';
//     fs.mkdir(dirname, (err)=>{
//         if(err && err.code == 'EEXIST'){
//             // nothing to do
//         } else if(err) {
//             return res.status(500).send({msg:'Error al crear el directorio', err:err})
//         }
//     })
// }

function uploads(req, res){
    let name = '';
    let originalname = '';

    console.log('Req: ', req.file )

    const storage = multer.diskStorage({
        destination: (req, file, cb)=>{
            // createAccountDir(req.body.account_code)
            cb(null, './uploads/attach/');
            // cb(null, './uploads/profiles/'+req.body.account_code+'/');
        },
        filename: (req, file, cb)=>{
            const datetimemap = Date.now()
            name = req.body.item+'-'+datetimemap+'.'+file.originalname.split('.')[file.originalname.split('.').length-1];
            originalname = file.originalname;
            cb(null, name)
        }
    });
    const upload = multer({
        storage: storage
    }).single('file');

    upload(req, res, (err)=>{
        
        if(err) return res.status(500).send({
            msg:'Ocurrió un error al cargar el archivo', 
            err:err
        })
        res.status(200).send({
            msg:'Cargado con exito', 
            generatedName:name, 
            originalName:originalname
        })
    })
}


function sendEmail(req, res){

    let data = req.body;
    
    const mailOptions = {
        from:'Notificación Diagnósitco <notificaciones@ivvuo.com>',
        to:  data.email,
        subject:'[Diagnostico] Hemos terminado el diagnóstico',
        html:`<!DOCTYPE html>
        <html xmlns="http://www.w3.org/1999/xhtml" lang="en">
        <head>
            <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
            <meta name="viewport" content="initial-scale=1.0"/>
            <meta charset="UTF-8">
            <title>Notificación Diagnóstico</title>
        </head>
        <body bgcolor="#343a40" style="background-color: #f8f9fa; margin: 0; padding: 0;font-size:16px; font-family: 'Arial', Tahoma, Geneva, Verdana, sans-serif">
         
            <table bgcolor="#343a40" align="center" cellpading="0" width="640" border="0" cellpadding="0" cellspacing="0" style="background-color: rgb(255, 255, 255); margin-top:15px; border-collapse: collapse;">
                <tr bgcolor="#f8f9fa" >
                    <td align="right" style="padding-bottom:5px; padding-top:5px; padding-right:5px;">
                        <a href="" style="font-size:0.6em; font-family: Arial, sans-serif; color:#555; text-decoration:none;">Ivvuo 2019</a>
                    </td>
                </tr>
                <tr bgcolor="#fff" style="background-color:#fff">
                    <td width="100%">
                        <table  border="0" cellpadding="0" cellspacing="0" width="100%">
                            <tr>&nbsp;</tr>
                            <tr style="margin-top:30px;">
                                <td align="center" style="padding-left:15px; padding-top:20px; padding-bottom:20;">
                                    <!-- <img align="center" width="120" height="auto" style="display: block;" src="http://ivvuo.com/assets/logo_mapp.png" alt=""> -->
                                    <img align="center" width="150" height="auto" style="display: block;" src="${data.logo.url}" alt="">
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
                <tr bgcolor="#fff" align="left" style="background-color:#fff;">
                    <td style="font-family: Arial, sans-serif; padding-left:15px">
                        <br>
                        <p>Estimad(@) <br> 
                            <strong style="text-transform: uppercase">${data.name} ${data.last_name}</strong>
                        </p>
                        
                    </td>
                </tr>
                <tr align="left" bgcolor="#fff" style="background-color:#fff">
                    <td style="font-family: Arial, sans-serif; padding-left:16px; padding-right:15px; padding-bottom: 15px;"  >
                        <br>
                        <p style="color:#212529;"> 
                            Hemos terminado el diagnóstico de su vehículo, puede consultar nuestras recomendaciones haciendo clic en los resultados 
                        </p>
                        <br>
                        
                        <br>
                        
                        <span style="color:#6c757d"> <small>Muchas gracias por su visita:</small> <br>
                            Para ver la cotización por favor clic en el siguiente botón
                        </span> <br>
                        
                    </td>
                </tr>
                <tr align="center" bgcolor="#fff" style="background-color:#fff">
                    <td style="padding-left: 15px; padding-top:15px; padding-right:15px; padding-bottom: 15px;" >
                        <table border="0" cellpadding="0" cellspacing="0" width="100%">
                            <tr align="center">
                                <td width="190" style="padding-top:15px; padding-bottom:15px;"></td>
                                <td width="260" bgcolor="#eee" style="color:#fff; padding-left:15px; padding-right:15px; padding-top:15px; padding-bottom:15px;">
                                    <a style="font-family: Arial, sans-serif; color:#555; text-decoration:none;" href="https://${data.shortUrl}">
                                        Ver Resultados
                                    </a>
                                </td>
                                <td width="190" style="padding-top:15px; padding-bottom:15px;"></td>
                            </tr>
                        </table>
                    </td>
                </tr>
                <tr align="left" bgcolor="#fff" style="background-color:#fff">
                    <td style="font-family: Arial, sans-serif; padding-left:16px; padding-right:15px; padding-bottom: 15px;"  >
                        <br>
                        <p style="color:#212529;"> 
                            Atentamente. <br>
                            <br>
                            ${data.center} <br>
                            ${data.account}
                        </p>
                        <br>
                        
                    </td>
                </tr>
                <tr bgcolor="#f8f9fa">
                    <td style="font-size:12px; text-align: justify; color:#555; padding-left: 15px; padding-top:15px; padding-right:15px; padding-bottom: 15px;">
                        <span style="font-family: Arial, sans-serif; font-size:12px;">
                            <strong>IVVUO </strong> ${moment().format('YYYY')} <br> 
                            <strog>Email </strong> <a style="text-decoration:none; color:#999;" href="mailto:soportealcliente@ivvuo.com"> soportealcliente@ivvuo.com</a> <br>
                            <small>Bogotá D.C. – Colombia</small>
                        </span> <br> <br>
                        <span style="font-family: Arial, sans-serif; text-align:justify; color:#555;">
                            <small style="text-align:justify;">
                                Este correo y cualquier archivo anexo pertenecen al ${data.account}. y son para uso exclusivo del destinatario intencional. 
                                Esta comunicación puede contener información confidencial o de acceso privilegiado. Si usted ha recibido este correo por 
                                error, equivocación u omisión favor notificar en forma inmediata al remitente y eliminar dicho mensaje con sus anexos. 
                                La utilización, copia, impresión, retención, divulgación, reenvió o cualquier acción tomada sobre este mensaje y sus 
                                anexos queda estrictamente prohibido y puede ser sancionado legalmente.         <strong>¡Yo también soy Cero Papel!</strong>
                            </small>
                        </span>
                    </td>
                </tr>
            </table>
        
        </body>
        </html>
        `
    }

    transporter.sendMail(mailOptions, (err)=>{
        if(err) return res.status(500).send({msg:'ocurrió un error al enviar el mensaje', err:err})
        res.status(200).send({msg:'Mensaje enviado'})
    })
}

module.exports = {
    getProcessByListId,
    getActivitiesByListId,
    findOrder,
    newOrder,
    getOrders,
    countOrders,
    getOrderById,
    getOrderByIdToCustomer,
    updateOrder,
    uploads,
    sendEmail,

    setActivityAnswer,
    setActivityComment,
    setActivityAny
}