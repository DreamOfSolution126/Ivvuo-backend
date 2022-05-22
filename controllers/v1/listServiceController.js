'use strict'

const ListService = require('../../models/listservice')
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId

function newListService(req, res){
    const list = new ListService({
        account: req.body.account,
        center: req.body.center,
        services: req.body.services,
    })

    list.save((err)=>{
        if(err) return res.status(500).send({msg:`Lo sentimos ocurrio un error al crear la lista`, err:err})
        res.status(200).send({msg:'Genial, la lista ha sido creada con exito'})
    })
}

function UpdateListService(req, res){
    let id = req.body._id
    let update = req.body
    ListService.findByIdAndUpdate(id, update, (err, response)=>{
        if(err) return res.status(500).send({msg:'Lo sentimos, ocurrió un error al actualizar la lista', err:err })
        res.status(200).send({msg:'La lista d Servicios se ha actualizado con éxito'})
    })
}

function getAccountListService(req, res){
    let accountId = req.body.accountId
    ListService.find({account:ObjectId(accountId)}, (err, listservice)=>{
        if(err) return res.status(500).send({msg:'Lo sentimos, ocurrió un error al consultar las listas', err:err})
        res.status(200).send(listservice)
    })
}

function getOneListService(req, res){
    let center = req.body.center
    let account = req.body.account

    ListService.findOne({center:ObjectId(center) }, (err, listservice)=>{
        if(err) return res.status(500).send({msg:'Lo sentimos, Ocurrió un error al consultar la lista de servicios', err:err})
        res.status(200).send(listservice)
    })
}



module.exports = {
    newListService,
    UpdateListService,
    getAccountListService,
    getOneListService
}
