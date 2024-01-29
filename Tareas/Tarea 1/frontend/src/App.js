import React, { useState } from 'react';
import './App.css';

function App() {
  const [datos, setDatos] = useState(null);

  const fetchData = async () => {
    try {
      const response = await fetch('http://localhost:5000/data');
      if (!response.ok) {
        throw new Error('Error al obtener los datos');
      }
      const data = await response.json();
      setDatos(data);
      //console.log(data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="App">
      <h1>Tarea 1 - SO1 - 1S2024</h1>
      <button onClick={fetchData}>Consultar Datos</button>
      {datos && (
        <div className="datos-container">
          <h2>Datos Obtenidos:</h2>
          <p>Nombre: {datos.nombre}</p>
          <p>Carnet: {datos.carnet}</p>
          <p>Fecha y hora: {datos.fecha_hora}</p>
        </div>
      )}
    </div>
  );
}

export default App;
