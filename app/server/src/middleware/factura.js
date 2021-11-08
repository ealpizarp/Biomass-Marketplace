const util = require("util");
const mongoose = require('mongoose');
const {mongoCli} = require("../../public/db")

const facturaSchema = new mongoose.Schema({
    client: String,
    date: { type: Date, default: Date.now },
    items: Object,
    total: Number,
    publica: { type: Boolean, default: true }
});
const factura = mongoCli.model('factura', facturaSchema);

module.exports = factura;