"use strict";

const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Plan = require("../models/plans");
const { object } = require("joi");

const AccountSchema = new Schema({
  name: { type: String, trim: true },
  code: { type: String, minlength: 5, maxlength: 5, uppercase: true },
  nit: { type: String },
  av: { type: String, uppercase: true },
  email: { type: String, trim: true },
  address: { type: String },
  city: { type: String, uppercase: true, trim: true },
  country: { type: String, default: "Colombia" },
  phone_code: { type: Number, default: 57 },
  code_country: { type: String },
  telephone: { type: String, minlength: 8 },
  contacts: { type: Array },
  plan: { type: Schema.ObjectId, ref: "Plan" },
  logo: {
    type: Object,
    default: {
      url: "https://ivvuo.com/assets/img/logo/logo_vertical.png",
      name: "default.png",
      type: "png",
    },
  },
  logoNavBar: { type: String },
  whatsapp: {
    estatus: { type: Boolean, default: false },
    accountSid: { type: String, default: "AC085e0d74225cfd21081916c53a8957d5" },
    authToken: { type: String, default: "017c8150c0a3770eef1bd332007281bd" },
    numero: { type: String, default: "13342924580" },
  },
  zonaCliente: {
    estatus: { type: Boolean, default: false },
    ruta: { type: String, default: "" },
    nombreComercial: { type: String, default: "" },
  },
  servicioRecogida: {
    estatus: { type: Boolean, default: false },
  },
  generales: {
    iva: {
      active: { type: Boolean, default: false },
      value: { type: Number, default: 0 },
    },
    video: {
      activo: { type: Boolean, default: true },
      duracion: { type: Number, default: 20 }
    }
  },

  // Datos de Control
  active: { type: Boolean, default: true },
  created: { type: Date, default: Date.now() },
});

module.exports = mongoose.model("Account", AccountSchema);
