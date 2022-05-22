'use strict'

const SMS = require('../../models/sms')
const FormData = require('form-data')
const fs = require('fs')
const request = require('request')
const twilio = require('twilio')
const Account = require('../../models/account')
const { createReadStream } = require('fs')

// Cuenta
let account_data = {};
//Envìo de mensajes Internacionales
const accountSid = 'AC085e0d74225cfd21081916c53a8957d5'; 
const authToken = '017c8150c0a3770eef1bd332007281bd'; 
const client = require('twilio')(accountSid, authToken); 

//Envio de Mensajes Háblame ( Colombia )
const cliente = 10013125
const smsApi = "CTGQbAYI1bs3rMA5ony46RnJ7xtfim"

//Envio de Mensajes Háblame V2
const account = 10013125;
const apiKey = 'CTGQbAYI1bs3rMA5ony46RnJ7xtfim';
const token = 'd65af9cd6df9dee014f3d61b1169e804';
const file = 'file';
const isPriority = 1;

function createSMSTemplate(req, res){
    const sms = new SMS({
        name: req.body.name,
        api: req.body.api,
        default: req.body.default,
        cliente: req.body.cliente,
        account_code: req.body.account_code,
        sms_header: req.body.header,
        sms_body: req.body.body,
        sms_link: req.body.link
    })

    sms.save( (err)=>{
        if(err) return res.status(500).send({msg:'Ocurrió un error al crear la plantilla SMS', err:err})
        res.status(200).send({msg:'Se ha creado la platilla con exito'})
    })
}

function updateSMSTemplate(req, res){
    let account_code = req.body[0].account_code;

    SMS.updateMany({account_code:account_code}, {default:false}, (err, success)=>{
        if(err) return res.status(500).send({msg:'Ocurrió un error al actualizar la plantilla SMS', err:err})
        res.status(200).send({msg:'Se ha actualizado la platilla con exito'})
    })
}

function updateOneSMSTemplate(req, res){
    let id = req.body._id
    let body = req.body
    SMS.findByIdAndUpdate(id, body, (err)=>{
        if(err) return res.status(500).send({msg:'Ocurrió un error al actualizar este registro', err:err})
        res.status(200).send({msg:'Se ha actualizado el SMS'})
    })
}

function deletSMSTemplate(req, res){
    let id = req.body._id
    SMS.findByIdAndRemove(id, (err)=>{
        if(err) return res.status(500).send({msg:'Ocurrió un error al eliminar la plantilla SMS', err:err})
        res.status(200).send({msg:'Se ha eliminado la platilla con exito'})
    })
}



function getByAccountSMSTemplate(req, res){
    let account_code = req.body.code
    SMS.find({ account_code:account_code}, (err, sms_templates)=>{
        if(err) return res.status(500).send({msg:'Ocurrió un error al crear la plantilla SMS', err:err})
        res.status(200).send(sms_templates)
    })
}

function getDataAccount(req, res, next){
    Account.findOne({code:req.body.account}, (error, account)=>{
        if(error) return res.status(500).send({err:err})
        account_data = account;
        next()
    })
}

function sendSMS(req, res){

    let number = req.body.number;
    const sms = req.body.body.toString();

    if( true ){

        let body = `account=${
            account
        }&apiKey=${
            apiKey
        }&token=${
            token
        }&toNumber=+${
            account_data.phone_code + number
        }&sms=${
            sms
        }`;
        
        request({
            uri: 'https://api101.hablame.co/api/sms/v2.1/send/',
            method:'POST',
            body: body,
            headers:{
                "Content-Type": "application/x-www-form-urlencoded"
            }
        },(err, response, body)=>{
            if(err) return res.status(500).send({err:err, response:response, body:body})

            res.status(200).send(body)
        } )

        



    } else {

        client.messages 
        .create({ 
            body: sms,
            from: '+13342924580',
            to: `+${account_data.phone_code}${number}` ,
            smartEncoded: true,
            maxPrice: 10,
        }) 
        .then(message => {
            
            res.status(200).send(message)
            console.log('RESPONSE: ', message)
        }, error => {
            return res.status(500).send({err:'error'})
        }) 
        .done();
    }
    

    
    
}

function shortenerLink(req, res){

    let id = req.body.orderId

    request({
        uri: "https://api.rebrandly.com/v1/links",
        method: "POST",
        body: JSON.stringify({
              destination: `https://ivvuo.com.co/#/customer/${id}`
            , domain: { fullName: "go.mecappnica.com.co" }
        //   , slashtag: "Prueba"
        //   , title: "con dominio local"
        }),
        headers: {
          "Content-Type": "application/json",
          "apikey": "0e1d248806ac4b81bde58551b348e675",
          "workspace": "87dcefc476c543ceb964cd81a687fa2b"
        }
      }, function(err, response, body) {
        var link = JSON.parse(body);
        if(err) return res.status(500).send({err:err, response:response, body:body})
        res.status(200).send({err:err, response:response, body:body}) 
        // console.log("Long URL was "+link.destination+", short URL is "+link.shortUrl);
      })
}

module.exports = {
    shortenerLink,
    getDataAccount,
    sendSMS,
    createSMSTemplate,
    getByAccountSMSTemplate,
    updateSMSTemplate,
    deletSMSTemplate,
    updateOneSMSTemplate
}