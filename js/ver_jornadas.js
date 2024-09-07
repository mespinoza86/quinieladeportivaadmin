document.addEventListener('DOMContentLoaded', () => {
    // Cargar las jornadas cuando la página se carga
    loadJornadas();

    // Botón de llenar jornada
    const llenarJornadaButton = document.getElementById('llenarJornadaButton');
    llenarJornadaButton.addEventListener('click', () => {
        const jornadaSelect = document.getElementById('jornadaSelect');
        const selectedIndex = jornadaSelect.selectedIndex;
        if (selectedIndex >= 0) {
            const jornadaSeleccionada = jornadaSelect.value;
            localStorage.setItem('jornadaSeleccionada', jornadaSeleccionada); // Guardamos la jornada seleccionada
            window.location.href = 'llenar_jornada.html';
        }
    });
});

function loadJornadas() {
    fetch('/get-jornadas') 
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
                option.textContent = jornada[0]; 
                jornadaSelect.appendChild(option);
            });

            // Mostrar partidos de la primera jornada por defecto
            if (data.length > 0) {
                mostrarPartidosDeJornada(data[0][1]);
            }

            jornadaSelect.addEventListener('change', () => {
                const selectedIndex = jornadaSelect.selectedIndex;
                if (selectedIndex >= 0) {
                    mostrarPartidosDeJornada(data[selectedIndex][1]);
                }
            });
        })
        .catch(error => console.error('Error al cargar las jornadas:', error));
}

function mostrarPartidosDeJornada(partidos) {
    const partidosJornadaList = document.getElementById('partidosJornadaList');
    partidosJornadaList.innerHTML = ''; 

    partidos.forEach(partido => {
        const li = document.createElement('li');
        li.textContent = `${partido.equipo1} vs ${partido.equipo2}` + (partido.comodin ? ' (Comodín)' : '');
        partidosJornadaList.appendChild(li);
    });
}
