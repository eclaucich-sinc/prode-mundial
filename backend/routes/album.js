const express = require('express');
const router = express.Router();
const Usuario = require('../models/Usuario');
const auth = require('../middleware/auth');

const PUNTOS_POR_FIGURITA = 20;
const TOTAL_FIGURITAS = 20;

// Obtener info del álbum del usuario logueado
router.get('/mias', auth, async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.usuario.id);
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

    const puntosDisponibles = (usuario.puntos_totales || 0) - (usuario.puntos_gastados || 0);

    res.json({
      puntosDisponibles,
      figuritas: usuario.figuritas || []
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener el álbum' });
  }
});

// Comprar una figurita
router.post('/comprar', auth, async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.usuario.id);
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

    const puntosDisponibles = (usuario.puntos_totales || 0) - (usuario.puntos_gastados || 0);

    if (puntosDisponibles < PUNTOS_POR_FIGURITA) {
      return res.status(400).json({ mensaje: 'No tenés puntos suficientes para comprar una figurita.' });
    }

    // Descontar puntos
    usuario.puntos_gastados = (usuario.puntos_gastados || 0) + PUNTOS_POR_FIGURITA;

    // Generar figurita aleatoria
    const nuevaFigurita = Math.floor(Math.random() * TOTAL_FIGURITAS) + 1;

    // Agregar si es nueva (uniqueness is handled by using includes)
    let esNueva = false;
    if (!usuario.figuritas) usuario.figuritas = [];
    if (!usuario.figuritas.includes(nuevaFigurita)) {
      usuario.figuritas.push(nuevaFigurita);
      esNueva = true;
    }

    await usuario.save();

    res.json({
      mensaje: esNueva ? `¡Te tocó la figurita #${nuevaFigurita} y es NUEVA!` : `Te tocó la figurita #${nuevaFigurita} pero ya la tenías.`,
      figurita: nuevaFigurita,
      esNueva,
      puntosDisponibles: (usuario.puntos_totales || 0) - usuario.puntos_gastados,
      figuritas: usuario.figuritas
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al comprar la figurita' });
  }
});

module.exports = router;
