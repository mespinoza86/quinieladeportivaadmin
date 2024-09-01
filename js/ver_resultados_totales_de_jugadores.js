document.addEventListener("DOMContentLoaded", async function() {
    try {
        // Cargar datos JSON de los archivos resultados.json y resultados-oficiales.json
        const resultadosResponse = await fetch('/resultados.json');
        const resultadosData = await resultadosResponse.json();

        const oficialesResponse = await fetch('/resultados-oficiales.json');
        const oficialesData = await oficialesResponse.json();

        // Rellenar el combobox de jornadas
        const jornadas = [...new Set(resultadosData.map(jugador => jugador[0].split('_')[1]))]; // Extrae las jornadas únicas
        const jornadaSelect = document.getElementById('jornada-select');

        jornadas.forEach(jornada => {
            const option = document.createElement('option');
            option.value = jornada;
            option.textContent = jornada;
            jornadaSelect.appendChild(option);
        });

        // Manejar el evento de clic en el botón "Ver Resultados"
        document.getElementById('ver-resultados-btn').addEventListener('click', function() {
            const selectedJornada = jornadaSelect.value;
            mostrarResultados(selectedJornada, resultadosData, oficialesData);
        });

        // Manejar el evento de clic en el botón "Volver al Inicio" (arriba)
        document.getElementById('volver-btn-top').addEventListener('click', function() {
            window.location.href = '/index.html'; // Asumiendo que index.html está en el root
        });

        // Manejar el evento de clic en el botón "Volver al Inicio" (abajo)
        document.getElementById('volver-btn-bottom').addEventListener('click', function() {
            window.location.href = '/index.html'; // Asumiendo que index.html está en el root
        });

    } catch (error) {
        console.error("Error al cargar los datos:", error);
    }
});

function mostrarResultados(jornada, resultadosData, oficialesData) {
    // Obtener referencia al cuerpo de la tabla
    const tablaCuerpo = document.querySelector('#tabla-resultados tbody');
    tablaCuerpo.innerHTML = ''; // Limpiar cualquier dato existente

    // Filtrar resultados por la jornada seleccionada
    const resultadosJornada = resultadosData.filter(jugador => jugador[0].includes(jornada));

    // Crear un mapa para agrupar los resultados por partido
    const partidosMap = new Map();

    // Agrupar resultados pronosticados por partido
    resultadosJornada.forEach((jugadorResultados) => {
        const nombreJugador = jugadorResultados[0].split('_')[0];
        const jornadaResultados = jugadorResultados[1];

        jornadaResultados.forEach((partido) => {
            const partidoClave = `${partido.equipo1} vs ${partido.equipo2}`;
            if (!partidosMap.has(partidoClave)) {
                partidosMap.set(partidoClave, { jugadores: [], partido });
            }
            partidosMap.get(partidoClave).jugadores.push({ nombreJugador, partido });
        });
    });

    // Mostrar los resultados en la tabla
    partidosMap.forEach((data, partido) => {
        // Buscar el resultado oficial correspondiente
        const resultadoOficialJornada = oficialesData.find(oficial => oficial[0] === jornada);
        let resultadoOficial = "";
        if (resultadoOficialJornada) {
            const partidoOficial = resultadoOficialJornada[1].find(p => `${p.equipo1} vs ${p.equipo2}` === partido);
            if (partidoOficial) {
                resultadoOficial = `${partidoOficial.equipo1} ${partidoOficial.marcador1} - ${partidoOficial.equipo2} ${partidoOficial.marcador2}`;
            }
        }

        // Mostrar los resultados pronosticados por cada jugador
        data.jugadores.forEach((jugador, index) => {
            // Crear una nueva fila en la tabla
            const fila = document.createElement('tr');

            // Celda del nombre del jugador
            const celdaJugador = document.createElement('td');
            celdaJugador.textContent = jugador.nombreJugador;
            fila.appendChild(celdaJugador);

            // Celda con los resultados pronosticados
            const celdaPronosticado = document.createElement('td');
            celdaPronosticado.textContent = `${jugador.partido.equipo1} ${jugador.partido.marcador1} - ${jugador.partido.equipo2} ${jugador.partido.marcador2}`;
            fila.appendChild(celdaPronosticado);

            // Celda con los resultados oficiales
            const celdaOficial = document.createElement('td');
            celdaOficial.textContent = (index === 0) ? resultadoOficial : ""; // Mostrar el resultado oficial solo en la primera fila
            fila.appendChild(celdaOficial);

            // Celda con los puntos obtenidos
            const celdaPuntos = document.createElement('td');
            const puntosObtenidos = calcularPuntos(jugador.partido, resultadoOficialJornada, partido);
            celdaPuntos.textContent = puntosObtenidos;
            fila.appendChild(celdaPuntos);

            // Añadir la fila a la tabla
            tablaCuerpo.appendChild(fila);
        });

        // Mostrar el botón "Volver al Inicio" después de la tabla
        const botonVolverBottom = document.getElementById('volver-btn-bottom');
        botonVolverBottom.style.display = 'block'; // Mostrar el botón al final de la tabla
    });

    // Mostrar el botón "Volver al Inicio" en la parte superior (si estaba oculto)
    const botonVolverTop = document.getElementById('volver-btn-top');
    botonVolverTop.style.display = 'block';
}

// Función para calcular puntos basándose en las reglas proporcionadas
function calcularPuntos(partidoPronosticado, resultadoOficialJornada, partido) {
    let puntos = 0;

    if (!resultadoOficialJornada) {
        return puntos; // No hay resultado oficial, no se asignan puntos
    }

    const partidoOficial = resultadoOficialJornada[1].find(p => `${p.equipo1} vs ${p.equipo2}` === partido);

    if (partidoOficial) {
        const marcador1Pronosticado = parseInt(partidoPronosticado.marcador1, 10);
        const marcador2Pronosticado = parseInt(partidoPronosticado.marcador2, 10);
        const marcador1Oficial = parseInt(partidoOficial.marcador1, 10);
        const marcador2Oficial = parseInt(partidoOficial.marcador2, 10);
        const comodin = partidoOficial.comodin || false;
        const esComodin = comodin;



        if (!isNaN(marcador1Pronosticado) && !isNaN(marcador2Pronosticado) &&
            !isNaN(marcador1Oficial) && !isNaN(marcador2Oficial)) {

            if (marcador1Pronosticado === marcador1Oficial && marcador2Pronosticado === marcador2Oficial) {
                puntos += 5;
                if (esComodin) {
                    puntos += 2;       
                }
            } else if ((marcador1Pronosticado > marcador2Pronosticado && marcador1Oficial > marcador2Oficial) ||
                       (marcador1Pronosticado < marcador2Pronosticado && marcador1Oficial < marcador2Oficial) ||
                       (marcador1Pronosticado === marcador2Pronosticado && marcador1Oficial === marcador2Oficial)) {
                puntos += 3;                
                if (esComodin) {
                    puntos += 2;       
                }

            }
        }
    }

    return puntos;
}
