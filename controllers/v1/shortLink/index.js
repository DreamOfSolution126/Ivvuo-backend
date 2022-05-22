'use strict'

const ShortLink = require('../../../models/shortlink.model')

async function generarCodigo () {
    const caracteres = "abcdefghijkmnpqrtuvwxyzABCDEFGHJKMNPQRTUVWXYZ12346789";
    let codigo = "";
    for (let i=0; i<4; i++) codigo +=caracteres.charAt(Math.floor(Math.random()*caracteres.length)); 

    if(
    ShortLink.findOne({ short: codigo}, (e, result) => {
            if(e) return console.error(
                'Gestion Orden ShortLink: Error en la validacion del duplicado',
                JSON.stringify(e)
                )
            if(result){
                console.debug(
                    'Gestion Orden ShortLink: Este codigo ya existe',
                    codigo
                )
                return false
            }
            console.debug(
                'Gestion Orden ShortLink: Código a registrar',
                codigo
            )
            return codigo
        })
    ) return codigo

    await generarCodigo()
    
}

async function registrarShortLink ( req, res, next ) {

    const data = req.body
        
        const codigo = await generarCodigo()
        
        const shortLink = new ShortLink({
            path: data.path,
            short: codigo,
            idOrden: data.orden._id
        })

        shortLink.save( ( e ) => {
            if( e ) return res.status(500).send({
                error:'Gestion Orden ShortLink: Error al registrar el ShortLInk',
                data: shortLinkValidacion.error || e
            })
            
            const payload = {
                ...data,
                payload:{
                    shortUrl:'ivvuo.com/#/C/'+codigo
                }
                
            }
            req.body = payload
            next()
        } )
}

async function obtenerIdOrden ( req, res, next ){
    const data = req.body

    let idOrden
    try {
        idOrden = await ShortLink.findOne({ short: data.short })

        return res.status(200).send({
            data:idOrden
        })
    } catch ( e ) {
        return res.status(500).send({
            error: 'ObtenerIdOrden: Error al obtener el Id de la Orden',
            data: e
        })
    }
}

module.exports = {
    registrarShortLink,
    obtenerIdOrden,
    generarCodigo
}