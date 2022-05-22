const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const ClienteConcesionarioSchema = new Schema({
    placa: { type: String, default: '', trim: true },
    vin: { type: String, default: '', trim: true },
    marca: { type: String, default: '', trim: true },
    modelo: { type: String, default: '', trim: true },
    ano: { type: String, default: '', trim: true },
    nombre: { type: String, default: '', trim: true },
    apellido: { type: String, default: '', trim: true },
    identificacion: { type: String, default: '', trim: true },
    telefono: { type: String, default: '', trim: true },
    email: { type: String, default: '', trim: true, lowercase: true },
    codigoCuenta: { type: String, default: '', trim: true }
})

module.exports = mongoose.model('cliente_concesionario', ClienteConcesionarioSchema )
