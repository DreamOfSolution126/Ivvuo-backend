'use strict'

const express = require('express')
const CampanasController = require('../../../controllers/v2/campanasServicio')

const campanas = express.Router()

campanas.post('/consultaVin', CampanasController.consultarCampanaServicio )



module.exports = campanas