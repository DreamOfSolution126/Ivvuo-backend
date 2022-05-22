const mongoose = require('mongoose')
const config = require('../variablesEntorno/config')

const conectarBaseDeDatos = async () => {
    try {

        const url = { _arg: `mongodb+srv://${
            config.usuarioBaseDatos
        }:${
            config.contrasenaBaseDatos
        }@erpdevelope-tfhcs.mongodb.net/${
            config.baseDeDatos
        }?retryWrites=true&w=majority`}

        await mongoose.connect( url._arg, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        } )
        console.log('Se ha conectado a la base de datos', `MongoDB: ${config.baseDeDatos}`)

    } catch ( error ) {
        console.log('Error al conectar a la base de datos', error )
    }
}

module.exports = {
    conectarBaseDeDatos
}