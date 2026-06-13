const mongoose = require('mongoose');

const prediccionSchema = new mongoose.Schema({
  usuario_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  partido_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Partido', required: true },
  prediccion_goles_local: { type: Number, required: true },
  prediccion_goles_visitante: { type: Number, required: true },
  puntos_ganados: { type: Number, default: null } // Se calcula después del partido
});
// Índice compuesto único para que un usuario no pueda predecir dos veces el mismo partido a nivel base de datos
prediccionSchema.index({ usuario_id: 1, partido_id: 1 }, { unique: true });

module.exports = mongoose.model('Prediccion', prediccionSchema);