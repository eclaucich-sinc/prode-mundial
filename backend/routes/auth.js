const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
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

    // Configurar transporte de Nodemailer
    let transporter;
    console.log('SMTP_USER', process.env.SMTP_USER);
    console.log('SMTP_PASS', process.env.SMTP_PASS);
    console.log('SMTP_HOST', process.env.SMTP_HOST);
    console.log('SMTP_PORT', process.env.SMTP_PORT);
    if (process.env.SMTP_HOST && process.env.SMTP_HOST.includes('gmail')) {
      // Configuración recomendada y más estable para Gmail
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
    } else if (process.env.SMTP_HOST) {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: Number(process.env.SMTP_PORT) === 465, // true para port 465, false para 587
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
    } else {
      return res.status(500).json({ mensaje: 'Faltan configurar las variables SMTP en el servidor.' });
    }

    const info = await transporter.sendMail({
      from: `Prode Q21 <${process.env.SMTP_USER}>`,
      to: usuario.email,
      subject: "Recuperación de contraseña - Prode Q21",
      text: `Hola ${usuario.nombre},\n\nTu contraseña actual es: ${usuario.password}\n\n¡Te esperamos en el Prode!`,
    });

    console.log("Email de recuperación enviado: %s", nodemailer.getTestMessageUrl(info) || info.messageId);

    res.json({ mensaje: 'Se ha enviado un correo con tu contraseña.' });
  } catch (error) {
    console.error("Error al recuperar contraseña:", error);
    res.status(500).json({
      mensaje: 'Hubo un problema al enviar el correo. Por favor, verificá la configuración SMTP o intentá de nuevo.',
      detalle: error.message
    });
  }
});

module.exports = router;