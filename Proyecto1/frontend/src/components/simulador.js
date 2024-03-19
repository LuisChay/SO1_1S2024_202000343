import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import './Styles/rect.css';
import { DataSet, Network } from 'vis-network/standalone';

const Simulador = () => {
  const [network, setNetwork] = useState(null);
  const [nuevoPid, setNuevoPid] = useState(null);
  const [nodos, setNodos] = useState([]);
  const [aristasDisplay, setAristasDisplay] = useState([]);
  const [globalPID, setGlobalPID] = useState(null);

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
      const newNetwork = new Network(container, { nodes: nodos, edges: aristasDisplay }, options);
      setNetwork(newNetwork);
    } else {
      network.setData({ nodes: nodos, edges: aristasDisplay });
    }
  }, [network, nodos, aristasDisplay]);

  const dibujarProceso = () => {
    fetch('/api/start', {
      method: 'POST',
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Error al iniciar el proceso');
        }
        return response.json();
      })
      .then(data => {
        console.log('Proceso iniciado con PID:', data.pid);
        const nuevoId = Math.floor(10000 + Math.random() * 90000);
        const nuevoProceso = {
          id: nuevoId.toString(),
          label: 'NEW',
          color: 'blue',
        };

        const readyId = nuevoId + 1;
        const runningId = nuevoId + 2;

        const nuevosNodos = [
          ...nodos,
          nuevoProceso,
          { id: readyId.toString(), label: 'READY' },
          { id: runningId.toString(), label: 'RUNNING' },
        ];

        const nuevasAristas = [
          ...aristasDisplay,
          { id: `edge_${nuevoId}`, from: nuevoProceso.id, to: readyId.toString(), label: 'Crear', font: { size: 0 } },
          { id: `edge_${readyId}`, from: readyId.toString(), to: runningId.toString(), label: 'Ejecutar', font: { size: 0 } },
        ];

        setNuevoPid(data.pid);
        setGlobalPID(data.pid);
        setNodos(nuevosNodos);
        setAristasDisplay(nuevasAristas);
      })
      .catch(error => {
        console.error('Error:', error);
      });
  };
  const killProceso = () => {
    if (globalPID) {
      const newNodeId = Math.floor(10000 + Math.random() * 90000);
      const newNode = {
        id: newNodeId.toString(),
        label: 'TERMINATED',
        color: 'red',
      };
  
      const ultimoNodoId = nodos[nodos.length - 1].id;
      const nuevasAristas = [
        ...aristasDisplay,
        { id: `edge_${newNodeId}`, from: ultimoNodoId, to: newNode.id, label: 'Terminar', font: { size: 0 } },
      ];
  
      setNodos([...nodos, newNode]);
      setAristasDisplay(nuevasAristas);
  
      // Realizar la solicitud de terminación del proceso
      fetch('/api/kill', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pid: globalPID }),
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Error al terminar el proceso');
          }
          return response.json();
        })
        .then(data => {
          console.log('Proceso terminado:', data.message);
          // Puedes manejar la respuesta de la solicitud aquí si es necesario
        })
        .catch(error => {
          console.error('Error:', error);
        });
    } else {
      console.error('No se ha iniciado ningún proceso para terminar');
    }
  };
  
  const stopProceso = () => {
    if (globalPID) {
      const runningNode = nodos.find(node => node.label === 'RUNNING');
      const readyNode = nodos.find(node => node.label === 'READY');
      if (runningNode && readyNode) {
        const nuevaAristaId = `edge_${runningNode.id}_${readyNode.id}`;
        const nuevaArista = {
          id: nuevaAristaId,
          from: runningNode.id,
          to: readyNode.id,
          label: 'Detener',
          font: { size: 0 },
          smooth: {
            type: 'dynamic',
            roundness: 1,
          },
          arrows: { to: { enabled: true } }, // Habilitar la flecha en todas las aristas
        };
        const nuevasAristas = [...aristasDisplay.filter(arista => arista.id !== nuevaAristaId), nuevaArista];
        setAristasDisplay(nuevasAristas);
  
        // Realizar la solicitud para detener el proceso
        fetch('/api/stop', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ pid: globalPID }),
        })
          .then(response => {
            console.log("stop", response);
            if (!response.ok) {
              throw new Error('Error al detener el proceso');
            }
            return response.json();
          })
          .then(data => {
            console.log('Proceso detenido:', data.message);
            // Puedes manejar la respuesta de la solicitud aquí si es necesario
          })
          .catch(error => {
            console.error('Error:', error);
          });
      }
    } else {
      console.error('No se ha iniciado ningún proceso para detener');
    }
  };
  
  const resumeProceso = () => {
    if (globalPID) {
      const readyNode = nodos.find(node => node.label === 'READY');
      const runningNode = nodos.find(node => node.label === 'RUNNING');
      if (readyNode && runningNode) {
        const nuevaAristaId = `edge_${readyNode.id}_${runningNode.id}`;
        const nuevaArista = {
          id: nuevaAristaId,
          from: readyNode.id,
          to: runningNode.id,
          label: 'Resumir',
          font: { size: 0 },
          smooth: {
            type: 'dynamic',
            roundness: 1,
          },
          arrows: { to: { enabled: true } }, // Habilitar la flecha en todas las aristas
        };
        const nuevasAristas = [...aristasDisplay, nuevaArista];
        setAristasDisplay(nuevasAristas);
  
        // Realizar la solicitud para reanudar el proceso
        fetch('/api/resume', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ pid: globalPID }),
        })
          .then(response => {
            if (!response.ok) {
              throw new Error('Error al reanudar el proceso');
            }
            return response.json();
          })
          .then(data => {
            console.log('Proceso reanudado:', data.message);
            // Puedes manejar la respuesta de la solicitud aquí si es necesario
          })
          .catch(error => {
            console.error('Error:', error);
          });
      }
    } else {
      console.error('No se ha iniciado ningún proceso para reanudar');
    }
  };
   

  return (
    <div>
      <Navbar />
      <h1 className="centered-h1">Simulador de procesos</h1>
      <div id="network" style={{ width: '500px', height: '300px' }}></div>
      <div className="containerButtons">
        <button className="btn btn-success" onClick={dibujarProceso}>
          New
        </button>
        <button className="btn btn-warning" onClick={stopProceso}>
          Stop
        </button>
        <button className="btn btn-primary" onClick={resumeProceso}>
          Resume
        </button>
        <button className="btn btn-danger" onClick={killProceso}>
          Kill
        </button>
      </div>
      {globalPID && <div>PID: {globalPID}</div>}
    </div>
  );
};

export default Simulador;
