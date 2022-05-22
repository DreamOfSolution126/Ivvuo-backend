// 'use strict'
// const fs = require('fs')
// const multer = require('multer')
// const Service = require('../models/service')
// const mongoose = require('mongoose')
// const ObjectId = mongoose.Types.ObjectId

// function newService(req, res){
//     const service = new Service({
//         name: req.body.name ,
//         type: req.body.type,
//         code: req.body.code ,
//         description: req.body.description ,
//         value: req.body.value ,
//         cost: req.body.cost ,
//         tax: req.body.tax ,
//         supplys:req.body.supplys ,
//         account: req.body.account ,
//         img: req.body.img
//     })
//     service.save( (err)=>{
//         if(err) return res.status(500).send({msg:'Error al crear el servicio', err:err})
//         res.status(200).send({msg:'El Servicio se ha creado con exito'})
//     })
// }
// // Obetener servicios por cuenta
// function getServicesByAccount(req, res){
//     let id = req.body.id
//     let skip = req.body.skip
//     let limit =req.body.limit
//     Service.aggregate([
//         { $match: { account:ObjectId(id) }},
//         { $skip:skip},
//         { $limit:limit}
//         // { $match: { active:true } }
//     ], (err, services)=>{
//         if(err) return res.status(500).send({msg:'Error al obtener los servicios', error:err})
//         res.status(200).send(services)
//     })
// }
// // Obtener cantidad de servicios totales por cuenta
// function getServicesCount(req, res){
//     let id = req.body.id
//     Service.count({account:ObjectId(id)}, (err, count)=>{
//         if(err) return res.status(500).send({msg:'Error al obtener la cuenta de servicios', error:err})
//         res.status(200).send({total:count})
//     })
// }
// // Actualizar los servicios
// function upDateService(req, res){
//     let id = req.body._id
//     let update = req.body
//     Service.findByIdAndUpdate(id, update, (err, success)=>{
//         if(err) return res.status(500).send({msg:`Error al actualizar el servicio`, err:err})
//         res.status(200).send({msg:'El servicio se ha actualizado con éxito'})
//     })
// }

// //Obtener servicios Array de Id
// function getServicesById(req, res){
//     let type = req.body.type
//     let services = req.body.services
//     let servicesId = []
//     if(services){
//         for(let i of services){
//             servicesId.push(
//                 ObjectId(i)
//             )
//         }
//     }
//     Service.aggregate([
//         { $match: { _id:{ $in:servicesId} }},
//         { $match: { type:type } }
//     ],(err, services)=>{
//         if(err) return res.status(500).send({msg:'Ocurrio un error al consultar los servicios', err:err})
//         res.status(200).send(services)
//     })
// }
// function getServicesByIdNotType(req, res){
//     let services = req.body.services
//     let servicesId = []
//     if(services){
//         for(let i of services){
//             servicesId.push(
//                 ObjectId(i)
//             )
//         }
//     }
//     Service.aggregate([
//         { $match: { _id:{ $in:servicesId} }}
//     ],(err, services)=>{
//         if(err) return res.status(500).send({msg:'Ocurrio un error al consultar los servicios', err:err})
//         res.status(200).send(services)
//     })
// } 

// //Get types from services
// function typesFromServices(req, res){
//     let services = req.body.services
//     let servicesId = []
    
//     if(services){
//         for(let i of services){
//             servicesId.push(
//                 ObjectId(i)
//             )
//         }
//     }
//     Service.aggregate([
//         { $match: { _id:{ $in:servicesId} }},
//         { $group:{
//             _id:{ types:"$type"}
//         }},
//         { $project:{
//             type:"$_id.types",
//             _id:0
//         }}
//     ], (err, types)=>{
//         if(err) return res.status(500).send({msg:'Ocurrio un error al obtener los tipos', err:err})
//         res.status(200).send(types)
//     })
// }

// function createDirAccount(account){
//     let dirname = './uploads/account/'+account+'/';
//     fs.mkdir( dirname, (err)=>{
//         if(err && err.code == 'EEXIST'){
            
//         } else if(err){
//             return console.info(err)
//         }
//     })
// }
// function uploadIcon(req, res){
//     let url='';
//     let name='';
//     let ext='';
//      const storage = multer.diskStorage({
//          destination: (req, file, cb)=>{
//            createDirAccount(req.body.account_code)  
//            cb(null, './uploads/account/'+req.body.account_code+'/');
//          },
//          filename: (req, file, cb)=>{
//              name = file.originalname
//              url = req.body.apiRest+'account/'+req.body.account_code+'/'+req.body.datetimetamp+'.'+file.originalname.split('.')[file.originalname.split('.').length -1]
//              ext = file.originalname.split('.')[file.originalname.split('.').length -1]
//            cb(null, req.body.datetimetamp+'.'+file.originalname.split('.')[file.originalname.split('.').length -1]);
         
           
//          }
//        });
 
//        const upload = multer({
//          storage: storage
//        }).single('file');
//        upload(req, res, (err)=>{
//            if(err) return res.status(500).send({msg:'Error al guardar el archivo', err_desc:err})
//            res.status(200).send({msg:'Archivo guardado', url:url, name:name, ext:ext})
//        })
//  }
//  function deletIcon(req, res){
//      let path = req.body.url.split('http://localhost:3001/')
     
//      fs.unlink('uploads/'+path[1], (err)=>{
//          if( err && err.code === 'ENOENT'){
//              console.info('The icon no exist or won`t remove it ')
//              res.status(500).send({msg:'Error al eliminar el archivo', err:err})
//          } else if(err){
//              res.status(500).send({msg:'Ocurrio un error al intentar eliminar el icono'})
//          } else {
//              res.status(200).send({msg:'El icono se ha borrado exitosamente'})
//          }
//      } )
//  }


// module.exports = {
//     newService,
//     getServicesByAccount,
//     upDateService,
//     getServicesCount,
//     getServicesById,
//     getServicesByIdNotType,
//     typesFromServices,
//     uploadIcon
// }