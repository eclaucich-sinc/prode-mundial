const mongoose = require('mongoose');

const figuritaSchema = new mongoose.Schema({
  numero: { type: Number, required: true, unique: true },
  nombre: { type: String, required: true },
  img_frente: { type: Buffer }, // Assuming Binary PNG is stored as Buffer
  img_dorso: { type: Buffer }
});

module.exports = mongoose.model('Figurita', figuritaSchema);
