const express = require('express');
const router = express.Router();
const Partido = require('../models/Partido');

// RUTA: Obtener todos los partidos (ordenados por fecha)
router.get('/', async (req, res) => {
  try {
    const partidos = await Partido.find().sort({ fecha_hora: 1 });
    res.json(partidos);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener los partidos' });
  }
});

// RUTA: Crear un partido (Por ahora la dejamos abierta para cargar datos de prueba)
router.post('/', async (req, res) => {
  try {
    const nuevoPartido = new Partido(req.body);
    await nuevoPartido.save();
    res.status(201).json({ mensaje: 'Partido creado', partido: nuevoPartido });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear partido', error: error.message });
  }
});

module.exports = router;