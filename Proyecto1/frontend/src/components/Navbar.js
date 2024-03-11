// Navbar.js
import React from 'react';
import { Link } from 'react-router-dom';
function Navbar() {
  return (

<nav class="navbar navbar-expand-lg navbar-light bg-light">
  <div class="container-fluid">

    <div class="collapse navbar-collapse" id="navbarSupportedContent">
      <ul class="navbar-nav me-auto mb-2 mb-lg-0">
        <li class="nav-item">
          <a class="nav-link active" aria-current="page" href="/">Pagina principal</a>
        </li>
        <li class="nav-item">
          <a class="nav-link active" aria-current="page" href="/histograma">Histograma</a>
        </li>
        <li class="nav-item">
          <a class="nav-link active" aria-current="page" href="/arbol">Arbol de procesos</a>
        </li>
        <li class="nav-item">
          <a class="nav-link active" aria-current="page" href="/simulador">Simulador</a>
        </li>
      </ul>

    </div>
  </div>
</nav>
  );
}

export default Navbar;