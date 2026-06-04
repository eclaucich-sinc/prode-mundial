const mongoose = require('mongoose');
const Figurita = require('./models/Figurita');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    try {
      const f = await Figurita.findOne({});
      console.log(f);
      if (f.img_frente) {
        console.log("type of img_frente:", typeof f.img_frente);
        console.log("isBuffer?", Buffer.isBuffer(f.img_frente));
        console.log("has toString?", typeof f.img_frente.toString);
        const base64 = f.img_frente.toString('base64');
        console.log("Base64 string starts with:", base64.substring(0, 50));
      } else {
        console.log("No img_frente");
      }
    } catch (e) {
      console.error(e);
    }
    process.exit();
  });
