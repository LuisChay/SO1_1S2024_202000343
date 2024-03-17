// App.js
import React from 'react';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Home from './components/tiemporeal';
import Historico from './components/historico';
import Route2 from './components/arbol';
import Simulador from './components/simulador';
import Diagrama from './components/diagrama';


function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/histograma' element={<Historico/>}/>
        <Route path='/arbol' element={<Route2/>}/>
        <Route path='/simulador' element={<Simulador/>}/>
        <Route path='/diagrama' element={<Diagrama/>}/>
      </Routes>
    </Router>
  );
}

export default App;
