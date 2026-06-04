const express = require('express');
const router = express.Router();
const Usuario = require('../models/Usuario');
const Figurita = require('../models/Figurita');
const auth = require('../middleware/auth');

const PUNTOS_POR_FIGURITA = 20;
const TOTAL_FIGURITAS = 6;

// Obtener info del álbum del usuario logueado
router.get('/mias', auth, async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.usuario.id);
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

    const puntosDisponibles = (usuario.puntos_totales || 0) - (usuario.puntos_gastados || 0);

    // Fetch catalog of figuritas (avoiding mongo memory sort limit)
    const catalogoDocs = await Figurita.find({});
    catalogoDocs.sort((a, b) => a.numero - b.numero);

    const catalogo = catalogoDocs.map(f => {
      return {
        numero: f.numero,
        nombre: f.nombre,
        // Convert binary buffer to base64 if exists
        img_frente: f.img_frente ? `data:image/png;base64,${f.img_frente.toString('base64')}` : null,
        img_dorso: f.img_dorso ? `data:image/png;base64,${f.img_dorso.toString('base64')}` : null
      };
    });

    res.json({
      puntosDisponibles,
      figuritas: usuario.figuritas || [],
      catalogo
    });
  } catch (error) {
    console.error("ERROR EN /mias:", error);
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
