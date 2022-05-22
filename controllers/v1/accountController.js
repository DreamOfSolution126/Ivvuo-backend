'use strict'

const Account = require('../../models/account')
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId

function newAccount(req, res){
	const account = new Account({
		name: req.body.name,
		code: req.body.code,
		nit: req.body.nit,
		av: req.body.av,
		email:req.body.email,
		address:req.body.address,
		contacts: req.body.contacts,
		plan:req.body.plan,
		city: req.body.city,
		country: req.body.country,
		phone_code: req.body.phone_code,
		code_country: req.body.code_country,
		telephone: req.body.telephone
	})
	account.save( (err)=>{
		if(err) return res.status(500).send({msg:`Error al guardar la Cuenta ${err}`})
		res.status(200).send({msg:`Guardado`}) 
	})
}

function countAccount(req, res){
	Account.countDocuments( (err, count)=>{
		if(err) return res.status(500).send({msg:`Error al contar las Cuentas ${err}`})
		res.status(200).send({msg:count})
	} )
}

function getAccount(req, res){
	let active = req.body.active
	let nit = req.body.nit
	Account.aggregate([
		{ $match: { active:{ $in:[false, true] } }},
	], (err, accounts)=>{
		if(err) return res.status(500).send({msg:`Error al consultar las cuentas ${err}`})
		res.status(200).send(accounts)
	})
}

function getAccountById(req, res){
	let id = req.params.id
	Account.findById(id,(err, account)=>{
		if(err) return res.status(500).send({msg:`Error al obtener los datos ${err}`})
		res.status(200).send(account)
	})
}

function editAccount(req, res){
	let id = req.body._id
	let update = req.body
	Account.findByIdAndUpdate(id, update, (err, account)=>{
		if(err) return res.status(500).send({msg:`Error al actualizar la cuenta ${err}`})
		res.status(200).send({msg:`Los cambios se han guardado con exito`})
	})
}
function getAccountIdToCenter(req, res){
	let id = ObjectId(req.body.id)
	Account.findById(ObjectId(id), (err, account)=>{
		if(err) return res.status(500).send({msg:'Error al consultar la información de la cuenta', err:err})
		res.status(200).send(account)
	})
}

async function obtenerCuentaZonaClientes ( req, res ) {
	try {

		const data = req.body;
		const ruta = data.ruta;

		const existeCuenta = await Account.findOne({
			'zonaCliente.ruta': ruta,
			'zonaCliente.estatus': true,
			active: true
		})

		if ( !existeCuenta ) {
			return res.status(200).send({
				estatus: false,
				resultadoOperacion: 'No se encontro esta cuenta'
			})
		}

		const datosCuenta = {
			logo: existeCuenta.logo,
			zonaCliente: existeCuenta.zonaCliente,
			cuenta: existeCuenta._id,
			logoNavBar: existeCuenta.logoNavBar
		}

		return res.status(200).send({
			estatus: true,
			resultadoOperacion: 'Se econtro cuenta',
			cuenta: datosCuenta
		})

	} catch ( error ) {
		return res.status(200).send({
			estatus: false,
			resultadoOperacion: 'Error al consultar la cuenta',
			cuenta: existeCuenta
		})
	}
}


module.exports = {
	newAccount,
	countAccount,
	getAccount,
	getAccountById,
	editAccount,
	getAccountIdToCenter,
	obtenerCuentaZonaClientes
}