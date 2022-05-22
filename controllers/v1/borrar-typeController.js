// 'use strict'

// const Type = require('../../models/type')
// const mongoose = require('mongoose')
// const fs = require('fs')
// const multer = require('multer')
// const ObjectId = mongoose.Types.ObjectId

// function newType (req, res){
//     const type = new Type({
//         name: req.body.name,
//         description: req.body.description,
//         img:req.body.img
//     })
//     type.save( (err)=>{
//         if(err) return res.status(500).send({msg:'Error al guardar la información', err:err})
//         res.status(200).send({msg:'Genial el tipo de vehículo o equipo se ha guardado'})
//     } )
// }

// function getTypes(req, res){
//     // let id = req.body.center
//     Type.find({}, (err, types)=>{
//         if(err) return res.status(500).send({msg:'Error al obtener los tipos de equipo'})
//         res.status(200).send(types)
//     })
// }

// function getTypesToAccount(req, res){
//     Type.find({active:true}, (err, types)=>{
//         if(err) return res.status(500).send({msg:'Error al obtener los tipos de equipo'})
//         res.status(200).send(types)
//     })
// }

// function getTypesToCenter(req, res){
//     Type.find({name:name}, (err, types)=>{
//         if(err) return res.status(500).send({msg:'Error al obtener los tipos de equipo'})
//         res.status(200).send(types)
//     })
// }

// function updateTypeById(req, res){
//     let id = req.body._id
//     let update = req.body
//     Type.findByIdAndUpdate(id, update, (err)=>{
//         if(err) return res.status(500).send({msg:'Error al actualizar el typo', err:err})
//         res.status(200).send({msg:'El registro se actulizó con exito'})
//     })
// }

// function delet(req, res){
//     let id = req.body._id
//     Type.findByIdAndRemove(id, (err)=>{
//         if(err) return res.status(500).send({msg:'Error al Eliminar el registro', err:err})
//         res.status(200).send({msg:'El registro se ha eliminado con éxito'})
//     })
// }

// function uploadIcon(req, res){
//    let url='';
//    let name='';
//    let ext='';
//     const storage = multer.diskStorage({
//         destination: (req, file, cb)=>{
//           cb(null, './uploads/icon/');
//         },
//         filename: (req, file, cb)=>{
//             name = file.originalname
//             url = req.body.apiRest+'icon/'+req.body.datetimetamp+'.'+file.originalname.split('.')[file.originalname.split('.').length -1]
//             ext = file.originalname.split('.')[file.originalname.split('.').length -1]
//           cb(null, req.body.datetimetamp+'.'+file.originalname.split('.')[file.originalname.split('.').length -1]);
//         }
//       });

//       const upload = multer({
//         storage: storage
//       }).single('file');
//       upload(req, res, (err)=>{
//           if(err) return res.status(500).send({msg:'Error al guardar el archivo', err_desc:err})
//           res.status(200).send({msg:'Archivo guardado', url:url, name:name, ext:ext})
//       })
// }

// function deletIcon(req, res){
//     let path = req.body.url.split('http://localhost:3001/')
    
//     fs.unlink('uploads/'+path[1], (err)=>{
//         if( err && err.code === 'ENOENT'){
//             console.info('The icon no exist or won`t remove it ')
//             res.status(500).send({msg:'Error al eliminar el archivo', err:err})
//         } else if(err){
//             res.status(500).send({msg:'Ocurrio un error al intentar eliminar el icono'})
//         } else {
//             res.status(200).send({msg:'El icono se ha borrado exitosamente'})
//         }
//     } )
// }

// module.exports = {
//     newType,
//     getTypes,
//     getTypesToAccount,
//     getTypesToCenter,
//     updateTypeById,
//     delet,

//     uploadIcon,
//     deletIcon
// }