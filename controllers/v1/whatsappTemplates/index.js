const WhatsappTemplatesModel = require('../../../models/whatsappTemplate.model')
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId

async function crear ( req, res ) {
    try {

        const existeTemplate = await WhatsappTemplatesModel.findOne({
            account: ObjectId(req.body.account),
            nombre: req.body.nombre
        })

        if( existeTemplate ) {
            return res.status(200).send({
                data:{
                    estatus: false,
                    resultadoOperacion: 'Este nombre de plantilla ya fue usado'
                }
            })
        }
        const newPlantilla = {
            account: ObjectId(req.body.account),
            nombre: req.body.nombre,
            cuerpo: req.body.cuerpo,
            encabezado: req.body.encabezado
        }
        const whatTemplate = new WhatsappTemplatesModel( newPlantilla )

        await whatTemplate.save()

        return res.status(200).send({
            data:{
                estatus: true,
                resultadoOperacion: 'Plantilla creada con éxito'
            }
        })
    } catch ( error ) {
        return res.status(500).send({
            data:{
                estatus: false,
                resultadoOperacion: 'Error al crear la plantilla'
            },
            error: error
        })
    }
}

async function eliminar ( req, res ) {
    try {

        const id = ObjectId(req.body._id)
        const existeTemplate = await WhatsappTemplatesModel.findById({
            _id: id
        })

        if( !existeTemplate ) {
            return res.status(500).send({
                data:{
                    estatus: false,
                    resultadoOperacion: 'Esta plantilla no existe o ya fue eliminada'
                }
            })
        }

        await WhatsappTemplatesModel.findByIdAndRemove({_id: id })

        return res.status(200).send({
            data:{
                estatus: true,
                resultadoOperacion: 'Plantilla eliminada con éxito'
            }
        })
    } catch ( error ) {
        return res.status(500).send({
            data:{
                estatus: false,
                resultadoOperacion: 'Error al eliminar la plantilla'
            },
            error: error
        })
    }
}

async function lista ( req, res) {
    try {
        const account = ObjectId( req.body.account )

        const respuesta = await WhatsappTemplatesModel.find({ account: account })

        return res.status(200).send({
            data:{
                estatus: true,
                resultadoOperacion: 'Plantillas obtenidas con éxito',
                plantillas: respuesta
            }
        })
    } catch ( error ) {
        return res.status(500).send({
            data:{
                estatus: false,
                resultadoOperacion: 'Error al obtener las plantillas'
            },
            error: error
        })
    }
}

async function editar ( req, res ) {
    try {
        const id = ObjectId(req.body._id)
        const data = req.body
        const existeTemplate = await WhatsappTemplatesModel.findById({
            _id: id
        })

        if( !existeTemplate ) {
            return res.status(500).send({
                data:{
                    estatus: false,
                    resultadoOperacion: 'Esta plantilla no existe o ya fue eliminada'
                }
            })
        }

        await WhatsappTemplatesModel.findByIdAndUpdate({
            _id: id
        }, data )

        return res.status(200).send({
            data:{
                estatus: true,
                resultadoOperacion: 'Plantilla editada con éxito'
            }
        })

    } catch ( error ) {
        return res.status(500).send({
            data:{
                estatus: false,
                resultadoOperacion: 'Error al editar la plantilla'
            },
            error: error
        })
    }
}

module.exports = {
    crear,
    editar,
    eliminar,
    lista
}
