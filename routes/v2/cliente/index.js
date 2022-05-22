'use strict'

const express = require('express')
const ClientesControler = require('../../../controllers/v2/clientes')

const cliente = express.Router()

cliente.post('/crear', ClientesControler.crear )
cliente.post('/obtenerPorId', ClientesControler.obtenerPorId )
cliente.post('/editar', ClientesControler.editar)
cliente.post('/obtener', ClientesControler.obtener)
cliente.post('/registroClienteZonaClienteSchema', ClientesControler.registroClienteZonaCliente)
cliente.post('/iniciarSesion', ClientesControler.iniciarSesion)
cliente.post('/autenticar', ClientesControler.autenticarZonaCliente )
cliente.post('/enviarMensajeRestablecerContrasena', ClientesControler.enviarMensajeRestablecerContrasena )
cliente.post('/cambiarContrasenaZonaCliente', ClientesControler.cambiarContrasenaZonaCliente )



module.exports = cliente