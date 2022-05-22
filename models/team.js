'user strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const TeamSchema = new Schema({
    nit:{ type:String },
    role:{ type:String, default:'Operario Lavado' },
    validation:{type:String, unique:true},
    name:{ type:String },
    last_name:{ type:String },
    center_code:{type:String},
    account_code:{type:String},
    active:{type:Boolean, default:true},
    status:{type:String, enum:['break', 'lunch', 'available', 'busy'], default:'available'},
    lastUpdate:{ type:Date },
    time:{type:Number, default:0},
    profile_picture:{type:Object, default:{
        url:'http://localhost:3001/profiles/default.png',
        name:'default.png',
        type:'png'
    }},
    createdUp: { type:Date, default: new Date()},
})

module.exports = mongoose.model('Team', TeamSchema)