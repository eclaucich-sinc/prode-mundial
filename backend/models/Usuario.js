const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
  nombre: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  puntos_totales: { type: Number, default: 0 } // Arranca en cero
});

module.exports = mongoose.model('Usuario', usuarioSchema);