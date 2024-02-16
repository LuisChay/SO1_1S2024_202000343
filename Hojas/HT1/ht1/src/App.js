import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Doughnut } from 'react-chartjs-2';
import {Chart, ArcElement} from 'chart.js'
Chart.register(ArcElement);

const ramDataInitialState = {
  totalRam: 0,
  ramEnUso: 0,
  ramLibre: 0,
  porcentajeEnUso: 0,
};

const App = () => {
  const [ramData, setRamData] = useState(ramDataInitialState);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/data'); 
        
        setRamData({
          totalRam: response.data.Total_Ram,
          ramEnUso: response.data.Ram_en_Uso,
          ramLibre: response.data.Ram_libre,
          porcentajeEnUso: response.data.Porcentaje_en_uso,
        });

  
      } catch (error) {
        console.error('Error al obtener los datos de RAM:', error);
      }
    };
    // INTERVALO DE TIEMPO PARA ACTUALIZAR LOS DATOS
    const interval = setInterval(fetchData, 1000); 

    return () => clearInterval(interval); 
  }, []);

  const data = {
    labels: ['RAM en uso', 'RAM libre'],
    datasets: [
      {
        data: [ramData.ramEnUso, ramData.ramLibre],
        backgroundColor: ['#FF0000', '#0000ff'],
        hoverBackgroundColor: ['#FF0000', '#0000ff'],
      },
    ],
  };
  
  const options = {
    maintainAspectRatio: false, // Para permitir ajustar el tamaño de la gráfica
    legend: {
      display: true, // Mostrar leyenda
      position: 'bottom', // Posición de la leyenda
      labels: {
        fontSize: 14, // Tamaño de fuente de los labels
      },
    },
  };
  
  
  return (
    <div>
      <h2>Uso de Memoria RAM</h2>
      <p>Total RAM: {ramData.totalRam} MB</p>
      <p>Porcentaje en uso: {ramData.porcentajeEnUso}%</p>
      <p>RAM en uso: {ramData.ramEnUso} MB</p>
      <p>RAM libre: {ramData.ramLibre} MB</p>

      <div style={{ width: '300px', height: '300px' }}> {/* Tamaño de la gráfica */}
        <Doughnut data={data} options={options} />
      </div>
    </div>
  );
  
};

export default App;
