require('dotenv').config();
const mongoose = require('mongoose');
const Prediccion = require('./models/Prediccion');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Conectado a MongoDB');

    const predicciones = await Prediccion.aggregate([
      {
        $group: {
          _id: { usuario_id: "$usuario_id", partido_id: "$partido_id" },
          count: { $sum: 1 },
          docs: { $push: "$_id" }
        }
      },
      {
        $match: {
          count: { $gt: 1 }
        }
      }
    ]);

    let eliminadas = 0;
    for (const group of predicciones) {
      // Keep the last one, delete the rest
      const [keep, ...toDelete] = group.docs.reverse();
      console.log(toDelete);
      if (toDelete.length > 0) {
        await Prediccion.deleteMany({ _id: { $in: toDelete } });
        eliminadas += toDelete.length;
      }
    }

    console.log(`Borradas ${eliminadas} predicciones duplicadas.`);

    // Sync indexes now that duplicates are gone
    await Prediccion.syncIndexes();
    console.log('Índices sincronizados.');

    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
