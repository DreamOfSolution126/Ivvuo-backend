'use strict'

const Cliente = require('../../models/clientes.model')
const Cuenta = require('../../models/account')
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId
const bcriptjs = require('bcrypt-nodejs')
const jwt = require('jwt-simple')
const config = require('../../configuraciones/variablesEntorno/config');
const { transporter } = require('../../controllers/v1/mailerController');
const moment = require('moment')
const { TIPO_DOCUMENTO } = require('../../models/enum')


async function crear ( payload ) {
    try {
        
        const cliente = payload;
        const cuentaId = cliente.cuenta

        const existeCliente = await Cliente.findOne({
            'identificacion.numero': cliente.identificacion.numero,
            cuenta: cuentaId,
        })

        if(existeCliente) {
            return {
                estatus: false,
                id: existeCliente._id,
                resultadoOperacion: 'Cliente ya existe'
            }
        }

        const nuevoCliente = new Cliente( cliente )
        const respuesta = await nuevoCliente.save()

        return {
            estatus: true,
            id: respuesta._id,
            cliente: respuesta,
            resultadoOperacion:'Cliente creado'
        }

    } catch ( error ) {
        console.log("Cliente servicio: Error ", JSON.stringify(error))
        return {
            estatus: false,
            resultadoOperacion: 'Error al crear el cliente',
            error: error
        }
    }
}

async function obtener ( payload ) {
    try {
        
        const numeroIdentificacion = payload.identificacion
        const cuentaId = payload.cuenta

        const existeCliente = await Cliente.findOne({
            "identificacion.numero": numeroIdentificacion,
            cuenta: cuentaId,
        })

        if(!existeCliente) {
            return {
                estatus: false,
                resultadoOperacion: 'No se encontró información'
            }
        }

        return {
            estatus: true,
            data: existeCliente,
            resultadoOperacion:'Se encontró información'
        }

    } catch ( error ) {
        console.error("Cliente servicio: obtener ", JSON.stringify(error))
        return {
            estatus: false,
            resultadoOperacion: 'Error al obtener el cliente',
            error: error 
        }
    }
}

async function obtenerPorId ( payload ) {
    try {
        const id = ObjectId( payload.id )

        const existeCliente = await Cliente.findById({ _id: id })

        if (!existeCliente) {
            return {
                estatus: false,
                resultadoOperacion: 'Se encontró información'
            }
        }

        return {
            estatus: true,
            resultadoOperacion: 'Cliente encontrado',
            cliente: existeCliente
        }

    } catch ( error ) {
        console.error("Cliente servicio: obtenerPorId ", error )
        return {
            estatus: false,
            resultadoOperacion: 'Error al obtener el cliente',
            error: error 
        }
    }
}

async function editar ( payload ) {
    try {

        const data = payload.data
        const id = ObjectId( payload.id )
        const existeCliente = await Cliente.findById({ _id: id })

        if(!existeCliente) {
            return {
                estatus: false,
                resultadoOperacion: 'Este cliente no existe o fué eliminado'
            }
        }

        const { email, identificacion, nombre, telefono, direcciones, cuenta } = data;

        const cuentaId = ObjectId( cuenta )
        if ( identificacion.numero !== existeCliente.identificacion.numero ) {
            const identificacionNoDisponible = await Cliente.findOne({
                "identificacion.numero": identificacion.numero,
                cuenta: cuentaId
            })

            if ( identificacionNoDisponible ) {
                return {
                    estatus: false,
                    id: identificacionNoDisponible._id,
                    resultadoOperacion: 'Esta identificacion pertenece a otro cliente'
                }
            }
        }

        const newCliente = {
            email: email ? email : existeCliente.email,
            identificacion: identificacion ? identificacion : existeCliente.identificacion,
            nombre: nombre ? nombre : existeCliente.nombre,
            telefono: telefono ? telefono : existeCliente.telefono,
            direcciones: direcciones ? direcciones : existeCliente.direcciones,
        }

        await Cliente.findByIdAndUpdate({ _id: id }, newCliente )

        return {
            estatus: true,
            resultadoOperacion: 'Cliente actualizado'
        }

    } catch ( error ) {
        console.error('Cliente servicion: Editar ', error)
        return {
            estatus: false,
            resultadoOperacion: 'Error al actualizar el cliente'
        }
    }
}

async function registroClienteZonaClientes ( payload ) {
    try {

        const data = payload;
        const cuenta = ObjectId( payload.cuenta )
        const tipo = payload.identificacion.tipo;
        const numero = payload.identificacion.numero;

        const hash = bcriptjs.genSaltSync()
        const contrasena = bcriptjs.hashSync( data.contrasena, hash );

        const existeCliente = await Cliente.findOne({
            cuenta: cuenta,
            'identificacion.tipo': tipo,
            'identificacion.numero': numero
        })

        if ( existeCliente && existeCliente.creadoDesdeZonaCliente ) {
            return {
                estatus: false,
                resultadoOperacion: 'Este cliente ya esta registrado, puede iniciar sesion'
            }
        } else if ( existeCliente && !existeCliente.creadoDesdeZonaCliente) {
            
            const idCliente = ObjectId( existeCliente._id )
            const editarCliente = {
                centro: existeCliente.centro,
                creado: existeCliente.creado,
                contrasena: contrasena,
                cuenta: existeCliente.cuenta,
                email: data.email,
                identificacion: data.identificacion,
                nombre: data.nombre,
                telefono: existeCliente.telefono,
                direcciones: existeCliente.direcciones,
                creadoDesdeZonaCliente: true
            }

            const resultado = await Cliente.findByIdAndUpdate({_id: idCliente }, editarCliente )
            return {
                estatus: true,
                resultadoOperacion: 'Se ha registrado el cliente',
                cliente: resultado
            }
        }

        const nuevoCliente = new Cliente( data )

        const resultado = await nuevoCliente.save();

        return {
            estatus: true,
            resultadoOperacion: 'Se ha registrado el cliente',
            cliente: resultado
        }

    } catch ( error ) {
        console.error('Cliente servicio: registroClienteZonaClientes ', error)
        return {
            estatus: false,
            resultadoOperacion: 'Error al registrar cliente'
        }
    }
}

async function iniciarSesion ( payload ) {
    try {

        const data = payload;
        const cuenta = ObjectId(data.cuenta);
        const tipo = data.identificacion.tipo;
        const numero = data.identificacion.numero;
        const contrasena = data.contrasena;
        const aceptarTerminos = data.aceptarTerminosyCondiciones

        if ( !aceptarTerminos ) {
            return {
                estatus: false,
                resultadoOperacion: 'Acepte los terminos y condiciones'
            }
        }

        const existeCliente = await Cliente.findOne({
            'identificacion.tipo': tipo,
            'identificacion.numero': numero,
            cuenta: cuenta

        })

        if ( !existeCliente ) {
            return {
                estatus: false,
                resultadoOperacion: 'Credenciales no validas',
            }
        }

        const validacionContrasena = await bcriptjs.compareSync( contrasena, existeCliente.contrasena)

        if ( !validacionContrasena ) {
            return {
                estatus: false,
                resultadoOperacion: 'Credenciales no validas',
                data: validacionContrasena
            }
        }

        const token = jwt.encode( existeCliente, config.SECRET_TOKEN )

        return {
            estatus: true,
            resultadoOperacion: 'Inicio de sesion exitoso',
            data: token
        }
        
    } catch ( error ) {
        console.error('Cliente servicio: iniciarSesion ', error)
        return {
            estatus: false,
            resultadoOperacion: 'Error al iniciar sesion.'
        }
    }
}

async function autenticar ( payload ) {
    try {
        const token = payload.token;
        const decode = jwt.decode( token, config.SECRET_TOKEN )

        console.log( 'decode token: ', decode )

        return {
            estatus: true,
            resultadoOperacion: 'Autenticado',
            cliente: decode
        }

    } catch ( error ) {
        console.error('Cliente servicio: autenticar ', error)
        return {
            estatus: false,
            resultadoOperacion: 'Error al autenticar: ZonaCliente'
        }
    }
}

async function enviarMensajeRestablecerContrasena ( payload ) {
    try {
        const email = payload.email;
        const identificacion = payload.identificacion.numero;
        const tipo = payload.identificacion.tipo;
        const cuenta = ObjectId( payload.cuenta )

        const existeCliente = await Cliente.findOne({
            email: email,
            'identificacion.numero': identificacion,
            'identificacion.tipo': tipo,
            cuenta: cuenta
        })

        if ( !existeCliente ) {
            return {
                estatus: false,
                resultadoOperacion: 'No es posible continuar con la operacion'
            }
        }

        const existeCuenta = await Cuenta.findById({_id: ObjectId( existeCliente.cuenta )})

        const paraCodificar = {
            cuenta: payload.cuenta,
            id: existeCliente._id,
            fecha: moment().tz('America/Bogota').format(),
            plazoMaximo: moment().tz('America/Bogota').add(10, 'minutes').format()
        }

        const tokenRestablecerContrasena = jwt.encode( paraCodificar, config.SECRET_TOKEN )

        let nombre = 'Cliente'
        if ( existeCliente.identificacion.tipo === TIPO_DOCUMENTO.NIT ) {
            nombre = existeCliente.nombre.razonSocial
        } else {
            nombre = `${existeCliente.nombre.nombres} ${existeCliente.nombre.apellidos}`
        }
        const link = `${config.frontend}/#/recuperarContrasena/${tokenRestablecerContrasena}`
        console.log('Cliente: token => ', tokenRestablecerContrasena )
        const opcionesEnvioEmail = {
            from:'Ivvuo <notificaciones@ivvuo.com>',
            to: email,
            subject:'Ivvuo Notificación seguridad: Cambio de contraseña',
            html: `
            <!DOCTYPE html>
        <html xmlns="http://www.w3.org/1999/xhtml" lang="en">
        <head>
            <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
            <meta name="viewport" content=" initial-scale=1.0"/>
            <meta charset="UTF-8">
            <title>Notificación Diagnóstico</title>
        </head>
        <body bgcolor="#343a40" width:"100%" style="background-color: #f8f9fa; margin: 0; padding: 0;font-size:16px; font-family: 'Arial', Tahoma, Geneva, Verdana, sans-serif">
         
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
                                    <img align="center" width="150" height="auto" style="display: block;" src="${existeCuenta.logo.url}" alt="">
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
                <tr bgcolor="#fff" align="left" style="background-color:#fff;">
                    <td style="font-family: Arial, sans-serif; padding-left:15px">
                        <br>
                        <p>Estimad(@) <br> 
                            <strong style="text-transform: uppercase">${nombre}</strong>
                        </p>
                        
                    </td>
                </tr>
                <tr align="left" bgcolor="#fff" style="background-color:#fff">
                    <td style="font-family: Arial, sans-serif; padding-left:16px; padding-right:15px; padding-bottom: 15px;"  >
                        <br>
                        <p style="color:#212529;"> 
                            Hemos recibido una solicitud para cambiar su contrasena, si desea hacerlo puede dar clic sobre el boton cambiar contrasena.
                        </p>
                        <br>
                        
                        <br>
                        
                        <!-- <span style="color:#6c757d"> <small>Muchas gracias por su visita:</small> <br>
                            Para ver la cotización por favor clic en el siguiente botón
                        </span> <br> -->
                        
                    </td>
                </tr>
                <tr align="center" bgcolor="#fff" style="background-color:#fff">
                    <td style="padding-left: 15px; padding-top:15px; padding-right:15px; padding-bottom: 15px;" >
                        <table border="0" cellpadding="0" cellspacing="0" width="100%">
                            <tr align="center">
                                <td width="190" style="padding-top:15px; padding-bottom:15px;"></td>
                                <td width="260" bgcolor="#eee" style="color:#fff; padding-left:15px; padding-right:15px; padding-top:15px; padding-bottom:15px;">
                                    <a style="font-family: Arial, sans-serif; color:#555; text-decoration:none;" href="${link}">
                                        Cambiar contrasena
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
                            En caso que no pueda usar el boton puede copiar y pegar este link <br>
                            <br>
                            <a href="${link}">${link}</a>
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
                                Este correo y cualquier archivo anexo pertenecen al ${existeCuenta.name}. y son para uso exclusivo del destinatario intencional. 
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
        const resultadoEnvio = await transporter.sendMail(opcionesEnvioEmail)

        console.log('enviarMensajeRestablecerContrasena: ', resultadoEnvio)
        return {
            estatus: true,
            resultadoOperacion: 'Hemos enviado un email con las instrucciones para recuperar la contrasena',
            fecha: moment().tz('America/Bogota').format(),
            plazoMaximo: moment().tz('America/Bogota').add(1, 'hour').format()
        }

    } catch ( error ) {
        console.error('Cliente servicio: enviarMensajeRestablecerContrasena ', error)
        return {
            estatus: false,
            resultadoOperacion: 'Error al enviarMensajeRestablecerContrasena: ZonaCliente'
        }
    }
}

async function cambiarContrasenaZonaCliente ( payload ) {
    try {
        const contrasena = payload.contrasena;
        const token = payload.token;

        const decode = jwt.decode( token, config.SECRET_TOKEN )

        const fecha = moment().tz('America/Bogota').format()

        if ( fecha > decode.plazoMaximo ) {
            return {
                estatus: false,
                resultadoOperacion: 'Esta ventana de cambio de contrasena ya esta vencida, vuelva a solicitar el cambio de la contrasena'
            }
        }

        const cuenta = ObjectId( decode.cuenta )
        const existeCuenta = await Cuenta.findById({_id: cuenta })

        if ( !existeCuenta.zonaCliente.estatus ) {
            return {
                estatus: false,
                resultadoOperacion: 'No existe una zona de clientes activa para esta cuenta'
            }
        }
        const salt = bcriptjs.genSaltSync( )
        const hash = bcriptjs.hashSync( contrasena, salt )

        await Cliente.update({ _id: ObjectId( decode.id ) }, { $set:{'contrasena': hash }})

        return {
            estatus: true,
            resultadoOperacion: 'Contrasena actualizada con exito',
            ruta: existeCuenta.zonaCliente.ruta
        }

    } catch ( error ) {
        console.error('Cliente servicio: cambiarContrasenaZonaCliente ', error)
        return {
            estatus: false,
            resultadoOperacion: 'Error al actualizar la contrasena'
        }
    }
}

module.exports = {
    autenticar,
    cambiarContrasenaZonaCliente,
    crear,
    editar,
    enviarMensajeRestablecerContrasena,
    iniciarSesion,
    obtener,
    obtenerPorId,
    registroClienteZonaClientes
}