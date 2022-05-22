const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const CampanasServicioSchema = new Schema ({
    codigo: { type: String, default: '' },
    nombre: { type: String, default: '' },
    tipo: { type: String, default: '' },
    vin: { type: String, default: '' },
    realizada: { type: Boolean, default: false },
    fecha: { type: Date, default: new Date( Date.now() ) }
})

module.exports = mongoose.model('campanasservicio', CampanasServicioSchema )