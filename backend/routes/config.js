const express = require('express');
const router = express.Router();
const Config = require('../models/Config');

// Obtener la configuración general (pública)
router.get('/', async (req, res) => {
  try {
    const config = await Config.findOne();
    if (!config) {
      return res.json({ clientName: 'Prode Mundial 2026' }); // Default if no doc is found
    }
    res.json({ clientName: config.clientName });
  } catch (error) {
    console.error("ERROR EN /config:", error);
    res.status(500).json({ mensaje: 'Error al obtener configuración' });
  }
});

module.exports = router;
