const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  // Obtenemos el token del encabezado (header) de la petición
  const token = req.header('Authorization');

  // Si no hay token, rechazamos la entrada
  if (!token) {
    return res.status(401).json({ mensaje: 'Acceso denegado. No hay token de autenticación.' });
  }

  try {
    // Verificamos el token sacando la palabra "Bearer " que suele venir adelante
    const tokenLimpio = token.replace('Bearer ', '');
    const verificado = jwt.verify(tokenLimpio, process.env.JWT_SECRET);
    
    // Le pasamos los datos del usuario a la ruta que sigue
    req.usuario = verificado;
    next(); // Le decimos que puede continuar
  } catch (error) {
    res.status(400).json({ mensaje: 'Token no válido.' });
  }
};