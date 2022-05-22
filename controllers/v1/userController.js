'use strict'

const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId

const User = require('../../models/user')
const service = require('../../services')
const bcrypt = require('bcrypt-nodejs')
const { ROL } = require('../../models/enum')
const { TIPO_DOCUMENTO } = require('../../models/enum')

const signUp = async ( req, res ) => {
    try {

        const data = req.body;
        data.identificacion.tipo = TIPO_DOCUMENTO.CEDULA_CIUDADANIA;

        const existeUsuario = await User.findOne({ email: data.email })

        if ( existeUsuario ) {
            return res.status(500).send({
                msg: `El usuario ${data.email} ya esta registrado`
            })
        }

        const nuevoUsuario = new User( data )

        await nuevoUsuario.save()

        return res.status(200).send({ msg:'Usuario creado con exito'})

    } catch ( error ) {
        console.log('ERROR CREAR USUARIO: ', error )
        return res.status(500).send({
            msg: `Error al crear el usuario`
        })
    }
    
    
    
}

function signIn( req, res ){
    let userEmail = req.body.email
    let userPassword = req.body.password
    
    User.findOne({ email: userEmail}, (err, user)=>{
        if(err) return res.status(500).send({message:`Error ${err}`})
        if(!user) return res.status(404).send({message:'No existe este usuario'})
        req.user = user

        req.user.comparePass(userPassword, (err, isMacht )=> {
 
            if(isMacht) return res.status(200).send({
                message: 'Te has logueado correctamente',
                userEmail: userEmail,
                token: service.createToken(user),
                role: user.role,
                accesos: user.accesos
            })
            res.status(500).send({message:`La contraseña no es válida`})
        })
    })
}

function getUsers(req, res){
    User.aggregate([
        { $sort:{ last_name:1 } }
    ], (err, users) =>{
        if(err) return res.status(500).send({message:`Error al realizar la petición ${err}`})
        if(!users) return res.status(404).send({message:`No existen Usuarios`})
        res.status(200).send(users)
    })
}

async function getUserById(req, res){
    let id = req.params.id
    // User.aggregate([
    //     { $match: { account:ObjectId(id) }}
    // ], (err, user)=>{
    //     if(err) return res.status(500).send({msg:`Error al Obtener los usuarios ${err}`})
    //     res.status(200).send(user)
    // })

    let usuarios;
    try {
        usuarios = await User.find({ account: id })

    } catch (error) {
        return res.status(500).send({
            msg: 'Error al obtener los usuarios',
            error: error
        })
    }

    return res.status(200).send( usuarios )
}

function upDateUser (req, res){
    let userId = req.params.id
    let upDate = req.body

    if(!req.body.email) return res.status(500).send({msg:`El email es necesario`})

    if(upDate.newPassword && upDate.confirmPassword){ 
        bcrypt.genSalt(10, (err, salt)=>{
            if(err) return res.status(500).send({msg:`Ocurrio un error al encriptar el password ${err}`})

            bcrypt.hash(upDate.newPassword, salt, null, (err, hash)=>{
                if(err) return res.status(500).send({msg:`Ocurrio un error al hashear el password ${err}`})
                upDate.password = hash
                User.findByIdAndUpdate(userId, upDate, (err, userUp) =>{

                    if(err && err.code === 11000) return res.status(500).send({msg:`Este email  está duplicado`})
                    if(err) return res.status(500).send({msg:`Error al Actualizar el usuario`})
                    res.status(200).send({user: userUp, msg:`Actualizado Correctamente!`})
                })
            })
        })
    } else {
        User.findByIdAndUpdate(userId, upDate, (err, userUp) =>{

            if(err && err.code === 11000) return res.status(500).send({msg:`Este email  está duplicado`})
            if(err) return res.status(500).send({msg:`Error al Actualizar el usuario`})
            res.status(200).send({user: userUp, msg:`Actualizado Correctamente!`})
        })
    }

}

function getUserByEmail (req, res) {
    let email = req.body.email
    User.findOne({email: email}, (err, user)=>{
        if(err) return res.status(500).send({message:`Error: ${err}`})
        res.status(200).send(user)
    })
}

function deletUser( req, res){
    let userId = req.params.userId
    User.findByIdAndRemove(userId, (err, deletUser)=>{
        if(err) return res.status(500).send({msg:`Error al eliminar el usuario`})
        res.status(200).send(deletUser)
    })
}

async function obtenerUsuariosPorCentro ( req, res ) {
    try {
        const idCentro = ObjectId(req.body.idCentro);

        const usuarios = await User.find({ centers: idCentro })

        return res.status(200).send({
            data:{
                estatus: true,
                usuarios,
                resultadoOperacion:'Listado de usuarios exitoso'
            }
        })
    } catch ( error ) {
        return res.status(500).send({
            data:{
                estatus: false,
                usuarios:[],
                resultadoOperacion:'Error al obtener el listado'
            },
            error: error
        })
    }
}

async function obtenerUsuariosPorCuenta ( req, res ) {
    try {
        const data = req.body;
        const cuenta = ObjectId( data.cuenta )
        
        const usuariosActivos = await User.find({
            account: cuenta,
            active: true,
            role: ROL.CENTRO_SERVICIO
        })

        if ( !usuariosActivos && usuariosActivos.length < 1 ) {
            return res.status(200).send({
                estatus: false,
                resultadoOperacion: 'No se encontraron usuarios'
            })
        }

        return res.status(200).send({
            estatus: true,
            resultadoOperacion: 'Se econtraron usuarios',
            data: usuariosActivos
        })

    } catch ( error ) {
        return res.status(500).send({
            data:{
                estatus: false,
                data:[],
                resultadoOperacion:'Error al obtener el listado'
            },
            error: error
        })
    }
}

async function contarUsuarios ( req, res ) {
    try {

        const cantidadUsuarios = await User.countDocuments({  })

        return res.status(200).send({
            estatus: true,
            resultadoOperacion: 'Usuario obtenidos',
            data: cantidadUsuarios
        })
    } catch ( error ) {
        console.log( error )
        res.status(500).send({
            estatus: false,
            resultadoOperacion: 'Error al contar los usuarios'
        })
    }
}

const obtenerUsuarioPorMarca = async ( req, res ) => {
    try {
        const data = req.body;
        const marca = ObjectId( data.marca )

        const usuarios = await User.find({ marca: marca })

        res.status(200).send({
            estatus: true,
            resultadoOperacion: 'Consulta exitosa',
            data: usuarios
        })

    } catch ( error ) {
        return res.status(500).send({
            data:{
                estatus: false,
                data:[],
                resultadoOperacion:'Error al obtener el listado'
            },
            error: error
        })
    }
}

module.exports = {
    contarUsuarios,
    deletUser,
    getUserByEmail,
    getUserById,
    getUsers,
    obtenerUsuarioPorMarca,
    obtenerUsuariosPorCentro,
    obtenerUsuariosPorCuenta,
    signIn,
    signUp,
    upDateUser
}