'use strict'

const express = require('express')
const Cliente = express.Router()

const ShortLink = require('../../../controllers/v1/shortLink')

Cliente.post('/obtenerIdOrden',
    ShortLink.obtenerIdOrden
)

module.exports = Cliente