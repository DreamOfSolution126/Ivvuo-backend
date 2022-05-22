'use strict'

const express = require('express')
const marcaController = require('../../../controllers/v2/marcas')

const marca = express.Router()

marca.post('/crear', marcaController.crear )
marca.post('/consulta', marcaController.consulta )
marca.post('/consultaPorId', marcaController.consultaPorId )
marca.post('/consultaPorIdCentros', marcaController.consultaPorIdCentros )
marca.post('/actualizar', marcaController.actualizar )
marca.get('/reporte/:id', marcaController.reporteXls )



module.exports = marca