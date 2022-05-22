const Campanas = require('../../../models/campanasServicio.model');

const consultarCampanaServicio = async ( req, res ) => {
    const data = req.body;

    let existeCampana;
    try {
        existeCampana = await Campanas.find({ vin: data.vin, realizada: { $ne: false } })

    } catch (error) {
        return res.status(500).send({
            estatus: false,
            resultadoOperacion: 'Error al consultar las campanas de servicio'
        })
    }

    const respuesta = {
        estatus: true,
        resultadoOperacion: 'No se encontraron campanas',
        data: {
            campanas: []
        }
    }
    if ( existeCampana && existeCampana.length > 0 ) {
        respuesta.resultadoOperacion = 'Este vehiculo tiene campanas de servicio activas',
        respuesta.data.campanas = existeCampana;
    }

    return res.status(200).send( respuesta )
}

module.exports = {
    consultarCampanaServicio
}