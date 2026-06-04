const mongoose = require('mongoose');
const Figurita = require('./models/Figurita');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    try {
      const catalogoDocs = await Figurita.find({}).sort({ numero: 1 });
      const catalogo = catalogoDocs.map(f => {
        return {
          numero: f.numero,
          nombre: f.nombre,
          img_frente: f.img_frente ? f.img_frente.toString('base64').substring(0, 20) : null,
          img_dorso: f.img_dorso ? f.img_dorso.toString('base64').substring(0, 20) : null
        };
      });
      console.log("Success:", catalogo.length);
    } catch (e) {
      console.error("ERROR EN SCRIPT:", e);
    }
    process.exit();
  });
