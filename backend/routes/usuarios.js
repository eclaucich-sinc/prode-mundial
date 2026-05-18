const express = require('express');
const router = express.Router();
const Usuario = require('../models/Usuario');
const Prediccion = require('../models/Prediccion'); // NUEVO: Importamos las predicciones


// RUTA: Obtener el ranking ordenado de mayor a menor
router.get('/ranking', async (req, res) => {
  try {
    // Buscamos todos los usuarios, traemos solo su nombre y puntos, y ordenamos (-1 es descendente)
    const ranking = await Usuario.find({}, 'nombre puntos_totales').sort({ puntos_totales: -1 });
    res.json(ranking);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener el ranking', error: error.message });
  }
});

// NUEVO: RUTA para obtener el historial de puntos para el gráfico
router.get('/historial', async (req, res) => {
  try {
    // Buscamos todas las predicciones que ya tienen puntos (es decir, de partidos finalizados)
    // Usamos 'populate' para traer el nombre del usuario y la fecha del partido en la misma consulta
    const predicciones = await Prediccion.find({ puntos_ganados: { $ne: null } })
      .populate('usuario_id', 'nombre')
      .populate('partido_id', 'fecha_hora');

    // Formateamos los datos para enviarlos limpios al frontend
    const historialLimpio = predicciones
      .filter(p => p.partido_id != null && p.usuario_id != null) // Evitamos errores si se borró un partido
      .map(p => ({
        usuario: p.usuario_id.nombre,
        fecha: p.partido_id.fecha_hora,
        puntos: p.puntos_ganados
      }));

    res.json(historialLimpio);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener el historial', error: error.message });
  }
});

module.exports = router;