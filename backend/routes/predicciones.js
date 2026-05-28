const express = require('express');
const router = express.Router();
const Prediccion = require('../models/Prediccion');
const Partido = require('../models/Partido');
const auth = require('../middleware/auth'); // Traemos al "guardia de seguridad"

// RUTA: Guardar o actualizar una predicción (Requiere Token)
router.post('/', auth, async (req, res) => {
  try {
    const { partido_id, prediccion_goles_local, prediccion_goles_visitante } = req.body;
    const usuario_id = req.usuario.id; // Esto lo extrajo nuestro middleware del Token!

    // Validar que el partido exista y no haya expirado el tiempo de predicción
    const partido = await Partido.findById(partido_id);
    if (!partido) return res.status(404).json({ mensaje: 'Partido no encontrado' });

    const ahora = new Date();
    const partidoObj = new Date(partido.fecha_hora);

    if (ahora >= partidoObj) {
      return res.status(403).json({ mensaje: 'Ya no puedes hacer predicciones para este partido. El partido ya comenzó.' });
    }

    // Buscamos si el usuario ya había hecho una predicción para este partido
    let prediccion = await Prediccion.findOne({ usuario_id, partido_id });

    if (prediccion) {
      // Si ya existía, simplemente la actualizamos (por si cambió de opinión antes del partido)
      prediccion.prediccion_goles_local = prediccion_goles_local;
      prediccion.prediccion_goles_visitante = prediccion_goles_visitante;
    } else {
      // Si no existía, creamos una nueva
      prediccion = new Prediccion({
        usuario_id,
        partido_id,
        prediccion_goles_local,
        prediccion_goles_visitante
      });
    }

    await prediccion.save();
    res.json({ mensaje: 'Predicción guardada exitosamente', prediccion });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al guardar la predicción', error: error.message });
  }
});

// RUTA: Obtener las predicciones del usuario que está logueado (Requiere Token)
router.get('/mias', auth, async (req, res) => {
  try {
    const predicciones = await Prediccion.find({ usuario_id: req.usuario.id });
    res.json(predicciones);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener predicciones' });
  }
});

module.exports = router;