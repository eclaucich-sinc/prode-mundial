const mongoose = require('mongoose');

const configSchema = new mongoose.Schema({
  clientName: { type: String, required: true }
}, { collection: 'config' });

module.exports = mongoose.model('Config', configSchema);
