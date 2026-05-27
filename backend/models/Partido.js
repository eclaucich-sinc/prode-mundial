const mongoose = require('mongoose');

const partidoSchema = new mongoose.Schema({
  equipo_local: { type: String, required: true },
  equipo_visitante: { type: String, required: true },
  fecha_hora: { type: Date, required: true },
  grupo_o_fase: { type: String, required: true },
  estado: { type: String, enum: ['pendiente', 'finalizado'], default: 'pendiente' },
  // Estos campos se llenan cuando el partido termina
  resultado_real: {
    goles_local: { type: Number, default: null },
    goles_visitante: { type: Number, default: null }
  },
  bonus_aplicado: { type: Boolean, default: false }
});

module.exports = mongoose.model('Partido', partidoSchema);