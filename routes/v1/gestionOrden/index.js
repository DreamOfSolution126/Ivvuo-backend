'use strict'

const express = require('express')

const gestionOrden = require('../../../controllers/v1/asignarListado')
const editarOrden = require('../../../controllers/v1/editarOrden')
const ordenes = require('../../../controllers/v1/ordenes')
const ClientesControler = require('../../../controllers/v2/clientes')

const OR = express.Router()

OR.post('/asignarListado', 
    gestionOrden.obtenerOrden,
    gestionOrden.obtenerLista,
    gestionOrden.obtenerProcesos,
    gestionOrden.obtenerActividades,
    gestionOrden.consolidarListaChequeo,
    gestionOrden.incluirListadoEnOrden
)



OR.post('/contarOrdenesPorClienteSinFiltro',
    ordenes.contarOrdenesPorClienteSinFiltro
)
OR.post('/editarOrden',
    editarOrden.editarOrden
)

OR.post('/obtenerOrdenesTableroControl', 
    ordenes.obtenerOrdenesTableroControl
)


OR.post('/obtenerOrdenesDeCliente', 
    ordenes.obtenerOrdenesDeCliente
)

OR.post('/obtenerOrdenesPorCliente', 
    ordenes.obtenerOrdenesPorCliente
)

OR.post('/obtenerNotificacionesWhastapp',
    ordenes.obtenerNotificacionesWhastapp
)

OR.post('/obtenerValoresOrdenesCliente',
    ordenes.obtenerValoresOrdenesCliente
)

OR.post('/obtenerOrdenesDeClienteZonaCliente', ClientesControler.autenticarZonaCliente, ordenes.obtenerOrdenesDeClienteZonaCliente )
OR.post('/obtenerValoresOrdenesClienteZonaCliente', ClientesControler.autenticarZonaCliente, ordenes.obtenerValoresOrdenesClienteZonaCliente )


OR.post('/actualizaCotizacion', ordenes.actualizarCotizacion )

OR.post('/crearOrden',
    ordenes.crearOrden
)

module.exports = OR