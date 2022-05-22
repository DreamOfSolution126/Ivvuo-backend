const express = require('express');
const fileUpload = require('express-fileupload');
const awsService = require('../../../services/aws-s3.servicio');
const fs = require('fs')
const joi = require('joi')
const app = express();

app.use(fileUpload());

app.post('/upload', function(req, res) {

  // console.log('Body: ', req.body)
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('No files were uploaded.');
  }

  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
  let sampleFile = req.files.sampleFile;
  const nombre = req.files.sampleFile.name;
  const extension = nombre.split('.')[1]
  
  // Use the mv() method to place the file somewhere on your server

  sampleFile.mv( `uploads/${nombre}`, async (err) => {
    if (err)
      return res.status(500).send(err);

      try {
        const respuesta = await awsService.cargarArchivo('ivvuo01', `uploads/${nombre}` )
        // console.log('Respuesta: ', respuesta )
        fs.unlinkSync( `uploads/${nombre}` )
        res.send(respuesta)
      } catch ( error ) {
        res.send(error);
      }
      
    
  });
});

app.post('/iniciarCarga', async ( req, res) => {
  const data = req.body;

  // console.log('Payload: ', data )
  const iniciarCargaSchema = joi.object().keys({
    contentType: joi.string().required(),
    key: joi.string().required()
  }).required()

  const validacion = joi.validate( data, iniciarCargaSchema )

  if ( validacion.error ) {
    return res.status(400).send({
      estatus: false,
      resultadoOperacion: 'El payload de la solicitud no es valido',
      error: validacion.error
    })
  }

  try {
    const respuesta = await awsService.iniciarCarga( data );

    res.status(200).send( respuesta )
  } catch ( error ) {
    res.status(500).send( error )
  }
})

app.get('/obtenerUrlDeCarga', async ( req, res ) => {
  const payload = {
    fileName: req.query.fileName,
    partNumber: req.query.partNumber,
    uploadId: req.query.uploadId
  }

  try {
    const respuesta = await awsService.obtenerUrlDeCarga( payload );

    return res.status(200).send( respuesta )
  } catch (error) {
    return res.status(500).send( error )
  }
})

app.post('/completarCarga', async ( req, res ) => {

  const data = req.body
  const completarCargaSchema = joi.object().keys({
    params: joi.object().keys({
      fileName: joi.string().required(),
      parts: joi.string().required(),
      uploadId: joi.string().required()
    }).required()
  }).required()

  const validacion = joi.validate( data, completarCargaSchema )
  if ( validacion.error ) {
    return res.status(400).send({
      estatus: true,
      resultadoOperacion: 'EL payload de la solicitud no es valido',
      error: error
    })
  }
  const payload = {
    fileName: req.body.params.fileName,
    parts: req.body.params.parts,
    uploadId: req.body.params.uploadId
  }

  try {

    const respuesta = await awsService.completarCarga( payload )

    return res.status(200).send( respuesta )

  } catch (error) {

    return res.status(500).send( error )

  }
})


module.exports = app

