// Importar los módulos necesarios
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Crear una instancia de Express
const app = express();
app.use(cors());


// Conectar a la base de datos MongoDB
mongoose.connect('mongodb://35.238.160.212:27017/mydatabase', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Conexión a MongoDB establecida'))
.catch(err => console.error('Error al conectar a MongoDB', err));

// Definir un esquema para los datos
const Schema = mongoose.Schema;
const datosSchema = new Schema({
  message: String,
  inserted: {
    type: Date,
    default: Date.now
  }
});

// Definir un modelo basado en el esquema
const Datos = mongoose.model('votes', datosSchema);

// Ruta para obtener todos los datos
app.get('/datos', async (req, res) => {
  try {
    const datos = await Datos.find();
    res.json(datos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Iniciar el servidor
const port = process.env.PORT || 3100;
app.listen(port, () => {
  console.log(`Servidor iniciado en el puerto ${port}`);
});
