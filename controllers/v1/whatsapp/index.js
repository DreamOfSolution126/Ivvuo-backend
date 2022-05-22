const Whatsapp = require('../../../models/whatsapp.model')
const Templates = require('../../../models/whatsappTemplate.model')
const Account = require('../../../models/account')
const ChatBot = require('../chatbot')
const moment = require('moment')

const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId
const MessagingResponse = require('twilio').twiml.MessagingResponse;

let accountSid; 
let authToken;
let numero;
let template;
let datosCuenta;

async function loadWhatsappConfig ( req, res, next) {
    try {

        const idCuenta = ObjectId(req.body.idCuenta)
        const datosCuenta = await Account.findById({_id: idCuenta})

        if( !datosCuenta.whatsapp || !datosCuenta.whatsapp.estatus ) {
            return res.status(200).send({
                data:{
                    estatus: false,
                    resultadoOperación: 'Este servicio no está disponible, comuníquese con su representante de ventas'
                }
            })
        }
        accountSid = datosCuenta.whatsapp.accountSid;
        authToken = datosCuenta.whatsapp.authToken;
        numero = datosCuenta.whatsapp.numero

        next();

    } catch ( error ) {
        console.error('Error al cargar las configuraciones', JSON.stringify(error));
        return res.status(500).send({
            data:{
                estatus: false,
                resultadoOperación: 'Error al obtener las configuraciones de Whatsapp'
            },
            error: error
        })
    }
}

async function loadTemplate ( req, res, next ) {
    try {
        let para = req.body.To;
        para = para.split('whatsapp:+')[1]

        datosCuenta = await Account.find({ 
            "whatsapp.numero": para,
            "whatsapp.estatus": true,
        })

        next();
    } catch ( error ) {
        return res.status(500).send({
            data:{
                estatus: false,
                resultadoOperación: 'Error al obtener la plantilla',
            },
            error: error
        })
    }
}

async function enviar ( req, res ) {    
    try {

        const client = require('twilio')(accountSid, authToken);
        const idCuenta = ObjectId(req.body.idCuenta)
        const datosCuenta = await Account.findById({_id: idCuenta})

        const whatsapp = 'whatsapp:+'
        const de = (whatsapp+numero).toString()
        const para = (whatsapp+datosCuenta.phone_code+req.body.para).toString()

        const body = req.body.mensaje.toString()
        const response = await client.messages 
        .create({ 
           body: body, 
           from: de,       
           to: para 
         })

        const mensaje = new Whatsapp({
            sid: response.sid,
            direccion: response.direction,
            estatusMensaje: response.status,
            mensaje: response.body,
            fecha_creacion: response.dateCreated,
            fecha_enviado: response.dateSent,
            fecha_actualizacion: response.dateUpdated,
            de: response.from,
            para: response.to
        })
        
        const resultado = await mensaje.save()

        return res.status(200).send({
            data:{
                estatus: true,
                mensaje
            }
        })
    } catch ( error ) {
        console.error('Error al enviar el mensaje', JSON.stringify(error))
        return res.status(500).send({
            data: {
                estatus: false,
            },
            error: error
        })
    }
}

async function recibir ( req, res ) {
    try {

        const data = req.body

        const mensaje = new Whatsapp({
            sid: data.SmsMessageSid,
            direccion: 'Incoming',
            estatusMensaje: data.SmsStatus,
            mensaje: data.Body,
            fecha_creacion: new Date( Date.now() ),
            fecha_enviado: new Date( Date.now() ),
            fecha_actualizacion: new Date( Date.now() ),
            de: data.From,
            para: data.To
        })

        await mensaje.save()

        const twiml = new MessagingResponse();

        const respuesta = await ChatBot.detectarSolicitudes(mensaje.mensaje, datosCuenta, mensaje.de)
        
        if(!respuesta) return res.end();
        const mensajeEnviado = new Whatsapp({
            sid: Date.now(),
            direccion: 'outbound-api',
            estatusMensaje: 'delivered',
            mensaje: respuesta,
            fecha_creacion: moment().format(),
            fecha_enviado: moment().format(),
            fecha_actualizacion: moment().format(),
            de: data.From,
            para: data.To
        })
        await mensajeEnviado.save()

        twiml.message( respuesta );

        res.writeHead(200, {'Content-Type': 'text/xml'});

        res.end(twiml.toString());

    } catch ( error ) {
        console.error('Error al recibir los mensajes', JSON.stringify(error))
        return res.status(500).send( {data:{}, error: error})
    }
}

async function obtener ( req, res ) {
    try {

        const idCuenta = ObjectId(req.body.idCuenta)
        const datosCuenta = await Account.findById({_id: idCuenta})

        const whatsapp = 'whatsapp:+'
        const de = (whatsapp+datosCuenta.whatsapp.numero).toString();
        const para = (whatsapp+datosCuenta.phone_code+req.body.para).toString()

        const response = await Whatsapp.aggregate([
            { $match: { de: { $in:[ de, para ] } }},
            { $match: { para: { $in:[ de, para ] } }},
            { $project: {
                _id: "$_id",
                sid: "$sid",
                direccion: "$direccion",
                estatusMensaje: "$estatusMensaje",
                mensaje: "$mensaje",
                fecha_creacion: "$fecha_creacion",
                fecha_enviado: "$fecha_enviado",
                fecha_actualizacion: "$fecha_actualizacion",
                de: "$de",
                para: "$para"
            }},
            { $sort: { fecha_creacion: -1 }},
            { $limit: 100 },
            { $sort: { fecha_creacion: 1 }}
        ])

        const udatesManyMW = await Whatsapp.updateMany( { 
            de: para, 
            para: de,
            estatusMensaje:{ $ne:"read" } 
        }, { $set:{ "estatusMensaje":"read" }} )

        return res.status(200).send({
            data:{
                estatus: true,
                mensajes:response
            }
        })
    } catch ( error ) {
        console.error('Error al obtener los WMensajes', JSON.stringify(error))
        return res.status(500).send({
            data:{
                estatus: false,
                mensajes:[]
            },
            error: error
        })
    }
}

async function actualizaciones ( req, res ) {
    try {
        const data = req.body

        await Whatsapp.findOneAndUpdate( 
            { sid: data.MessageSid }, 
            { $set: { "estatusMensaje": data.SmsStatus } }
        );
        
        res.end()
    } catch ( error ) {
        console.log( '[WHATSAPP: actualizaciones] Error al actualizar el mensaje', error )
        res.end()
    }
}

async function envioNotificacion ( req, res ) {
    try {

        const client = require('twilio')(accountSid, authToken);
        const idCuenta = ObjectId(req.body.idCuenta)
        const datosCuenta = await Account.findById({_id: idCuenta})

        const whatsapp = 'whatsapp:+'
        const de = (whatsapp+numero).toString()
        const para = (whatsapp+datosCuenta.phone_code+req.body.para).toString()

        const body = req.body.mensaje.toString()
        const response = await client.messages 
        .create({ 
           body: body, 
           from: de,       
           to: para 
         })

        const mensaje = new Whatsapp({
            sid: response.sid,
            direccion: response.direction,
            estatusMensaje: response.status,
            mensaje: response.body,
            fecha_creacion: response.dateCreated,
            fecha_enviado: response.dateSent,
            fecha_actualizacion: response.dateUpdated,
            de: response.from,
            para: response.to
        })
        
        const resultado = await mensaje.save()

        return res.status(200).send({
            data:{
                estatus: true,
                mensaje
            }
        })

    } catch ( error ) {
        console.error('Error al enviar el mensaje', JSON.stringify(error))
        return res.status(500).send({
            data: {
                estatus: false,
            },
            error: error
        })
    }
}

module.exports = {
    loadTemplate,
    loadWhatsappConfig,
    actualizaciones,
    enviar,
    envioNotificacion,
    recibir,
    obtener
}

