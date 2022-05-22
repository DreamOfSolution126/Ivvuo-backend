'use strict'

const List = require('../../models/list')
const Process = require('../../models/process')
const Activity = require('../../models/activitys')

function createList(req, res){
    const list = new List({
        list: req.body.list,
        key: req.body.account_code+req.body.list,
        description: req.body.description,
        account_code: req.body.account_code,
        advanceVisible: req.body.advanceVisible,
        createdUp: Date.now()
    })
    List.find({list:req.body.list, account_code:req.body.account_code}, (err, result)=>{
        if(err) return res.status(500).send({msg:'Lo sentimos ocurrió un error al comprobar los datos', err:err})
        if(result && result.length>0){
            return res.status(500).send({msg:'Esta lista ya ha sido creada'})
        } else {
            list.save( (err, success)=>{
                if(err) return res.status(500).send({msg:'Lo sentimos ocurrió un error al crear la lista', err:err})
                res.status(200).send({msg:'Genial, la lista se ha creado con exito'})
            })
        }
    })
}

function getList(req, res){
    let account_code = req.body.account_code
    List.find({account_code:account_code}, (err, lists)=>{
        if(err) return res.status(500).send({msg:'Lo sentimos ocurrió un error al obtener las listas', err:err})
        res.status(200).send(lists)
    })
}

function getListById(req, res){
    let id = req.body.id
    List.findById(id, (err, list)=>{
        if(err) return res.status(500).send({msg:'Lo sentimos ocurrió un error al obtener la lista', err:err})
        res.status(200).send(list)
    })
}

function editList(req, res){
    let id = req.body._id;
    let body = req.body;
    List.findByIdAndUpdate(id, body, (err, success)=>{
        if(err) return res.status(500).send({msg:'Lo sentimos ocurrió un error al actualizar la lista', err:err})
        res.status(200).send(success)
    })
}

function deletList(req, res){
    let id = req.body._id
    List.findByIdAndRemove(id, (err, result)=>{
      if(err) return res.status(500).send({msg:'Ocurrió un error al eliminar la lista', err:err})
      Process.remove({listId:id}, (err, removeProcess)=>{
            if(err) return res.status(500).send({msg:'Ocurrió un error al eliminar los procesos', err:err})
            Activity.deleteMany({ListId:id}, (err, successTwo)=>{
                if(err) return res.status(500).send({msg:'Lo sentimos, se ha borrado el proceso pero no sus actividades asosciadas', err:err})
                res.status(200).send({msg:'Se ha borrado el proceso y todas las actividades asosciadas'})
            })
      })
    })
}

// **************************************

function createProcess(req, res){
    const process = new Process({
        listId: req.body.listId,
        account_code: req.body.account_code,
        icon: req.body.icon,
        iconName: req.body.iconName,
        process: req.body.process,
        description: req.body.description,
        weight: req.body.weight,
        notifyCustomer: req.body.notifyCustomer,
        index: req.body.index,
        asignado: []
    })

    Process.find({
        listId: req.body.listId, 
        account_code: req.body.account_code, 
        process: req.body.process
    }, (err, result)=>{
        if(err) return res.status(500).send({msg:'Lo sentimos, ocurrioó un error al comprobar la información', err:err})
        if(result && result.length > 0){
            return res.status(500).send({msg:'Este proceso ya fue creado en esta lista'})
        } else {
            process.save( (err)=>{
                if(err) return res.status(500).send({msg:'Lo sentimos, ocurrioó un error al crear el proceso', err:err})
                res.status(200).send({msg:'El proceso se ha creado con exito'})
            })
        }
    })
}

function getProcess(req, res){
    let account_code = req.body.account_code
    let id = req.body._id
    Process.find({account_code:account_code, listId:id}, (err, process)=>{
        if(err) return res.status(500).send({msg:'Lo sentimos, ocurrioó un error al crear el proceso', err:err})
        res.status(200).send(process)
    }).sort({index:1})
}

function deletProcess(req, res){
    let id = req.body._id;
    Process.findByIdAndRemove(id, (err, success)=>{
        if(err) return res.status(500).send({msg:'Lo sentimos, ocurrioó un error al eliminar el proceso', err:err})
        if(success){
            Activity.deleteMany({processId:id}, (err, successTwo)=>{
                if(err) return res.status(500).send({msg:'Lo sentimos, se ha borrado el proceso pero no sus actividades asosciadas', err:err})
                res.status(200).send({msg:'Se ha borrado el proceso y todas las actividades asosciadas'})
            })
        }
    })
}

function editProcess(req, res){
    let id = req.body._id;
    let body = req.body
    Process.findByIdAndUpdate(id, body, (err, success)=>{
        if(err) return res.status(500).send({msg:'Lo sentimos, ocurrioó un error al actualizar el proceso', err:err})
        res.status(200).send(success)
    })
}

module.exports = {
    createList,
    getList,
    getListById,
    editList,
    deletList,

    createProcess,
    getProcess,
    deletProcess,
    editProcess
}