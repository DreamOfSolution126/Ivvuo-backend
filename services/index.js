'use strict'

const jwt = require('jwt-simple')
const moment = require('moment')
const config = require('../configuraciones/variablesEntorno/config')

const maxClient = 5;
const namespace_queue = [{id:'', clients:0}]
// Se actualiza la vigencia del token a 365 díask
function createToken (user){
    const payload = {
        sub: user._id,
        iat: moment().unix(),
        exp: moment().add(365, 'days').unix()
    }

    return jwt.encode(payload, config.SECRET_TOKEN)
}

function decodeToken (token){
    const decode = new Promise((resolve, reject)=>{
        try {
            const payload = jwt.decode(token, config.SECRET_TOKEN)
            if(payload.exp <= moment().unix()){
                reject({
                    status: 401,
                    message: 'El Token ha expirado'
                })
            }
            resolve(payload.sub)
        } catch(err){
            reject({
                status: 500,
                message: 'Invalid Token'
            })
        }
    })
    return decode
}

function searchObjectArray(nameKey, ArrayObject){
    for(let i=0; i<ArrayObject.length; i++){
        if(nameKey == ArrayObject[i].id){
            return ArrayObject[i];
        }
    }
}

// function createNameSpace(order){
//     let ns = {
//         id:order.id,
//         clients: 0,
//     }

//     namespace_queue.push(ns);
    
//     return ns
// }

// function getNameSpaceQueue(){
//     return namespace_queue;
// }

// function getMaxClient(){
//     return maxClient;
// }


module.exports = {
    createToken,
    decodeToken,
    searchObjectArray,
    // createNameSpace,
    // getNameSpaceQueue,
    // getMaxClient
}