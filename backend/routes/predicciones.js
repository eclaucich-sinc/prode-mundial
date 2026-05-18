const express = require('express');
const router = express.Router();
const Prediccion = require('../models/Prediccion');
const auth = require('../middleware/auth'); // Traemos al "guardia de seguridad"

// RUTA: Guardar o actualizar una predicción (Requiere Token)
router.post('/', auth, async (req, res) => {
  try {
    const { partido_id, prediccion_goles_local, prediccion_goles_visitante, prediccion_roja, prediccion_penal } = req.body;
    const usuario_id = req.usuario.id; // Esto lo extrajo nuestro middleware del Token!

    // Buscamos si el usuario ya había hecho una predicción para este partido
    let prediccion = await Prediccion.findOne({ usuario_id, partido_id });

    if (prediccion) {
      // Si ya existía, simplemente la actualizamos (por si cambió de opinión antes del partido)
      prediccion.prediccion_goles_local = prediccion_goles_local;
      prediccion.prediccion_goles_visitante = prediccion_goles_visitante;
      prediccion.prediccion_roja = prediccion_roja;
      prediccion.prediccion_penal = prediccion_penal;
    } else {
      // Si no existía, creamos una nueva
      prediccion = new Prediccion({
        usuario_id,
        partido_id,
        prediccion_goles_local,
        prediccion_goles_visitante,
        prediccion_roja,
        prediccion_penal
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