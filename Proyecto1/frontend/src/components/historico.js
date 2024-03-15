import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import axios from 'axios';
import Chart from 'chart.js/auto';
import './Styles/rect.css'

const Historico = () => {
  const [ramData, setRamData] = useState([]);
  const [cpuData, setCpuData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ramResponse, cpuResponse] = await Promise.all([
          axios.get('http://localhost:5000/api/ramhistorico'),
          axios.get('http://localhost:5000/api/cpuhistorico')
        ]);
        const formattedRAMData = formatData(ramResponse.data);
        const formattedCPUData = formatData(cpuResponse.data);
        setRamData(formattedRAMData);
        setCpuData(formattedCPUData);
        console.log('Datos de RAM:', formattedRAMData);
        console.log('Datos de CPU:', formattedCPUData);

        // Crear gráfico de barras para RAM
        createLineChart('ramChart', 'Uso de RAM', formattedRAMData);
        // Crear gráfico de barras para CPU
        createLineChart('cpuChart', 'Uso de CPU', formattedCPUData);
      } catch (error) {
        console.error('Error al obtener los datos:', error);
      }
    };

    fetchData(); // Llamar a la función para obtener datos de RAM y CPU

    const interval = setInterval(fetchData, 5000); // Llamar a fetchData cada 5 segundos

    return () => clearInterval(interval); // Limpiar el intervalo cuando el componente se desmonta
  }, []);

  // Función para formatear los datos
  const formatData = (data) => {
    return data.map(entry => ({
      ...entry,
      fecha: entry.fecha.replace(/[TZ]/g, ' ') // Reemplazar "T" y "Z" con espacios en blanco
    }));
  };

  // Función para crear un gráfico de líneas
  const createLineChart = (chartId, label, data) => {
    const ctx = document.getElementById(chartId).getContext('2d');
    if (window.myCharts && window.myCharts[chartId]) {
      window.myCharts[chartId].destroy(); // Destruir el gráfico anterior si existe
    }
    window.myCharts = window.myCharts || {};
    window.myCharts[chartId] = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.map(entry => entry.fecha.replace('T', ' ').replace('Z', '')).reverse(), // Invertir las fechas
        datasets: [{
          label: label,
          data: data.map(entry => entry.uso).reverse(), // Invertir los datos de uso
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
            max: 100
          }
        },
        responsive: true,
        maintainAspectRatio: false // Para que el tamaño se ajuste al contenedor
      }
    });
  };

  return (
    <div>
      <Navbar />
      <h1 className="centered-h1">Histograma</h1>

      <div className="container">
        <div className="card2">
          <canvas id="ramChart"></canvas>
        </div>
        <div className="card2">
          <canvas id="cpuChart"></canvas>
        </div>
      </div>
    </div>
  );
};

export default Historico;
