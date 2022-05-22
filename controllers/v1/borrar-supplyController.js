// 'use strict'

// const Supply = require('../models/supply')
// const mongoose = require('mongoose')
// const ObjectId = mongoose.Types.ObjectId


// function newSupply(req, res){
//     const supply = new Supply({
//         supply: req.body.supply,
//         description: req.body.description,
//         reference: req.body.reference,
//         unity: req.body.unity,
//         cost : req.body.cost,
//         account: req.body.account

//     })
//     supply.save( (err)=>{
//         if(err) return res.status(500).send({msg:`Error al guardar la referencia`, err:err})
//         return res.status(200).send({msg:`La referencia se ha guardado con exito`})
//     })
// }

// function getSupply(req, res){
//     let account = req.body.account

//     Supply.find({account:account}, (err, supply)=>{
//         if(err) return res.status(500).send({msg:`Error al obtener los Insumos ${err}`})
//         res.status(200).send(supply)
//     })
// }

// function updateSupply(req, res){
//     let id = req.body._id
//     let update = req.body
//     Supply.findByIdAndUpdate(id, update, (err, supply)=>{
//         if(err) return res.status(500).send({msg:`Error al actualizar la referencia ${err}`})
//         res.status(200).send({msg:`La referencia se ha actualizado con exito`})
//     })
// }

// module.exports = {
//     newSupply,
//     getSupply,
//     updateSupply
// }