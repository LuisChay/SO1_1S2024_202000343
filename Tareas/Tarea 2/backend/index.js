const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = 5000;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json()); // Este middleware permite el análisis del cuerpo de la solicitud como JSON.
//mongodb://MongoDB:27017/clase2
//mongodb://localhost:27017/clase2

const usuario = process.env.MONGO_USER;
const contrasena = process.env.MONGO_PASSWORD;
const host = process.env.MONGO_HOST;
const puerto = process.env.MONGO_PORT;
const baseDatos = process.env.MONGO_DB;

// URL de conexión a MongoDB

//let urlConexion = `mongodb://${host}:${puerto}/${baseDatos}`;
let urlConexion = `mongodb://MongoDB:27017/tarea2db`;


// Opciones de conexión
const opcionesConexion = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

// Conexión a MongoDB
mongoose.connect(urlConexion, opcionesConexion)
  .then(() => console.log('Conexión a MongoDB establecida correctamente'))
  .catch(error => console.error('Error al conectar a MongoDB:', error));


const Foto = mongoose.model('Fotos', {
    image: { type: Buffer }, // Almacenar la imagen como un buffer
    timestamp: { type: Date, default: Date.now } // Almacenar la fecha y hora en que fue tomada la foto
  });
  
  // Insertar una nueva foto
  app.post('/insertarfoto', async (req, res) => {

    const { image, timestamp } = req.body;
  
    if (!image || !timestamp) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }
  
    try {
      // Crear un nuevo documento de foto
      const nuevaFoto = new Foto();
  
      // Establecer la imagen en el buffer del documento de foto
      nuevaFoto.image = Buffer.from(image, 'base64');
        nuevaFoto.timestamp = new Date(timestamp);

  
      // Guardar el documento de foto en la base de datos
      await nuevaFoto.save();
  
      res.status(201).json(nuevaFoto);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al insertar la foto' });
    }
  });
// Obtener todos los alumnos
app.get('/fotos', async (req, res) => {
  try {
    const fotos = await Foto.find();
    res.json(fotos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener las fotos' });
  }
});


app.listen(PORT, () => {
  console.log(`Servidor API en http://localhost:${PORT}`);
});