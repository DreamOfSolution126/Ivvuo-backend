'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const config = require('./configuraciones/variablesEntorno/config')

const api = require('./routes/v1')
const ERP = require('./routes/v1/integracion')
const OR = require('./routes/v1/gestionOrden')
const Cliente = require('./routes/v1/vistaCliente')
const Whatsapp = require('./routes/v1/whatsapp')

const OrdenesRouter = require('./routes/v2/orden')
const ClienteRouter = require('./routes/v2/cliente')
const VehiculoRouter = require('./routes/v2/vehiculo')
const ListaRouter = require('./routes/v2/lista')
const MarcaRouter = require('./routes/v2/marca')
const Aws = require('./routes/v2/aws-s3')
const Upload = require('./routes/v2/uploads')
const Campanas = require('./routes/v2/campanasServicio')
const ReportesExcel = require('./routes/v2/reportes-excel')

const cors = require('cors')

const corsOptions = {
  origin: config.frontend,
  credentials: true,
}


app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(cors() )

app.use(express.static('uploads'))
app.use(express.static('descargas'))
app.use(express.static('assets'))
app.use('/api', api)
app.use('/erp', ERP)
app.use('/orden', OR)
app.use('/cliente', Cliente)
app.use('/whatsapp', Whatsapp)
app.use(Upload)

app.use('/v2/orden', OrdenesRouter)
app.use('/v2/cliente', ClienteRouter)
app.use('/v2/vehiculo', VehiculoRouter)
app.use('/v2/lista', ListaRouter)
app.use('/v2/marca', MarcaRouter)
app.use('/v2/aws-s3', Aws)
app.use('/v2/campanas-servicio', Campanas )
app.use('/v2/reportes-excel', ReportesExcel )



module.exports = app