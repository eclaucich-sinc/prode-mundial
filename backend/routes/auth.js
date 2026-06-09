const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario'); // Traemos el modelo que creamos antes

// RUTA 1: Registro de un nuevo usuario
router.post('/register', async (req, res) => {
  try {
    const { nombre, password, email, dni } = req.body;

    // 0. Validar requerimientos por cliente
    const clientName = process.env.CLIENT_NAME || 'Prode Mundial 2026';

    if (clientName === 'Q21') {
      if (!email || !dni) {
        return res.status(400).json({ mensaje: 'Email y DNI son obligatorios para este registro' });
      }
    }

    // 1. Verificamos si el usuario ya existe
    let usuarioExistente = await Usuario.findOne({ nombre });
    if (usuarioExistente) {
      return res.status(400).json({ mensaje: 'El nombre de usuario ya está registrado' });
    }

    // 2. Encriptamos la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Creamos el usuario y lo guardamos
    const nuevoUsuario = new Usuario({
      nombre,
      password: hashedPassword,
      email: email || undefined,
      dni: dni || undefined
    });
    await nuevoUsuario.save();

    res.status(201).json({ mensaje: 'Usuario registrado con éxito' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
  }
});

// RUTA 2: Login de usuario
router.post('/login', async (req, res) => {
  try {
    const { nombre, password } = req.body;

    // 1. Buscamos al usuario por nombre de usuario
    const usuario = await Usuario.findOne({ nombre });
    if (!usuario) {
      return res.status(400).json({ mensaje: 'Credenciales inválidas' });
    }

    // 2. Comparamos la contraseña ingresada con la encriptada en la base de datos
    const esPasswordCorrecto = await bcrypt.compare(password, usuario.password);
    if (!esPasswordCorrecto) {
      return res.status(400).json({ mensaje: 'Credenciales inválidas' });
    }

    // 3. Si todo está bien, generamos el Token (JWT)
    const token = jwt.sign(
      { id: usuario._id, nombre: usuario.nombre }, 
      process.env.JWT_SECRET, 
      { expiresIn: '30d' } // El token dura 30 días para que no se tengan que loguear a cada rato
    );

    res.json({ 
      mensaje: 'Login exitoso', 
      token, 
      usuario: { id: usuario._id, nombre: usuario.nombre, puntos: usuario.puntos_totales, rol: usuario.rol } 
    });

  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
  }
});

module.exports = router;