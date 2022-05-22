'use stric'

// const regServ = require('../models/reg_serv')
const WorkOrders = require('../../models/works_orders')
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId
const moment = require('moment')

function workOrdersResume(req, res){
    let idCentros = []
    req.body.centers.map( i => idCentros.push( ObjectId(i) ) );
    let optionSelect = req.body.optionSelect
    let today = moment('00:00 a.m',"hh:mm a").format()
    let status = req.body.status
    let init = ''
    let end = ''
    
    if(optionSelect=='day'){
        init = moment(today, 'YYYY-MM-DD').format()
        end = moment(init).add(23,'hours').format()
    } else if(optionSelect=='month'){
        init = moment('01'+moment(today).format('MMYYYY'), 'DDMMYYYY').format()
        end = moment('01'+moment().format('MMYYYY'), 'DDMMYYYY').add(1, 'month').subtract(1, 'day').format()
        // end = moment('01'+moment().format('MMYYYY'), 'DDMMYYYY').add(1, 'month').subtract(1, 'day').format()
    } else if(optionSelect=='week'){
        init = moment(moment(today).subtract(7, 'days').format('DDMMYYYY'), 'DDMMYYYY').format()
        end = moment(today, 'YYYY-MM-DD').add(23,'hours').format()
    } else if(optionSelect=='year'){
        end = moment(today, 'YYYY-MM-DD').add(24,'hours').format()
        init = moment(end).subtract(1,'year').format()
    }
    
    WorkOrders.aggregate([
        // { $match: { account_code:accountCode }},
        { $match:{ centerId: { $in:idCentros}}},
        { $match: { create:{ $lte:new Date(end), $gte:new Date(init) } } },
        { $group:{
            _id:{ center:"$center" },
            orders:{ $sum:1 },
            total:{ $sum:"$total" },
            parts:{ $sum:"$parts" },
            mo:{ $sum:"$mo"},
            total_approve:{ $sum:"$total_approve"},
            parts_approve:{ $sum:"$parts_approve"},
            mo_approve:{ $sum:"$mo_approve"},
            total_ban:{ $sum:"$total_ban"},
            parts_ban:{ $sum:"$parts_ban"},
            mo_ban:{ $sum:"$mo_ban"}
        }},
        { $project:{
            _id:0,
            center:"$_id.center",
            orders:"$orders",
            total:"$total",
            parts:"$parts",
            mo:"$mo",
            total_approve:"$total_approve",
            parts_approve:"$parts_approve",
            mo_approve:"$mo_approve",
            total_ban:"$total_ban",
            parts_ban:"$parts_ban",
            mo_ban:"$mo_ban",
            avg_total:{ $divide:[ "$total",  "$orders"] }
        }}
            
    ], (err, resume)=>{
        if(err) return res.status(500).sed({msg:'Lo sentimos ocurrió un error al consultar los reportes', err:err})
        res.status(200).send(formatDataChart(resume, init, end))
    })
}
// transform data
function formatDataChart(data, init, end){
    let result = { 
        labels:[],
        orders:[],
        parts:[],
        mo:[],
        total:[],
        total_approve:[],
        parts_approve:[],
        mo_approve:[],
        total_ban:[],
        parts_ban:[],
        mo_ban:[],
        avg_total:[],
        date:{init:init, end:end},
        ticket:[],
        avg_orders:[]
    }
    if(data){
        let avg_orders = 0
        for(let i of data){
            result.labels.push(i.center);
            result.orders.push(i.orders);
            avg_orders += i.orders;
            result.total.push( Math.round(i.total) );
            result.parts.push( Math.round(i.parts) );
            result.mo.push( Math.round(i.mo) );
            result.total_approve.push( Math.round(i.total_approve) );
            result.parts_approve.push( Math.round(i.parts_approve) );
            result.mo_approve.push( Math.round(i.mo_approve) );
            result.total_ban.push( Math.round(i.total_ban) );
            result.parts_ban.push( Math.round(i.parts_ban) );
            result.mo_ban.push(Math.round(i.mo_ban));
            result.ticket.push( Math.round( (i.total_approve / i.orders) ) )
            result.avg_total.push(i.avg_total);
        }
        for(let i of data){
            result.avg_orders.push(Math.round( avg_orders / data.length )) 
        }
    }
    return result;
}

// Obtener todas las ordenes de la cuenta
function getOrderByAccount(req, res){
    let account_code = req.body.account_code;
    
    WorkOrders.find({
        account_code:account_code
    }, (err, orders)=>{
        if(err) return res.status(500).send({msg:'Lo sentimos ocurrió un error al obtener las ordenes', err:err})
        res.status(200).send(orders)
    })
}

module.exports = {
    workOrdersResume,
    getOrderByAccount
}