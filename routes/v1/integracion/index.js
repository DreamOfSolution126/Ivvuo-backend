'use strict'

const express = require('express')

const Integracion = require('../../../controllers/v1/integracion')
const ShortLink = require('../../../controllers/v1/shortLink')
const EditarOrden = require('../../../controllers/v1/editarOrden')

const ERP = express.Router()


ERP.post('/crearOrden',
    Integracion.validarOrdenDuplicada,
    Integracion.obtenerDatosCuenta,
    Integracion.obtenerDatosCentro,
    Integracion.crearOrdenTrabajo,
    ShortLink.registrarShortLink,
    EditarOrden.editarOrden
)

ERP.post('/agregarCotizacion', Integracion.agregarCotizaciones )

module.exports = ERP
