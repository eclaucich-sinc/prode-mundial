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

    // 1. Verificamos si ya existe alguien con ese DNI o Email (si los ingresaron)
    if (email || dni) {
      const query = [];
      if (email) query.push({ email });
      if (dni) query.push({ dni });

      let usuarioExistente = await Usuario.findOne({ $or: query });
      if (usuarioExistente) {
        if (email && usuarioExistente.email === email) return res.status(400).json({ mensaje: 'El email ya está registrado' });
        if (dni && usuarioExistente.dni === dni) return res.status(400).json({ mensaje: 'El DNI ya está registrado' });
      }
    }

    // 2. Si el cliente es Q21, guardamos en texto plano (req del cliente). Si no, encriptamos.
    let finalPassword = password;
    if (clientName !== 'Q21') {
      const salt = await bcrypt.genSalt(10);
      finalPassword = await bcrypt.hash(password, salt);
    }

    // 3. Creamos el usuario y lo guardamos
    const nuevoUsuario = new Usuario({
      nombre,
      password: finalPassword,
      email: email || undefined,
      dni: dni || undefined
    });
    await nuevoUsuario.save();

    res.status(201).json({ mensaje: 'Usuario registrado con éxito' });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ mensaje: 'El email o DNI ya están en uso' });
    }
    res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
  }
});

// RUTA 2: Login de usuario
router.post('/login', async (req, res) => {
  try {
    const { nombre, password } = req.body;

    // 1. Buscamos al usuario por nombre, email o DNI
    const usuario = await Usuario.findOne({ 
      $or: [
        { nombre },
        { email: nombre },
        { dni: nombre }
      ]
    });
    if (!usuario) {
      return res.status(400).json({ mensaje: 'Credenciales inválidas' });
    }

    // 2. Comparamos la contraseña (texto plano para Q21, bcrypt para otros)
    const clientName = process.env.CLIENT_NAME || 'Prode Mundial 2026';
    let esPasswordCorrecto = false;

    if (clientName === 'Q21') {
      esPasswordCorrecto = (password === usuario.password);
    } else {
      esPasswordCorrecto = await bcrypt.compare(password, usuario.password);
    }

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

// RUTA 3: Recuperar contraseña
router.post('/recover', async (req, res) => {
  try {
    const clientName = process.env.CLIENT_NAME || 'Prode Mundial 2026';
    if (clientName !== 'Q21') {
      return res.status(403).json({ mensaje: 'Esta función solo está disponible para el cliente Q21' });
    }

    const { nombre, dni } = req.body;
    if (!nombre || !dni) {
      return res.status(400).json({ mensaje: 'Nombre de usuario y DNI son obligatorios' });
    }

    const usuario = await Usuario.findOne({ nombre, dni });
    if (!usuario) {
      return res.status(404).json({ mensaje: 'No se encontró un usuario con ese nombre y DNI' });
    }

    if (!usuario.email) {
      return res.status(400).json({ mensaje: 'El usuario no tiene un email registrado' });
    }

    // Enviar mensaje a Telegram
    const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!telegramToken || !chatId) {
      console.warn("Faltan variables de entorno para Telegram (TELEGRAM_BOT_TOKEN o TELEGRAM_CHAT_ID). El mensaje se imprimirá en consola.");
      console.log(`[SIMULACIÓN TELEGRAM] Recuperar contraseña de:\nNombre: ${usuario.nombre}\nDNI: ${dni}\nEmail: ${usuario.email}\nContraseña: ${usuario.password}`);
    } else {
      const mensajeTelegram = `🔔 Solicitud de recuperación de contraseña (Q21)
👤 Usuario: ${usuario.nombre}
🆔 DNI: ${dni}
📧 Email: ${usuario.email}
🔑 Contraseña: ${usuario.password}

Por favor, enviá un mail a este usuario con su contraseña.`;

      const telegramUrl = `https://api.telegram.org/bot${telegramToken}/sendMessage`;
      const response = await fetch(telegramUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: mensajeTelegram
        })
      });

      if (!response.ok) {
        throw new Error(`Error de Telegram API: ${response.statusText}`);
      }
    }

    res.json({ mensaje: '¡Solicitud recibida! Te estaremos enviando un correo con tu contraseña a la brevedad.' });
  } catch (error) {
    console.error("Error al recuperar contraseña:", error);
    res.status(500).json({
      mensaje: 'Hubo un problema al procesar la solicitud. Intentá de nuevo más tarde.',
      detalle: error.message
    });
  }
});

module.exports = router;