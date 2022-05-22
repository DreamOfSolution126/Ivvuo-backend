'use strict'

const Activity = require('../../models/activitys')
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId

function createActivity(req, res){
    const activity = new Activity({
        listId: req.body.listId,
        processId: req.body.processId,
        account_code: req.body.account_code,
        name: req.body.name,
        details: req.body.details,
        weight: req.body.weight,
        type: req.body.type, //Check //Inspection // Custom
        asnwer_options: req.body.asnwer_options,
        parts: req.body.parts,
        mo: req.body.mo,
        total: req.body.total,
        quotation: req.body.quotation,
        resQuotation: { status:'', date: null, block: false },
        seeCustomer: req.body.seeCustomer,
        index: req.body.index,
        createUp: Date.now()
    })
    
    if(!activity.name) return res.status(500).send({msg:'Complete el nombre de la actividad'})
    if(!activity.type) return res.status(500).send({msg:'Elija un tipo de actividad'})
    if(!activity.asnwer_options || !(activity.asnwer_options.length>0)) return res.status(500).send({msg:'Agregue opciones de respuesta'})
    
    activity.save( (err)=>{
        if(err) return res.status(500).send({msg:'Lo sentimos ocurrió un error al crear la actividad', err:err})
        res.status(200).send({msg:'La actividad se ha creado con exito'})
    } )
}

function getActivityByList(req, res){
    let id = req.body.listId
    Activity.aggregate([
        { $match:{ listId:ObjectId(id) }},
        { $group:{
            _id:{ processId:"$processId",
            id:"$_id",
            listId:"$listId", 
            account_code:"$account_code",
            name:"$name",
            details:"$details",
            weight:"$weight",
            type:"$type",
            parts:"$parts",
            mo:"$mo",
            total:"$total",
            index:"$index",
            createUp:"$createUp",
            seeCustomer:"$seeCustomer",
            quotation:"$quotation",
            cotizacion: "$cotizacion",
            asnwer_options:"$asnwer_options"
        }
        }},
        { $sort:{ index:1 }},
        { $group:{
            _id:"$_id.processId",
            activities:{ $push:{
                id:"$_id.id",
                listId: "$_id.listId",
                account_code:"$_id.account_code",
                name:"$_id.name",
                details:"$_id.details",
                weight:"$_id.weight",
                type:"$_id.type",
                parts:"$_id.parts",
                mo:"$_id.mo",
                total:"$_id.total",
                index:"$_id.index",
                createUp:"$_id.createUp",
                seeCustomer:"$_id.seeCustomer",
                quotation:"$_id.quotation",
                cotizacion: "$_id.cotizacion",
                asnwer_options:"$_id.asnwer_options"
            }}
        }},
        { $project:{
            _id:0,
            processId:"$_id",
            activities:"$activities"
        }}
    ], (err, activities)=>{
        if(err) return res.status(500).send({msg:'Lo sentimos ocurrió un error al crear la actividad', err:err})
        if(activities && activities.length>0){
            for(let i of activities){
                i.activities.sort( (a, b)=>{
                    if(a.index > b.index){
                        return 1;
                    }
                    if(a.index < b.index){
                        return -1
                    }
                    return 0
                })
            }
            res.status(200).send(activities)

        } else {
            res.status(200).send(activities)

        }
    })
}

function getActivityCountByProcess(req, res){
    let id = ObjectId(req.body._id)
    Activity.countDocuments({processId:id}, (err, count)=>{
        if(err) return res.status(500).send({msg:'Lo sentimos ocurrió un error al crear la actividad', err:err})
        
        res.status(200).send({count:count})
    } )
}

function editActivity(req, res){
    let id = req.body.id;
    let body = req.body;
    body.resQuotation = { status:'', date: null, block: false }

    Activity.findByIdAndUpdate(id, body, (err, success)=>{
        if(err) return res.status(500).send({msg:'Error al actualizar la actividad', err:err})
        res.status(200).send({msg:'Se ha actualizado la actividad'})
    })
}

function deletActivity(req, res){
    let id = req.body.id;
    Activity.findByIdAndRemove(id, (err, success)=>{
        if(err) return res.status(500).send({msg:'Error al actualizar la actividad', err:err})
        res.status(200).send({msg:'Se ha actualizado la actividad'})
    })
}

function getActivityByListToOrder(req, res){
    let listId = "5c5d9d92b8c56803a90387f2";
    Activity.aggregate([
        { $match:{ listId:ObjectId(listId) }},
        { $group:{
            _id:{ processId:"$processId",
            }
        }}
    ], (err, activities)=>{
        if(err) return res.status(500).send({msg:'Lo sentimos ocurrió un error al crear la actividad', err:err})
        if(activities && activities.length>0){
            // for(let i of activities){
            //     i.activities.sort( (a, b)=>{
            //         if(a.index > b.index){
            //             return 1;
            //         }
            //         if(a.index < b.index){
            //             return -1
            //         }
            //         return 0
            //     })
            // }
            res.status(200).send(activities)

        } else {
            res.status(200).send(activities)

        }
    })
}


module.exports = {
    createActivity,
    getActivityByList,
    getActivityCountByProcess,
    editActivity,
    deletActivity,

    getActivityByListToOrder
}