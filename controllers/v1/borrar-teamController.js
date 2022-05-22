// 'use strict'

// const Team = require('../models/team')
// const fs = require('fs')
// const multer = require('multer')

// function newMemberTeam(req, res){
//    const teamMember = new Team ({
//        nit:req.body.nit,
//        role: req.body.role,
//        name:req.body.name,
//        last_name:req.body.last_name,
//        validation:req.body.nit.toString()+req.body.center_code+req.body.account_code,
//        center_code: req.body.center_code,
//        account_code: req.body.account_code,
//        profile_picture:{
//         url: req.body.profile_picture.url,
//         name: req.body.profile_picture.name,
//         type: req.body.profile_picture.type
//        }
//    })
//    teamMember.save( (err)=>{
//        if(err) return res.status(500).send({msg:'Error al crear el miembro del equipo', err:err})
//        res.status(200).send({msg:'Genial, se ha creado el miembro del equipo'})
//    })
// }

// function getMemberTeamByCenter(req, res){
//     let center_code = req.body.center_code;
//     let account_code = req.body.account_code;
//     Team.find({center_code:center_code, account_code:account_code }, (err, members)=>{
//         if(err) return res.status(500).send({msg:'Lo sentimos, ocurrió un error al consultar los miembros del equipo', err:err})
//         res.status(200).send(members)
//     })
// }

// function getMemberTeamToCenter(req, res){
//     let center_code = req.body.center_code;
//     let account_code = req.body.account_code;
//     let active = req.body.active;
//     let status = req.body.status;
//     Team.find({center_code:center_code, account_code:account_code, active:{$in:active}, status:{ $in:status} }, (err, members)=>{
//         if(err) return res.status(500).send({msg:'Lo sentimos, ocurrió un error al consultar los miembros del equipo', err:err})
//         res.status(200).send(members)
//     })
// }

// function saveMemberTeam(req, res){
//     let id = req.body._id
//     let body = req.body
//     Team.findByIdAndUpdate(id, body, (err, success)=>{
//         if(err) return res.status(500).send({msg:'Lo sentimos, Ocurrió un error al actualizar el miembro del equipo', err:err})
//         res.status(200).send({msg:'Genial, el miembro del equipo se ha actualizó exitosamente'})
//     })
// }

// function createAccountDir(account){
//     let dirname = './uploads/profiles/'+account+'/';
//     fs.mkdir(dirname, (err)=>{
//         if(err && err.code == 'EEXIST'){
//             // nothing to do
//         } else if(err) {
//             return res.status(500).send({msg:'Error al crear el directorio', err:err})
//         }
//     })
// }

// function uploadImgProfile(req, res){
//     let name = '';
//     let originalname = '';

//     const storage = multer.diskStorage({
//         destination: (req, file, cb)=>{
//             createAccountDir(req.body.account_code)
//             cb(null, './uploads/profiles/'+req.body.account_code+'/');
//         },
//         filename: (req, file, cb)=>{
//             const datetimemap = Date.now()
//             name = req.body.nit.toString()+req.body.center_code+req.body.account_code+'-'+datetimemap+'.'+file.originalname.split('.')[file.originalname.split('.').length-1];
//             originalname = file.originalname;
//             cb(null, name)
//         }
//     });
//     const upload = multer({
//         storage: storage
//     }).single('file');
//     upload(req, res, (err)=>{
//         if(err) return res.status(500).send({msg:'Ocurrió un error al cargar el archivo', err:err})
//         res.status(200).send({msg:'Cargado con exito', filename:name, originalname:originalname})
//     })
// }

// function deletFiles(req, res){
//     let server = req.body.server
//     let path = req.body.url.split(server)
//     // console.log(req.body)
//     fs.unlink('uploads/'+path[1], (err)=>{
//         if(err && err.code == 'ENOENT'){
//             return res.status(500).send({msg:'El archivo no existe o ya ha sido borrado', err:err})
//         } else if(err){
//             return res.status(500).send({msg:'Ocurrió un error al borrar el archivo', err:err})
//         } else {
//             return res.status(200).send({msg:'El archivo ha sido borrado exitosamente'})
//         }
//     })
// }

// module.exports = {
//     newMemberTeam,
//     getMemberTeamByCenter,
//     saveMemberTeam,
//     getMemberTeamToCenter,

//     uploadImgProfile,
//     deletFiles
// }
