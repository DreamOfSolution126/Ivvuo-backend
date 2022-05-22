'use strict'

const express = require('express')
const OrdenesControlador = require('../../../controllers/v2/ordenes')

const ordenes = express.Router()

ordenes.post('/crear', OrdenesControlador.crear )
ordenes.post('/editar', OrdenesControlador.editar )
ordenes.post('/obtener', OrdenesControlador.obtener )
ordenes.post('/listado', OrdenesControlador.listado )


module.exports = ordenes