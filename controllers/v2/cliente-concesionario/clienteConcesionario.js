const ClienteConcesionario = require('../../../models/clientes-concesionario/clientesConcesionario.model');

const consultaCliente = ( str_placa ) => {
    let cliente;
    try {
        cliente = await ClienteConcesionario.findOne({
            placa: str_placa
        })

        return {
            estatus: true,
            resultadoOperacion: 'Consulta cliente exitosa',
            data: {
                cliente: cliente
            }
        }
    } catch (error) {
        return {
            estatus: false,
            resultadoOperacion: 'Error al consultar el cliente',
            error: error
        }
    }
}

module.exports = {
    consultaCliente
}