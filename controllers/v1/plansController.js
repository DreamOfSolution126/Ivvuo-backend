'use strict'

const Plan = require('../../models/plans')

function newPlan(req, res){
    const plan = new Plan({
    plan: req.body.plan,
    value: req.body.value,
    off: req.body.off,
    description:req.body.description,
    total: req.body.total,
    frequency: req.body.frequency
    })

    // console.log()
    plan.save( (err)=>{
        if(err) return res.status(500).send({msg:`Erroral guardar ${err}`})
        res.status(200).send({msg:`El Plan se ha guardado exitosamente`})
    } )
}

function getPlans(req, res){
    Plan.aggregate([
        { $match: { active:true } },
        // { $project:{

        // } }
    ], (err, plans)=>{
        if(err) return res.status(500).send({msg:`Error al obtener los planes`})
        res.status(200).send(plans)
    })
}

function deletPlans(req, res){
    let id = req.body._id
    Plan.findByIdAndRemove(id, (err, plans)=>{
        if(err) return res.status(500).send({msg: `Error al borrar el registro ${err}` })
        res.status(200).send({msg: `Se ha borrado exitosamente` })
    })
}

function getPlanById( req, res){
    let id = req.params.id
    Plan.findById(id, (err, plan)=>{
        if(err) return res.status(500).send({msg:`Error al obtener el plan ${err}`})
        res.status(200).send(plan)
    })
}

module.exports = { 
    newPlan,
    getPlans,
    deletPlans,
    getPlanById
}