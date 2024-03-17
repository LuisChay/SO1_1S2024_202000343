import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import './Styles/rect.css';
import axios from 'axios'; // Importa Axios
import { DataSet, Network } from 'vis-network/standalone';

const Diagrama = () => {
  const [network, setNetwork] = useState(null);
  const [nuevoPid, setNuevoPid] = useState(null);
  const [cpuTasks, setCpuTasks] = useState([]);
  const [nombreTarea, setNombreTarea] = useState('');

  useEffect(() => {
    const fetchCPUData = async () => {
      try {
        const response = await axios.get('/api/cpu');
        setCpuTasks(response.data.tasks);
      } catch (error) {
        console.error('Error al obtener los datos de CPU:', error);
      }
    };

    fetchCPUData(); // Solicitud al cargar la página
  }, []);

  useEffect(() => {
    if (network === null) {
      const container = document.getElementById('network');
      const options = {
        nodes: {
          shape: 'box',
          physics: false,
        },
        edges: {
          smooth: {
            type: 'dynamic',
            roundness: 1,
          },
          arrows: {
            to: { enabled: true } // Habilitar la flecha en todas las aristas
          },
        },
      };
      const newNetwork = new Network(container, { nodes: [], edges: [] }, options);
      setNetwork(newNetwork);
    } else {
      dibujarDiagrama(); // Redibujar el diagrama cuando cambie el PID seleccionado
    }
  }, [network, nuevoPid]);

  const dibujarDiagrama = () => {
    const pidSeleccionado = nuevoPid ? parseInt(nuevoPid) : null;
    const nodoNew = { id: 'new', label: 'New' };
    let nodos = [nodoNew];
    let aristas = [];

    if (pidSeleccionado !== null) {
      const tareaSeleccionada = cpuTasks.find(task => task.pid === pidSeleccionado);
      if (tareaSeleccionada) {
        let estadoTitulo = '';
        switch (tareaSeleccionada.estado) {
          case 0:
            estadoTitulo = 'Estado: En ejecución';
            nodos.push({ id: 'ready', label: 'Ready' }, { id: 'running', label: 'Running' });
            aristas.push({ from: 'new', to: 'ready' }, { from: 'ready', to: 'running' });
            break;
          case 1:
            estadoTitulo = 'Estado: Listo';
            nodos.push({ id: 'ready', label: 'Ready' });
            aristas.push({ from: 'new', to: 'ready' });
            break;
          case 2:
            estadoTitulo = 'Estado: Suspendido';
            nodos.push({ id: 'ready', label: 'Ready' }, { id: 'running', label: 'Running' });
            aristas.push({ from: 'new', to: 'ready' }, { from: 'ready', to: 'running' }, { from: 'running', to: 'ready' });
            break;
          case 3:
            estadoTitulo = 'Estado: Ininterrumpible';
            nodos.push({ id: 'ready', label: 'Ready' }, { id: 'running', label: 'Running' }, { id: 'uninterrumpible', label: 'Uninterrumpible' });
            aristas.push({ from: 'new', to: 'ready' }, { from: 'ready', to: 'running' }, { from: 'running', to: 'uninterrumpible' });
            break;
          case 4:
            estadoTitulo = 'Estado: Detenido';
            nodos.push({ id: 'ready', label: 'Ready' }, { id: 'running', label: 'Running' }, { id: 'stopped', label: 'Stopped' });
            aristas.push({ from: 'new', to: 'ready' }, { from: 'ready', to: 'running' }, { from: 'running', to: 'stopped' });
            break;
          case 5:
            estadoTitulo = 'Estado: Zombie';
            nodos.push({ id: 'ready', label: 'Ready' }, { id: 'running', label: 'Running' }, { id: 'terminated', label: 'Terminated' }, { id: 'zombie', label: 'Zombie' });
            aristas.push({ from: 'new', to: 'ready' }, { from: 'ready', to: 'running' }, { from: 'running', to: 'terminated' }, { from: 'terminated', to: 'zombie' });
            break;
          case 6:
            estadoTitulo = 'Estado: Finalizado';
            nodos.push({ id: 'ready', label: 'Ready' }, { id: 'running', label: 'Running' }, { id: 'terminated', label: 'Terminated' });
            aristas.push({ from: 'new', to: 'ready' }, { from: 'ready', to: 'running' }, { from: 'running', to: 'terminated' });
            break;
          case 1026:
            estadoTitulo = 'Estado: En espera';
            nodos.push({ id: 'ready', label: 'Ready' }, { id: 'running', label: 'Running' });
            aristas.push({ from: 'new', to: 'ready' }, { from: 'ready', to: 'running' }, { from: 'running', to: 'ready' });
            break;
          case 8193:
            estadoTitulo = 'Estado: En ejecución';
            nodos.push({ id: 'ready', label: 'Ready' }, { id: 'running', label: 'Running' });
            aristas.push({ from: 'new', to: 'ready' }, { from: 'ready', to: 'running' });
            break;
          default:
            estadoTitulo = 'Estado: Desconocido';
            break;
        }
        // Actualizar el título según el estado
        document.getElementById('estadoTitulo').innerText = estadoTitulo;
        // Mostrar el nombre de la tarea seleccionada
        setNombreTarea(tareaSeleccionada.nombre);
      }
    }

    const container = document.getElementById('network');
    const data = {
      nodes: new DataSet(nodos),
      edges: new DataSet(aristas),
    };
    network.setData(data);
  };

  const handleSelectChange = (event) => {
    setNuevoPid(event.target.value);
  };

  return (
    <div>
      <Navbar />
      <h1 className="centered-h1">Diagrama de estados</h1>
      <div id="network" style={{ width: '500px', height: '300px' }}></div>
      <div id="estadoTitulo" className="estado-titulo"></div>
      <div className="containerSelect">
        <select className="form-select" onChange={handleSelectChange}>
          <option value="">Seleccione un PID</option>
          {cpuTasks.map(task => (
            <option key={task.pid} value={task.pid}>{task.pid}</option>
          ))}
        </select>
      </div>
      <div>Nombre del proceso: {nombreTarea}</div>
    </div>
  );
};

export default Diagrama;
