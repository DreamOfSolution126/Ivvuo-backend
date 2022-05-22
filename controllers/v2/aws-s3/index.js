const { crearBucket, getFile  } = require('../../../services/aws-s3.servicio');

const crearBucketController = async( req, res ) => {
    try {
        const respuesta = await crearBucket('ivvuo01')

        return res.status(200).send( respuesta )
    } catch ( error ) {
        return res.status(500).send( error )
    }
}

const getFileController = async( req, res ) => {

    const key = req.query.key;
    const bucket = req.query.bucket;

    // console.log('Req: ', req.query )
    try {
        const respuesta = await getFile( key, bucket )

        // res.writeHead(200, { 'Content-Type': 'video/mp4' });
        // res.setHeader('Content-Type', 'video/mp4')
        // console.log('respuesta: ', respuesta )

        return res.status(200).send( respuesta )
    } catch ( error ) {
        return res.status(500).send( error )
    }
}

module.exports ={
    crearBucketController,
    getFileController
}