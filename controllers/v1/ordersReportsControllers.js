'use strict'

const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId;
const moment = require('moment')

const WorkOrders = require('../../models/works_orders')

function getOrders(req, res){
    let id = req.body.account[0];
    let centers = req.body.centers;
    let dateInit = moment(req.body.dateInit);
    let dateEnd = moment(req.body.End);
    
    WorkOrders.aggregate([
        { $match:{ accountId:ObjectId(id) }},
        { $match:{ center_code:{ $in:centers } }},
        { $match:{ create:{ $gte:new Date(dateInit), $lte:new Date(dateEnd) } } }
    ], (err, orders)=>{
        if(err) return res.status(500).send({msg:'Error al obtener las Ordenes', err:err})
        res.status(200).send(orders)
    })
}

module.exports = {
    getOrders
}


{
    // accountId:{ $in:ObjectId(id) }
    
}