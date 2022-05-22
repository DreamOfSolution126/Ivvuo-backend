'use strict'

const express = require('express')
const VehiculoControler = require('../../../controllers/v2/vehiculos')

const vehiculo = express.Router()

vehiculo.post('/crear', VehiculoControler.crear )
vehiculo.post('/editar', VehiculoControler.editar )
vehiculo.post('/obtenerPorPlaca', VehiculoControler.obtenerPorPlaca )
vehiculo.post('/obtenerPorId', VehiculoControler.obtenerPorId )


module.exports = vehiculo