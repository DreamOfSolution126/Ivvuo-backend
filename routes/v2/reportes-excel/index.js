'use strict'

const express = require('express')
const ReportesExcel = require('../../../controllers/v2/reportes-excel/cuenta')

const reportes = express.Router()

reportes.get('/reporteActvidades', ReportesExcel.reporteActividades )
reportes.get('/reporteActividadesCentro', ReportesExcel.reporteActividadesCentro )



module.exports = reportes