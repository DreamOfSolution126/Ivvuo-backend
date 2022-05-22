'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Account = mongoose.model('Account')

const CenterSchema = new Schema({
	apiKey: { type:String },
	name: { type: String, trim: true },
	code: { type:String, unique:true},
	zone: { type:String, minlength:2, maxlength:2, uppercase:true }, //z1,z2,z3, z4 y z5 Es la idea no?

	city:{ type:String }, // deprecate
	address:{ type:String }, // deprecate
	direccion: {
		direccion: { type: String, default: '' },
		ciudad: { type: String, default: '' },
		departamento: { type: String, default: '' },
		pais: { type: String, default: '' }
	},
	telefono: {
		indicativo: { type: String, default: '' },
		numero: { type: String, default: '' }
	},
	notas: { type: String, default:'' },
	select:{ type:Boolean, default:false },
	//Setings
	viewValues:{ type:Boolean, default:true},
	// Datos de Control
	active:{ type:Boolean, default:true},
	created:{ type: Date, default: Date.now() },
	//Relational 
	account:{ type: Schema.ObjectId, ref:Account},

	//Settings
	generateOrAuto:{ type:Boolean, default:true },
	configuraciones: {
		verOrdenesPorCliente: { type: Boolean, default: false },
		encuestaAlFinalizarAprobacion: { type: Boolean, default: false },
		enviarSMS: { type: Boolean, default: true },
		enviarWhatsApp: { type: Boolean, default: false },
		servicioRecogida: { type: Boolean, default: false }
	}

})

module.exports = mongoose.model('Center', CenterSchema)