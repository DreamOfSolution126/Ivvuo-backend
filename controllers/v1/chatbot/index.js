'use strict'
const contenidos = require('./contenidos').idioma.es
const WorkOrdes = require('../../../models/works_orders')
const Centros = require('../../../models/center')
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId
const TYPES = require('./types')

let centros
let agendamientoEnCurso
let saludo

const detectarSolicitudes = async ( mensaje, cuenta, desde ) => {

    const arbol = {
        saludo: false,
        link: false,
        resumen: false,
        agendamientoPaso1: false
    }

    // contenidos.palabrasClave.cancelar.map(i => {
    //     const encontrada = mensaje.search(i)
    //     if( encontrada !== -1 ) {
    //         agendamientoEnCurso = false
    //         return contenidos.agedamienctoCancelar.toString()
    //     }
    // })

    if (agendamientoEnCurso) {
        if( isNaN(mensaje) ) { 
            agendamientoEnCurso = false 
        }
        const seleccion = parseInt(mensaje)
        return agendamientoPasoDos( seleccion )
    }

    contenidos.palabrasClave.agendamientoPaso1.map(i => {
        const encontrada = mensaje.search(i)
        if( encontrada !== -1 ) {
            arbol.agendamientoPaso1 = true
            agendamientoEnCurso = true
        }
    })

    contenidos.palabrasClave.saludos.map( i => {
        const encontrada = mensaje.search(i)
        if( encontrada !== -1 ) {
            arbol.saludo = true
        }
    })

    contenidos.palabrasClave.link.map( i => {
        const encontrada = mensaje.search(i)
        if( encontrada !== -1 ) {
            arbol.link = true
        }
    })
    contenidos.palabrasClave.resumen.map( i => {
        const encontrada = mensaje.search(i)
        if( encontrada !== -1 ) {
            arbol.resumen = true
        }
    })

    if( arbol.agendamientoPaso1 ){
        return agendamientoPasoUno(cuenta, desde)
    }
    if( arbol.link ) {
        return enviarLinkOrden(cuenta, desde); 
    }
    if( arbol.resumen ) {
        return resumenInspeccion( cuenta, desde )
    }
    if( arbol.saludo ) {
        return saludoInicial(cuenta, desde);
    }
    
}

const saludoInicial = async ( cuenta, desde ) => {
    try {

        const datosCuenta = cuenta
        const deConCodigoPais = (desde.split('whatsapp:+')[1]).toString();

        const deSoloNumero = []
        const idsCuenta = []
        datosCuenta.map( i => {
            deSoloNumero.push( deConCodigoPais.split(i.phone_code.toString())[1] )
            idsCuenta.push( ObjectId( i._id ))
        } )
        const order = await WorkOrdes.find({accountId: idsCuenta, telephone: deSoloNumero}).sort({create:-1})
        const mensaje = { contenido: '' }
        if(order && order.length > 0) {

            mensaje.contenido += order[0].account
            
            mensaje.contenido += ' '

            mensaje.contenido += contenidos.bienvenida.toString();
            
            mensaje.contenido += contenidos.opciones.toString();

        } else {
            mensaje.contenido += contenidos.bienvenidaSinCuenta.toString();
            mensaje.contenido += contenidos.opciones.toString();
        }
        
        return mensaje.contenido
    } catch ( error ) {
        return contenidos.error.toString();
    }
}

const enviarLinkOrden = async ( cuenta, desde ) => {
    try {
        const datosCuenta = cuenta
        const deConCodigoPais = (desde.split('whatsapp:+')[1]).toString();

        const deSoloNumero = []
        const idsCuenta = []
        datosCuenta.map( i => {
            deSoloNumero.push( deConCodigoPais.split(i.phone_code.toString())[1] )
            idsCuenta.push( ObjectId( i._id ))
        } )
        const order = await WorkOrdes.find({accountId: idsCuenta, telephone: deSoloNumero}).sort({create:-1})
        
        const mensaje = { contenido: ''};

        if(order && order.length > 0){
            mensaje.contenido += contenidos.linkInspeccion
            mensaje.contenido += ' '
            mensaje.contenido += order[0].shortUrl
            return mensaje.contenido
        } else {
            mensaje.contenido = contenidos.NolinkInspeccion
            return mensaje.contenido
        }

        
    } catch ( error ) {
        mensaje.contenido += contenidos.ErrorlinkInspeccion
        mensaje.contenido += ' '
        mensaje.contenido += contenidos.comuniqueseCon
        mensaje.contenido += ' +'
        mensaje.contenido += datosCuenta.phone_code + datosCuenta.telephone
        return mensaje.contenido
    }
}

const resumenInspeccion = async ( cuenta, desde ) => {
    try {
        const datosCuenta = cuenta
        const deConCodigoPais = (desde.split('whatsapp:+')[1]).toString();

        const deSoloNumero = []
        const idsCuenta = []
        datosCuenta.map( i => {
            deSoloNumero.push( deConCodigoPais.split(i.phone_code.toString())[1] )
            idsCuenta.push( ObjectId( i._id ))
        } )
        const order = await WorkOrdes.find({accountId: idsCuenta, telephone: deSoloNumero}).sort({create:-1})
        
        

        const mensaje = { contenido:'' }
        if(order && order.length > 0){

            let actividadesUrgentes = 0
            let valorEstimadoUrgentes = 0

            let actividadesPronto = 0
            let valorEstimadoPronto = 0

            order[0].process.map( i => {
                i.checkList.map( j => {
                    
                    if(j.answer.value === 0 ) { 
                        actividadesUrgentes = 1 + actividadesUrgentes
                        j.quotation.mo.map( k => {
                            valorEstimadoUrgentes += k.total
                        })
                        j.quotation.parts.map( k => {
                            valorEstimadoUrgentes += k.total
                        })
                    }
                    if(j.answer.value === 1 ) {
                        actividadesPronto += 1
                        j.quotation.mo.map( k => {
                            valorEstimadoPronto += k.total
                        })
                        j.quotation.parts.map( k => {
                            valorEstimadoPronto += k.total
                        })
                    }
                    
                })
            })

            mensaje.contenido += contenidos.resumenInspeccion
            mensaje.contenido += ' '
            mensaje.contenido += order[0].plate
            mensaje.contenido += '\n'
            mensaje.contenido += contenidos.servicioUrgente
            mensaje.contenido += ` [${actividadesUrgentes}] actividad${actividadesUrgentes>1?'es':''}`
            mensaje.contenido += ' '
            mensaje.contenido += contenidos.valorEstimado
            mensaje.contenido += ` $${Math.round(valorEstimadoUrgentes)}\n`

            mensaje.contenido += contenidos.servicioPronto
            mensaje.contenido += ` [${actividadesPronto}] actividad${actividadesPronto>1?'es':''}`
            mensaje.contenido += ' '
            mensaje.contenido += contenidos.valorEstimado
            mensaje.contenido += ` $${Math.round(valorEstimadoPronto)}\n`
            mensaje.contenido += contenidos.masInformacion
            mensaje.contenido += ' '
            mensaje.contenido += order[0].shortUrl

            return mensaje.contenido
        } else {
            mensaje.contenido = contenidos.noSeEncontroResumen
            return mensaje.contenido
        }
    } catch ( error ) {

    }
}

const agendamientoPasoUno = async ( cuenta, desde ) => {
    try {
        const datosCuenta = cuenta
        const deConCodigoPais = (desde.split('whatsapp:+')[1]).toString();
        const deSoloNumero = []
        const idsCuenta = []
        datosCuenta.map( i => {
            deSoloNumero.push( deConCodigoPais.split(i.phone_code.toString())[1] )
            idsCuenta.push( ObjectId( i._id ))
        } )

        const order = await WorkOrdes.find({accountId: idsCuenta, telephone: deSoloNumero}).sort({create:-1})

        let idCuenta
        if( order && order.length > 0 ){
            // SI EL USUARIO YA HA TENIDO ORDENES
            idCuenta = ObjectId(order[0].accountId)
        } else {
            // SI EL USUARIO ES NUEVO
            // PREPARAR LÓGICA DIFERENTE
            mensaje.contenido = contenidos.agendamientoSinOrdenes
            return mensaje.contenido
        }
        
        centros = await Centros.aggregate([
            { $match: { account: idCuenta } },
            { $project:{ 
                ciudad: "$city",
                _id:0,
                id: { $sum: 0 },
                nombre: "$name",
                direccion: "$address",
             }}
        ])
        
        const mensaje = { contenido: ''}
        mensaje.contenido += contenidos.agendamientoPaso1
        mensaje.contenido += '\n'

        centros.map( (i, index) => {
            mensaje.contenido += `\n[${index+1}] ${i.nombre} \n`
            mensaje.contenido += `${i.direccion} - ${i.ciudad}\n`
        })
        mensaje.contenido += '\n'
        mensaje.contenido += contenidos.agendamientoPaso2
        

        return mensaje.contenido.toString()
    } catch ( error ) {
        
    }
}

const agendamientoPasoDos = async ( seleccion ) => {
    try {

        const cantidadCentros = centros.length
        const mensaje = { contenido: ''}
        
        if( seleccion > cantidadCentros || seleccion <= 0) {
            return mensaje.contenido += contenidos.agendamientoPaso2Mensaje1
        }
        const index = seleccion - 1;
        const centro = centros[index]

        mensaje.contenido += contenidos.agendamientoPaso2Mensaje2
        mensaje.contenido += ': '
        mensaje.contenido += `${centro.nombre}`
        mensaje.contenido += ' '
        mensaje.contenido += contenidos.agendamientoPaso2Mensaje3
        mensaje.contenido += ' '
        mensaje.contenido += `${centro.direccion}`

        return mensaje.contenido.toString()

    } catch ( error ) {
        return JSON.stringify(error)
    }
}

module.exports = {
    saludoInicial,
    enviarLinkOrden,
    detectarSolicitudes
}