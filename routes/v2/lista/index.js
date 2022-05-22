'use strict'

const express = require('express')
const ListaControler = require('../../../controllers/v2/listas')

const lista = express.Router()

lista.post('/crear', ListaControler.crear )
lista.post('/editar', ListaControler.editar )
lista.post('/eliminar', ListaControler.eliminar )
lista.post('/obtenerListasPorCuenta', ListaControler.obtenerListasPorCuenta )


module.exports = lista