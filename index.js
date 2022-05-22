'use strict'

const app = require('./app')
const config = require('./configuraciones/variablesEntorno/config')
const http = require('http').Server(app)
const { conectarBaseDeDatos } = require('./configuraciones/bdd')

http.listen ( config.port, async () => {
    await conectarBaseDeDatos()

    console.log('Servidor corriendo en: ', `http://localhost:${config.port}`)
} )