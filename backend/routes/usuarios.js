const express = require('express');
const router = express.Router();
const Usuario = require('../models/Usuario');
const Prediccion = require('../models/Prediccion'); // NUEVO: Importamos las predicciones
const auth = require('../middleware/auth');


// RUTA: Obtener mi usuario
router.get('/me', auth, async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.usuario.id);
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    res.json({ id: usuario._id, nombre: usuario.nombre, cambio_nombre: usuario.cambio_nombre });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al obtener usuario', error: err.message });
  }
});

// RUTA: Cambiar el nombre de usuario (sólo una vez)
router.put('/renombrar', auth, async (req, res) => {
  try {
    const { nuevoNombre } = req.body;
    const usuario = await Usuario.findById(req.usuario.id);
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

    if (usuario.cambio_nombre) {
      return res.status(400).json({ mensaje: 'Ya modificaste tu nombre. Solo se permite un cambio.' });
    }

    if (!nuevoNombre || nuevoNombre.trim().length < 3) {
      return res.status(400).json({ mensaje: 'El nombre debe tener al menos 3 caracteres.' });
    }

    usuario.nombre = nuevoNombre.trim();
    usuario.cambio_nombre = true;
    await usuario.save();

    res.json({ mensaje: 'Nombre actualizado con éxito', nuevoNombre: usuario.nombre });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al cambiar el nombre', error: err.message });
  }
});
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