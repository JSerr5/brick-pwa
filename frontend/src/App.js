import React, { useEffect, useState } from 'react';

function App() {
  const [tecnicos, setTecnicos] = useState([]);

  useEffect(() => {
    fetch('http://localhost:4000/api/tecnicos')
      .then(response => response.json())
      .then(data => setTecnicos(data))
      .catch(error => console.error('Error al obtener técnicos:', error));
  }, []);

  return (
    <div>
      <h1>Lista de Técnicos</h1>
      <ul>
        {tecnicos.map((tecnico) => (
          <li key={tecnico.id_tecnico}>
            {tecnico.nombre} - {tecnico.ciudad}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
