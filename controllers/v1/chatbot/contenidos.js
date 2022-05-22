const TYPES = require('./types')
const contenido = {
    idioma:{
        es:{
            agendamientoPaso1:`Para agendar una cita escoja el centro de servicio se su preferencia:`,
            agendamientoPaso2:`escriba el número del centro de servicio`,
            agendamientoPaso2Mensaje1:`Por favor escriba una selección válida`,
            agendamientoPaso2Mensaje2:`Ha seleccionado`,
            agendamientoPaso2Mensaje3:`ubicado en la`,
            agedamienctoCancelar:`\nHa cancelado el proceso de agendamiento\n`,
            agendamientoSinOrdenes: `Por ahora no podemos asociar su número a ningun centro de servicio`,
            bienvenida:` le dá la bienvenida, este es un servicio de mensajería automática, puede solicitar información respondiendo con una de las siguientes palabras:`,
            bienvenidaSinCuenta:`Bienvenido, este es un servicio de mensajería automático, puede solicitar información respondiendo con una de las siguientes palabras:`,
            opciones:`\n*${
                TYPES.Link
            }*: Para recibir el link de su inspección.\n*${
                TYPES.resumen
            }*: Para recibir el resumen de su inspección`,
            linkInspeccion:`Este es el link de su última inspección: `,
            NolinkInspeccion:`No se encontró información disponible`,
            ErrorlinkInspeccion:`Ocurrió un error al obtener el link de las inspección`,
            comuniqueseCon: `comuníquese con su centro de servicio al`,
            resumenInspeccion: `*Resumen Inspección* vehículo placa:`,
            noSeEncontroResumen: `No se encontró información asociada a este número`,
            servicioUrgente: `\n🛑 Servicio Urgente:`,
            servicioPronto: `\n⚠️ Servicio Pronto:`,
            valorEstimado: `\nValor estimado:`,
            masInformacion: `\npuede consultar más información en el siguiente link:`,

            error:`Ahora no podemos responder esta solicitud`,

            palabrasClave:{
                agendamientoPaso1:[/cita/, /agendar/, /mantenimiento/, /Cita/, /Agendar/, /Mantenimiento/ ],
                cancelar: [/cancelar/, /salir/, /0/, /Cancelar/, /Salir/,],
                saludos:['hola', 'buenos','bueno', 'ola', 'oli', 'hl', 'dias', 'tardes', 'noches', 'como', 'estan' ],
                link:['link', 'Link'],
                resumen:['resumen', 'resume', 'Resumen', /resumen/, /resume/, /Resumen/, /Resume/]
            }
        },
        en:{}
    }
}

module.exports = contenido