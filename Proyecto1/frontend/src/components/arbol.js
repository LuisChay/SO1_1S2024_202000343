import React, { useState, useEffect, useRef } from 'react';
import Navbar from './Navbar';
import axios from 'axios';
import { DataSet, Network } from 'vis-network/standalone';

const cpuDataInitialState = {
  tasks: [],
};

const Home = () => {
  const [cpuTasks, setCpuTasks] = useState([]);
  const [selectedPid, setSelectedPid] = useState(null);
  const [treeData, setTreeData] = useState(null);
  const networkContainer = useRef(null);
  const networkInstance = useRef(null);

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
    if (selectedPid !== null) {
      const filteredTasks = cpuTasks.filter(task => task.pid === selectedPid || task.padre === selectedPid);
      const nodes = new DataSet();
      const edges = new DataSet();

      filteredTasks.forEach(task => {
        const label = `${task.nombre} (${task.pid})`;
        nodes.add({ id: task.pid, label: label });
        if (task.padre !== 0) {
          edges.add({ from: task.padre, to: task.pid });
        }
      });

      const data = {
        nodes: nodes,
        edges: edges,
      };

      setTreeData(data);
    }
  }, [selectedPid, cpuTasks]);

  const handleSelectChange = (event) => {
    const pid = parseInt(event.target.value);
    setSelectedPid(pid);
  };

  useEffect(() => {
    if (treeData && networkContainer.current) {
      if (!networkInstance.current) {
        networkInstance.current = new Network(networkContainer.current, treeData, {
          layout: { hierarchical: { direction: 'UD', sortMethod: 'directed' } },
          height: '100%'
        });
      } else {
        networkInstance.current.setData(treeData);
      }
    }
  }, [treeData]);

  return (
    <div>
      <Navbar />
      <h1 className="centered-h1">Arbol de procesos</h1>
      <select onChange={handleSelectChange}>
        <option value="">Selecciona un PID</option>
        {cpuTasks.map(task => (
          <option key={task.pid} value={task.pid}>{task.pid}</option>
        ))}
      </select>
      <div ref={networkContainer} style={{ height: '600px' }} />
    </div>
  );
};

export default Home;
