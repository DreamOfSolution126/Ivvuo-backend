'use strict'

const express = require('express')
const WhatsApp = express.Router()

const Whatsapp = require('../../../controllers/v1/whatsapp')
const Templates = require('../../../controllers/v1/whatsappTemplates')

WhatsApp.post('/enviar',
    Whatsapp.loadWhatsappConfig,
    Whatsapp.enviar
)

WhatsApp.post('/envioNotificacion',
    Whatsapp.loadWhatsappConfig,
    Whatsapp.envioNotificacion
)

WhatsApp.post('/recibir',
    Whatsapp.loadTemplate,
    Whatsapp.recibir
)

WhatsApp.post('/obtener',
    Whatsapp.obtener
)

WhatsApp.post('/actualizaciones',
    Whatsapp.actualizaciones
)

WhatsApp.post('/plantilla/crear',
    Templates.crear
)

WhatsApp.post('/plantilla/eliminar',
    Templates.eliminar
)

WhatsApp.post('/plantilla/lista',
    Templates.lista
)

WhatsApp.post('/plantilla/editar',
    Templates.editar
)

module.exports = WhatsApp