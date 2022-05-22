'use strict'

const mongoose = require('mongoose')
const Center = require('../../models/center')
const Cuenta = require('../../models/account')
const ObjectId = mongoose.Types.ObjectId
const jwt = require('jwt-simple')
const config = require('../../configuraciones/variablesEntorno/config')
const Accounts = require('twilio/lib/rest/Accounts')

const select = false

function centerCount(req, res){
    Center.countDocuments({}, (err, count)=>{
        if(err) return res.status(500).send({msg:`Error al Obtener los datos ${err}`})
        res.status(200).send({count:count})
    })
}

async function newCenter(req, res){

    try {

        const sign = jwt.encode({
            code: req.body.code,
            account: req.body.account
        }, config.SECRET_TOKEN )

        const totalCentros = await Center.countDocuments({})

        const arg = { cod:'CS' }
        const cantidad = 1000 + totalCentros
        arg.cod += cantidad
        const center = new Center({
            apiKey: sign,
            name: req.body.name,
            code: arg.cod,
            zone: req.body.zone,
            city: req.body.city,
            address: req.body.address,
            account: req.body.account,
            direccion: req.body.direccion,
            telefono: req.body.telefono,
            notas: req.body.notas
        })

        await center.save()

        return res.status(200).send({
            msg:`Se ha creado con exito`
        })

    } catch ( error ) {
        return res.status(500).send({
            msg: `Error al crear el centro de servicio ${JSON.stringify(error)}`
        })
    }
    
}
// Obtener los centros de servicio para cada cuenta
function getCenterById(req, res){
    let id = req.body.id
    let skip = req.body.skip
    let limit = req.body.limit
    Center.aggregate([
        { $match: { account:ObjectId(id) } },
        { $skip:skip},
        // { $limit:limit},
        { $project:{
            _id:1,
            name: "$name",
            code: "$code",
            zone: "$zone",
            city: "$city",
            address:"$address",
            account: "$account",
            created: "$created",
            active: "$active",
            select: "$select",
            notas: { $ifNull: [ "$notas", "" ]},
            direccion: { $ifNull: [ "$direccion", {
                direccion: "",
                ciudad: "",
                departamento: "",
                pais: ""
            } ] },
            telefono: { $ifNull: [ "$telefono", {
                indicativo: "",
                numero: ""
            } ] }
        }}
    ], (err, center)=>{
        if(err) return res.status(500).send({msg:`Error al consultar los Centros ${err}`})
        res.status(200).send(center)
    })
}
// Contar los servicios totales de cierta cuenta
function getCountCenterById(req, res){
    let id = req.body.id
    Center.countDocuments({account:ObjectId(id)}, (err, count)=>{
        if(err) return res.status(500).send({msg:'Error al contar los datos', err:err})
        res.status(200).send({total:count})
    })
}

function editCenter(req, res){
    let id = req.body._id
    let update = req.body

    Center.findByIdAndUpdate(id,update, (err, center)=>{
        if(err) return res.status(500).send({msg:`Error al editar el centro de servicio ${err}`})
        res.status(200).send({msg:`Se han guardado los cambios`})
    })
}

function getCenters(req, res){
    let active = req.body.active
    Center.aggregate([
        { $match: { active:{ $in:active } }}
    ],(err, center)=>{
        if(err) res.status(500).send({msg:`Error al obtener los centros de servicio`})
        res.status(200).send(center)
    })
}

const consultaListaCentros = async ( req, res ) => {
    try {
        const data = req.body
        const centrosDeLaMarca = data.centros
        const idCentros = [];
        centrosDeLaMarca.map( i => {
            idCentros.push( i )
        })

        const centros = await Center.aggregate([
            { $match: { active: true }},
            { $sort: { name: 1 }}, 
            { $group: { 
                _id: { id:"$account", nombre:"pendiente"},
                centros: { $push: {
                    nombre:"$name",
                    id:"$_id"
                }}
             } },
            { $project: {
                _id: 0,
                cuenta: "$_id.nombre",
                id: "$_id.id",
                centros: "$centros"
            }},
            { $sort: { cuenta: 1 }}
        ])

        const cuenta = await Cuenta.find({})

        centros.map( ( i ) => {
            cuenta.map( j => {

                if ( i.id.toString() === j._id.toString() ) {
                    i.cuenta = j.name
                }
            })
        } )

        return res.status(200).send({
            estatus: true,
            resultadoOperacion: 'Lista de centros disponible',
            data: centros
        })

    } catch ( error ) {
        return res.status(500).send({
            estatus: false,
            resultadoOperacion: 'Error al consultar la lista',
            error: error
        })
    }
}

function findCenterById(req, res){
    let id = req.params.id
    Center.findById(id, (err, center)=>{
        if(err) return res.status(500).send({msg:`Error al obtener la información ${err}`})
        res.status(200).send(center)
    })
}

function findCentersById(req, res){
    let centersId = []
    for(let i of req.body.centers){
        centersId.push( ObjectId(i) )
    }
    Center.aggregate([
        { $match: { _id: { $in:centersId }}}
    ], (err, centers)=>{
        if(err) return res.satus(500).send({msg:'error al obtener los centros de servicio', err:err})
        res.status(200).send(centers)
    })
}

async function getDataCenterToId(req, res){
    try {

        let id = ObjectId(req.body.id)
        const dataCenter = await Center.findById ({_id: id})

        return res.status(200).send(dataCenter)

    } catch ( error ) {
        return res.status(500).send({
            msg:'Error al consultar la información del centro de servicio'
        })
    }
    
}

async function obtenerMultiplesCentros( req, res ) {
    try {
        let centros = []
        req.body.centers.map( i => {
            centros.push( ObjectId(i) )
        } )
    
        const listadoCentros = await Center.find({_id:{ $in: centros }})

        return res.status(200).send(listadoCentros)
    } catch ( error ) {
        return res.status(500).send({
            msg:'Error al obtener los centros de servicio'
        })
    }
}

module.exports = {
    centerCount,
    consultaListaCentros,
    editCenter,
    findCenterById,
    findCentersById,
    getCenterById,
    getCenters,
    getCountCenterById,
    getDataCenterToId,
    newCenter,
    obtenerMultiplesCentros
}