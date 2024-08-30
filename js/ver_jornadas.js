document.addEventListener('DOMContentLoaded', () => {
    // Cargar las jornadas cuando la página se carga
    loadJornadas();
});

function loadJornadas() {
    fetch('/get-jornadas')  // Necesitamos una nueva ruta para obtener las jornadas
        .then(response => response.json())
        .then(data => {
            const jornadaSelect = document.getElementById('jornadaSelect');
            const partidosJornadaList = document.getElementById('partidosJornadaList');

            // Limpiar select y lista de partidos
            jornadaSelect.innerHTML = '';
            partidosJornadaList.innerHTML = '';

            data.forEach((jornada, index) => {
                const option = document.createElement('option');
                option.value = index;
                option.textContent = jornada[0];  // Nombre de la jornada
                jornadaSelect.appendChild(option);
            });

            // Mostrar partidos de la primera jornada por defecto
            if (data.length > 0) {
                mostrarPartidosDeJornada(data[0][1]);  // Partidos de la primera jornada
            }

            jornadaSelect.addEventListener('change', () => {
                const selectedIndex = jornadaSelect.selectedIndex;
                if (selectedIndex >= 0) {
                    mostrarPartidosDeJornada(data[selectedIndex][1]);  // Actualizar partidos mostrados
                }
            });
        })
        .catch(error => console.error('Error al cargar las jornadas:', error));
}

function mostrarPartidosDeJornada(partidos) {
    const partidosJornadaList = document.getElementById('partidosJornadaList');
    partidosJornadaList.innerHTML = '';  // Limpiar la lista de partidos

    partidos.forEach(partido => {
        const li = document.createElement('li');
        li.textContent = `${partido.equipo1} vs ${partido.equipo2}` + (partido.comodin ? ' (Comodín)' : '');
        partidosJornadaList.appendChild(li);
    });
}
