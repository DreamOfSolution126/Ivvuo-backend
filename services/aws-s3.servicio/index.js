'use strict'
const AWS = require('aws-sdk')
const fs = require('fs')
const path = require('path')
const config = require('../../configuraciones/aws/awsConfig')

const getFile = async ( fileName, buckeName) => {

    const conexionServicio = new AWS.S3( config );

    const parametros = {
        Bucket: buckeName,
        Key: fileName
    }

    let file
    try {
        file = await conexionServicio.getObject( parametros ).promise();
    } catch ( error ) {
        return error
    }

    return file
    // const buffer = Buffer.from( file.Body )

    // try {
    //     fs.writeFileSync( 'descargas/'+ fileName, buffer )
    // } catch (error) {
    //     return error
    // }

    // console.log( buffer )
    // return 'descargas/'+ fileName

}

const crearBucket = async ( buckeName ) => {
    const parametros = {
        Bucket: buckeName
    }

    console.log('aws config: ', config )

    const conexionServicio = new AWS.S3( config );

    return await conexionServicio.createBucket( parametros ).promise();

}

const cargarArchivo = async ( buckeName, pathFile ) => {

    const parametros = {
        Bucket: 'ivvuo01',
        Body: '',
        Key: pathFile,
        ACL: 'public-read'
    }
    const fileStream = fs.createReadStream( pathFile );

    fileStream.on('error', (error) => {
        console.log('Error fileStream: ', error );
    })
    parametros.Body = fileStream
    parametros.Key = path.basename( pathFile )

    const conexionServicio = new AWS.S3( config );

    try {
        const respuesta = await conexionServicio.upload( parametros ).promise()
        return respuesta;
    } catch ( error ) {
        return error
    }
}

const iniciarCarga = async ( payload ) => {

    const data = payload
    const parametros = {
        Bucket: 'ivvuo01',
        Key: data.key,
        ContentType: data.contentType
    }

    const conexionServicio = new AWS.S3( config )

    try {
        return await conexionServicio.createMultipartUpload( parametros ).promise()
    } catch (error) {
        return {
            estatus: false,
            resultadoOperacion: 'Error al iniciar la subida del archivo'
        }
    }
}

const obtenerUrlDeCarga = async ( payload ) => {

    const data = payload;
    const fileName = data.fileName;
    const partNumber = data.partNumber;
    const uploadId = data.uploadId;

    const parametros  = {
        Bucket: 'ivvuo01',
        Key: fileName,
        PartNumber: partNumber,
        UploadId: uploadId
    }

    const conexionServicio = new AWS.S3( config )

    try {
        const respuesta = await conexionServicio.getSignedUrl('uploadPart', parametros ).promise();
        return {
            estatus: true,
            resultadoOperacion: 'Url obtenida exitosamente',
            data: respuesta
        }
    } catch (error) {
        return {
            estatus: false,
            resultadoOperacion: 'Error al obtener la url',
            error: error
        }
    }
}

const completarCarga = async ( payload ) => {
    const data = payload;
    const parametros = {
        Bucket: 'ivvuo01',
        Key: data.fileName,
        MultipartUpload: {
            Parts: data.parts
        },
        UploadId: data.uploadId
    }

    const conexionServicio = new AWS.S3( config );

    try {
        const respuesta = await conexionServicio.completeMultipartUpload( parametros ).promise();

        return {
            estatus: true,
            resultadoOperacion: 'Multiparte Completa',
            data: respuesta
        }
    } catch (error) {
        return {
            estatus: false,
            resultadoOperacion: 'Error al completar',
            error: error
        }
    }
}

module.exports = {
    getFile,
    crearBucket,
    cargarArchivo,
    iniciarCarga,
    obtenerUrlDeCarga,
    completarCarga
}
