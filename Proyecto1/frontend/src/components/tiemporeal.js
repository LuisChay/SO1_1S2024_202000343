import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import axios from 'axios';
import { Doughnut } from 'react-chartjs-2';
import { Chart, ArcElement } from 'chart.js';
import './Styles/rect.css'
Chart.register(ArcElement);

const ramDataInitialState = {
  totalRam: 0,
  ramEnUso: 0,
  ramLibre: 0,
  porcentajeEnUso: 0,
};

const cpuDataInitialState = {
  porcentajeEnUso: 0,
};

const Home = () => {
  const [ramData, setRamData] = useState(ramDataInitialState);
  const [cpuData, setCpuData] = useState(cpuDataInitialState);

  useEffect(() => {
    const fetchRAMData = async () => {
      try {
        const response = await axios.get('/api/ram');
        const { Total_Ram, Ram_en_Uso, Ram_libre, Porcentaje_en_uso } = response.data;
        setRamData({
          totalRam: Total_Ram,
          ramEnUso: Ram_en_Uso,
          ramLibre: Ram_libre,
          porcentajeEnUso: Porcentaje_en_uso,
        });
      } catch (error) {
        console.error('Error al obtener los datos de RAM:', error);
      }
    };

    const fetchCPUData = async () => {
      try {
        const response = await axios.get('/api/cpu');
        const { Porcentaje_en_uso } = response.data;
        setCpuData({
          porcentajeEnUso: Porcentaje_en_uso,
        });
      } catch (error) {
        console.error('Error al obtener los datos de CPU:', error);
      }
    };

    // Intervalo para actualizar los datos cada segundo
    const ramInterval = setInterval(fetchRAMData, 1000);
    const cpuInterval = setInterval(fetchCPUData, 1000);

    // Limpieza de intervalos
    return () => {
      clearInterval(ramInterval);
      clearInterval(cpuInterval);
    };
  }, []);

  const ramChartData = {
    labels: ['RAM en uso', 'RAM libre'],
    datasets: [
      {
        data: [ramData.ramEnUso, ramData.ramLibre],
        backgroundColor: ['#FF0000', '#0000ff'],
        hoverBackgroundColor: ['#FF0000', '#0000ff'],
      },
    ],
  };

  const cpuChartData = {
    labels: ['CPU en uso', 'CPU libre'],
    datasets: [
      {
        data: [cpuData.porcentajeEnUso, 100 - cpuData.porcentajeEnUso],
        backgroundColor: ['#FF0000', '#0000ff'],
        hoverBackgroundColor: ['#FF0000', '#0000ff'],
      },
    ],
  };

  const options = {
    maintainAspectRatio: true, // Para permitir ajustar el tamaño de la gráfica
    legend: {
      display: true, // Mostrar leyenda
      labels: {
        fontSize: 14, // Tamaño de fuente de los labels
      },
    },
  };

  return (
    <div>
      <Navbar />
    <h1 className="centered-h1">Proyecto 1 - Sistemas Operativos 1</h1>
    <h1 className="centered-h1">Luis Manuel Chay Marroquín - 202000343</h1>

      <div className="container">
        <div className="card">
        {/* Gráfico de RAM */}
        <h2>Uso de Memoria RAM</h2>
      <p>Total RAM: {ramData.totalRam} MB</p>
      <p>Porcentaje en uso: {ramData.porcentajeEnUso}%</p>
      <p>RAM en uso: {ramData.ramEnUso} MB</p>
      <p>RAM libre: {ramData.ramLibre} MB</p>
        <h3>Gráfico de RAM</h3>
        <Doughnut data={ramChartData} options={options} />
      
        </div>
        <div className="card">
{/* Gráfico de CPU */}
        <h2>Uso de CPU</h2>
      <p>Porcentaje en uso: {cpuData.porcentajeEnUso}%</p>
      <p>Porcentaje libre: {100 - cpuData.porcentajeEnUso}%</p>
<h3>Gráfico de CPU</h3>
        <Doughnut data={cpuChartData} options={options} />
        </div>
      </div>
     

    </div>
  );
};

export default Home;
