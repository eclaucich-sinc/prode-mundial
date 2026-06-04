const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
  nombre: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  puntos_totales: { type: Number, default: 0 }, // Arranca en cero
  puntos_gastados: { type: Number, default: 0 }, // Puntos gastados en figuritas
  figuritas: { type: [Number], default: [] }, // Array con los números de figuritas conseguidas
  rol: { type: String, default: 'user' }
});

module.exports = mongoose.model('Usuario', usuarioSchema);