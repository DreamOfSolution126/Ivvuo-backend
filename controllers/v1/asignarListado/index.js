const Actividades = require('../../../models/activitys')
const Ordenes = require('../../../models/works_orders')
const Listado = require('../../../models/list')
const Procesos = require('../../../models/process')

const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId
const Joi = require('joi')
const asignarListadoSchema = require('./asignarListado.model')

function obtenerOrden ( req, res, next) {
    
    const data = req.body
    const validacionPayload = Joi.validate( data, asignarListadoSchema.asignarListadoSchema )

    if(validacionPayload.error) {
        return res.status(422).send({
            error:'ERP CrearOrden: Error en la validacion del payload',
            data: validacionPayload.error
        })
    } else {
        const id = ObjectId( data.idOrden )
        Ordenes.findById({ _id: id }, ( e, orden ) => {
            if( e ) return res.status(500).send({
                error:'GESTION-ORDEN ObtenerOrden: Error al obtener la orden',
            })
            if(!orden) return res.status(500).send({
                error: 'GESTION-ORDEN ObtenerOrden: No se encontró esta orden'
            })

            let payload = req.body
            payload = {
                ...payload,
                orden
            }

            req.body = payload
            next()
        })
    }
}

function obtenerLista ( req, res, next ) {
    
    const data = req.body
    const id = ObjectId( data.idLista )

    Listado.findById({ _id:id }, ( e, lista ) => {
        if( e ) return res.status(500).send({
            error:'GESTION-ORDEN ObtenerLista: Error al obtener la lista',
        })
        if(!lista) return res.status(500).send({
            error: 'GESTION-ORDEN ObtenerLista: No se encontró esta lista'
        })
        
        let payload = req.body
        payload = {
            ...payload,
            lista
        }

        req.body = payload
        next()
    })

}

function obtenerProcesos ( req, res, next ) {

    const data = req.body
    let id = ObjectId( data.idLista )

    Procesos.aggregate([
        { $match:{ listId:id }},
        { $group:{
            _id:{ id:"$_id",  
                process:"$process",
                icon:"$icon",
                description:"$description",
                weight:"$weight",
                notifyCustomer:"$notifyCustomer",
                index:"$index",
                advanceValue:"$advanceValue"
                }
        } },
        { $project:{
            _id:0,
            id:"$_id.id",
            name:"$_id.process",
            icon:"$_id.icon",
            description:"$_id.description",
            weight:"$_id.weight",
            notifyCustomer:"$_id.notifyCustomer",
            index:"$_id.index",
            advanceValue:"$_id.advanceValue",
            checkList:[]
        } },
        { $sort:{ index:1 }}
    ], (e, procesos)=>{
        if(e) res.status(500).send({
            error:'GESTION-ORDEN ObtenerLista: Error al obtener los procesos',
        })
        if(!procesos) res.status(500).send({
            error:'GESTION-ORDEN ObtenerLista: No se encontraron procesos',
        })
        let payload = req.body
        payload = {
            ...payload,
            procesos
        }

        req.body = payload
        next()
    })
}

function obtenerActividades ( req, res, next ) {
    
    const data = req.body
    const id = ObjectId( data.idLista )

    Actividades.aggregate([
        { $match:{ listId: id }},
        { $group:{
            _id:{ id:"$_id",
            processId:"$processId",
            account_code:"$account_code",
            name:"$name",
            details:"$details",
            weight:"$weight",
            type:"$type",
            parts:"$parts",
            mo:"$mo",
            total:"$total",
            index:"$index",
            seeCustomer:"$seeCustomer",
            quotation:"$quotation",
            asnwer_options:"$asnwer_options"
         }
        }},
        { $project:{
            _id:0,
            id:"$_id.id",
            processId:"$_id.processId",
            account_code:"$_id.account_code",
            item:"$_id.name",
            details:"$_id.details",
            weight:"$_id.weight",
            type:"$_id.type",
            parts:"$_id.parts",
            mo:"$_id.mo",
            total:"$_id.total",
            index:"$_id.index",
            seeCustomer:"$_id.seeCustomer",
            quotation:"$_id.quotation",
            asnwer_options:"$_id.asnwer_options",
            resQuotation:{ status:'', date:'', block: { $toBool: false } },
            answer:[],
            attach:[],
            comments:[]
        }},
        { $sort:{ index:1 }}
    ], ( e, actividades)=>{
        if( e ) return res.status(500).send({
            error:'GESTION-ORDEN ObtenerLista: Error al obtener las actividades',
        })
        if(!actividades) return res.status(500).send({
            error: 'GESTION-ORDEN ObtenerLista: No se encontraron actividades'
        })
        
        let payload = req.body
        payload = {
            ...payload,
            actividades
        }

        req.body = payload
        next()
    })
}

function consolidarListaChequeo ( req, res, next ) {
    
    let data = req.body
    let list = []

    data.procesos.map( (i, index) => {
        list.push( i )
        data.actividades.map( (j) => {
            if(list[index].id.toString() === j.processId.toString()){
                list[index].checkList.push(j)
            }
        } )
    } )

    let payload = req.body
    payload = {
        ...payload,
        list
    }

    req.body = payload
    next()
}

function incluirListadoEnOrden ( req, res ) {

    const data = req.body;
    const idOrden = ObjectId( data.idOrden )
    let payload = {}
    payload["process"] = data.list
    payload["list"] = data.lista
    
    Ordenes.findByIdAndUpdate({ _id: idOrden }, { $set: payload }, (e, success ) => {
        if( e ) return res.status(500).send({
            error:'GESTION-ORDEN IncluirListadoOrden: Error al actualizar la orden',
        })
        if(!success) return res.status(500).send({
            error: 'GESTION-ORDEN IncluirListadoOrden: No se encontró esta orden'
        })
        res.status(200).send({
            data: { mensage:'GESTION-ORDEN IncluirListadoOrden: la orden se  actualizo correctamente'}
        })
    })
}

module.exports = {
    consolidarListaChequeo,
    incluirListadoEnOrden,
    obtenerActividades,
    obtenerLista,
    obtenerOrden,
    obtenerProcesos
}

