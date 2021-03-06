'use strict'
const nodemailer = require('nodemailer')
const User = require('../../models/user')
const bcrypt = require('bcrypt-nodejs')
const crypto = require('crypto')

// const transporter = nodemailer.createTransport({
//     service:'Gmail',
//     auth:{
//         user: 'standardsystems.developer@gmail.com',
//         pass:'Feactitudpasion1987'
//     }
// })


//  const transporter = nodemailer.createTransport({
//     host:'https://ivvuo.com',
//     port:465,
//     secure:true,
//     auth:{
//         user:'notificaciones@ivvuo.com',
//         pass:'N,i-2,nS-z_c'
//     },
//     tls: {ciphers:'SSLv3'}
// })

const transporter = nodemailer.createTransport({
    // pool: true,
    host: "mail.ivvuo.com",
    port: 587,
    secure: false, // use TLS
    auth: {
        user:'notificaciones@ivvuo.com',
        pass:'ie=&Mg(8jR6t'
    },
    tls: {
        // do not fail on invalid certs
        rejectUnauthorized: false
      }
  })

/**
 * 
 * Modificar para el envio automatizado de correos
 * acorde a la imagen corporativa
 */
function getNewPass(req, res){ 
    let newPassword = Math.random().toString(36).substring(2,15)+Math.random().toString(36).substring(2,15)
    let email_user = req.body.user
    let user = {
        password: ''
    }

    bcrypt.genSalt(10, (err, salt)=>{
        if(err) return res.status(500).send({msg:`Ocurrio un error al encriptar el password ${err}`})
        bcrypt.hash(newPassword, salt, null, (err, hash)=>{
            if(err) return res.status(500).send({msg:`Ocurrio un error al hashear el password ${err}`})
            user.password = hash
            // console.log(`Email que llega al controlador; ${req.body.email}`)
            User.findOneAndUpdate({'email':req.body.email}, user, (err, getNewPass)=>{
                if(err) return res.status(500).send({message:`Ocurrio un error al actualizar el password ${err}`})
                
                const mailOptions = {
                    from:'Ivvuo <notificaciones@ivvuo.com>',
                    to: req.body.email,
                    subject:'Ivvuo Notificaci??n seguridad: Cambio de contrase??a',
                    text: `Este es su nuevo password ${newPassword} `,
                    html:`<!DOCTYPE html>
                    <html xmlns="http://www.w3.org/1999/xhtml" lang="en">
                    <head>
                        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
                        <meta name="viewport" content=" initial-scale=1.0"/>
                        <meta charset="UTF-8">
                        <title>[KASC] Notificaci??n Cambio Contrase??a</title>
                    </head>
                    <body bgcolor="#eee" style="margin: 0; padding: 0;font-size:16px; font-family: 'Arial', Tahoma, Geneva, Verdana, sans-serif">
                     
                        <table bgcolor="#fff" align="center" cellpading="0" width="640" border="0" cellpadding="0" cellspacing="0" style="margin-top:15px; border-collapse: collapse;">
                            <tr bgcolor="#343a40" >
                                <td align="right" style="padding-bottom:5px; padding-top:5px; padding-right:5px;">
                                    <a href="" style="font-size:0.6em; font-family: Arial, sans-serif; color:#eeeeee; text-decoration:none;">Metrokia S.A. | Importadora</a>
                                </td>
                            </tr>
                            <tr bgcolor="#fff">
                                <td width="100%">
                                    <!-- <img width="200" height="auto" style="display: block;" src="https://app.kia.com.co/assets/logo_email.png" alt=""> -->
                                    <table  border="0" cellpadding="0" cellspacing="0" width="100%">
                                        <tr>&nbsp;</tr>
                                        <tr style="margin-top:15px;">
                                            <td align="left" style="padding-left:15px;">
                                                <img width="80" height="auto" style="display: block;" src="https://app.kia.com.co/assets/logo_kasc.png" alt="">
                                            </td>
                                            <td align="right" style="padding-right:15px;">
                                                <img width="160" height="auto" style="display: block;" src="https://app.kia.com.co/assets/kia_promise_to_care.png" alt="">
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                            <tr align="center">
                                <td style="font-family: Arial, sans-serif;">
                                    <br>
                                    <p>Notificaci??n de cambio de contrase??a</p>
                                    <small>____ _ ____</small>
                                </td>
                            </tr>
                            <tr align="center" bgcolor="" >
                                <td style="font-family: Arial, sans-serif; padding-left:16px; padding-right:15px; padding-bottom: 15px;"  >
                                    <br>
                                    <h3 style="color:#212529; text-transform: capitalize;">${newPassword}</h3>
                                    <br>
                                    Estimado usuario, esta es su nueva contrase??a, recuerde que puede cambiarla en cualquier momento, haciendo clic en las opciones en la parte superior derecha de la barra de navegaci??n del sitio.
                                    <br> <br>
                                    <p style="color:#6c757d"><em> Si este correo es inesperado, por favor notifiquelo a <a style="text-decoration:none; color:rgb(180, 180, 180);" href="mailto:mtkingdespos@kia.com.co"> mtkingdespos@kia.com.co</a></em></p>
                                    
                                    <small>____ _ ____</small>
                                </td>
                            </tr>
                            
                            <tr align="center" bgcolor="#fff">
                                <td style="padding-left: 15px; padding-top:15px; padding-right:15px; padding-bottom: 15px;" >
                                    <!-- <a href="https://app.kia.com.co" role="button" bgcolor="#" style="border-radius: 25px; text-decoration:none; color:#fff; width:260px; padding-top:15px; padding-bottom:15px; background-color: #bb162b; display:block; margin-top:15px; margin-bottom:15px; margin-left:15px; margin-right:15px;">
                                        <span style="font-family: Arial, sans-serif; font-size: 18px;">Inicia sesi??n ahora</span>
                                    </a> -->
                                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                        <tr align="center">
                                            <td width="190" style="padding-top:15px; padding-bottom:15px;"></td>
                                            <td width="260" bgcolor="#bb162b" style="color:#fff; padding-left:15px; border-radius: 25px; padding-right:15px; padding-top:15px; padding-bottom:15px;">
                                                <a href="https://app.kia.com.co" role="button" bgcolor="#bb162b" style=" text-decoration:none; color:#fff; background-color: #bb162b; display:block;">
                                                    <span style="font-family: Arial, sans-serif; font-size: 18px;">Inicia sesi??n ahora</span>
                                                </a>
                                            </td>
                                            <td width="190" style="padding-top:15px; padding-bottom:15px;"></td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                            <tr bgcolor="#343a40">
                                <td style="font-family: Arial, sans-serif; font-size:12px; color:rgb(180, 180, 180); padding-left: 15px; padding-top:15px; padding-right:15px; padding-bottom: 15px;">
                                    <span style="font-size:12px;">
                                        <strong>Metrokia S.A</strong> Posventa Importadora <br> 
                                        <strong>D</strong> Calle 224 No. 9 - 60, <strong>T</strong> 364 9700 Ext 1264 <strong>E</strong> <a style="text-decoration:none; color:rgb(180, 180, 180);" href="mailto:mtkingdespos@kia.com.co"> mtkingdespos@kia.com.co</a> <br>
                                        <small>Bogot?? D.C. ??? Colombia</small>
                                    </span> <br> <br>
                                    <span style="font-family: Arial, sans-serif; text-align:justify; font-size:10px; color:rgb(131, 130, 130);">
                                        Este correo y cualquier archivo anexo pertenecen a METROKIA S.A. y son para uso exclusivo del destinatario intencional. 
                                        Esta comunicaci??n puede contener informaci??n confidencial o de acceso privilegiado. Si usted ha recibido este correo por 
                                        error, equivocaci??n u omisi??n favor notificar en forma inmediata al remitente y eliminar dicho mensaje con sus anexos. 
                                        La utilizaci??n, copia, impresi??n, retenci??n, divulgaci??n, reenvi?? o cualquier acci??n tomada sobre este mensaje y sus 
                                        anexos queda estrictamente prohibido y puede ser sancionado legalmente.         ??Yo tambi??n soy Cero Papel!
                                    </span>
                                </td>
                            </tr>
                        </table>
                    </body>
                    </html>
                    
                    `
                }
            
                transporter.sendMail(mailOptions, (err, info)=>{
                    if(err) return res.status(500).send({msg:`algo fallo y no que fue ${err}`})
                    res.status(200).send({msg:`Mensaje enviado`})
                })
            })
        })

    })
}

module.exports = {
    // sendEmailTest,
    getNewPass,
    transporter
}