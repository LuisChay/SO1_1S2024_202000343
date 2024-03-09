import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import './Styles/rect.css';
import { DataSet, Network } from 'vis-network/standalone';

const Simulador = () => {
  const [procesoActual, setProcesoActual] = useState(null); // Cambiar a un único proceso actual
  const [network, setNetwork] = useState(null);
  const [nuevoPid, setNuevoPid] = useState(null); // Definir nuevoPid y setNuevoPid

  useEffect(() => {
    if (network === null) {
      const container = document.getElementById('network');
      const options = {
        nodes: {
          shape: 'box',
        },
        edges: {
          smooth: false,
        },
      };
      const newNetwork = new Network(container, {}, options);
      setNetwork(newNetwork);
    } else {
      actualizarNetwork();
    }
  }, [procesoActual]); // Cambiar a procesoActual

  const crearProceso = () => {
    const nuevoId = Math.floor(10000 + Math.random() * 90000); // Generar número aleatorio de 5 dígitos
    const nuevoProceso = {
      id: nuevoId.toString(), // Convertir a cadena de texto
      estado: 'NEW',
    };
    setProcesoActual(nuevoProceso); // Cambiar el proceso actual
    return nuevoId.toString(); // Devolver el nuevo ID generado
  };

  const actualizarNetwork = () => {
    if (procesoActual) {
      const nodes = new DataSet([{ id: procesoActual.id, label: procesoActual.estado }]);
      const edges = new DataSet([]);
      network.setData({ nodes, edges });
    }
  };

  return (
    <div>
      <Navbar />
      <h1 className="centered-h1">Simulador de procesos</h1>
      <div id="network"></div>
      <div className="containerButtons">
        <button className="btn btn-success" onClick={() => {
          const nuevoId = crearProceso();
          setNuevoPid(nuevoId); // Guardar el nuevo PID en el estado
        }}>Crear Proceso</button>
      </div>
      {nuevoPid && <div>PID: {nuevoPid}</div>} {/* Mostrar el PID solo si existe */}
    </div>
  );
};

export default Simulador;
