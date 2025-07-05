document.addEventListener('DOMContentLoaded', () => {
    const jugadorSelect = document.getElementById('jugadorSelect');
    const jornadaSelect = document.getElementById('jornadaSelect');
    const addResultadosButton = document.getElementById('addResultadosButton');
    const pegarResultadosButton = document.getElementById('pegarResultadosButton');
    const partidosContainer = document.getElementById('partidosContainer');
    const saveResultadosButton = document.getElementById('saveResultadosButton');

    let partidos = [];

    // Función para cargar los jugadores desde la API
    function loadJugadores() {
        fetch('/api/jugadores')
            .then(response => response.json())
            .then(jugadores => {
                jugadores.forEach(jugador => {
                    const option = document.createElement('option');
                    option.value = jugador;
                    option.textContent = jugador;
                    jugadorSelect.appendChild(option);
                });
            });
    }

    // Función para cargar las jornadas desde la API
    function loadJornadas() {
        fetch('/api/jornadas')
            .then(response => response.json())
            .then(data => {
                data.forEach(([nombre]) => {
                    const option = document.createElement('option');
                    option.value = nombre;
                    option.textContent = nombre;
                    jornadaSelect.appendChild(option);
                });
            });
    }

    // Función para cargar los resultados previos de un jugador en una jornada
    function loadResultadosPrevios(jugador, jornada) {
        fetch(`/api/resultados/${jugador}/${jornada}`)
            .then(response => response.json())
            .then(data => {
                partidosContainer.innerHTML = ''; // Limpiar el contenedor de partidos
                if (Array.isArray(data)) {
                    // Si hay resultados previos, mostrarlos
                    data.forEach((partido, index) => {
                        const partidoDiv = document.createElement('div');
                        partidoDiv.classList.add('partido');
                        partidoDiv.innerHTML = `
                            <div style="display: flex; align-items: center;">
                                ${partido.equipo1} 
                                <input type="text" id="resultado${index}_1" placeholder="Marcador" style="margin-left: 10px; margin-right: 10px;" value="${partido.marcador1}">
                                vs 
                                <input type="text" id="resultado${index}_2" placeholder="Marcador" style="margin-left: 10px; margin-right: 10px;" value="${partido.marcador2}">
                                ${partido.equipo2}
                            </div>
                        `;
                        partidosContainer.appendChild(partidoDiv);
                    });
                } else {
                    // Si no hay resultados previos, cargar los partidos de la jornada
                    partidos.forEach((partido, index) => {
                        const partidoDiv = document.createElement('div');
                        partidoDiv.classList.add('partido');
                        partidoDiv.innerHTML = `
                            <div style="display: flex; align-items: center;">
                                ${partido.equipo1} 
                                <input type="text" id="resultado${index}_1" placeholder="Marcador" style="margin-left: 10px; margin-right: 10px;">
                                vs 
                                <input type="text" id="resultado${index}_2" placeholder="Marcador" style="margin-left: 10px; margin-right: 10px;">
                                ${partido.equipo2}
                            </div>
                        `;
                        partidosContainer.appendChild(partidoDiv);
                    });
                }
            });
    }

    // Función para cargar los partidos de una jornada
    function cargarPartidos(jugador, jornada) {
        fetch(`/api/jornadas`)
            .then(response => response.json())
            .then(data => {
                const partidosData = data.find(([nombre]) => nombre === jornada)[1];
                partidos = partidosData; // Guardar partidos para referencia futura
                loadResultadosPrevios(jugador, jornada);
            });
    }

    // Evento al hacer clic en "Añadir Resultados"
    addResultadosButton.addEventListener('click', () => {
        const jugador = jugadorSelect.value;
        const jornada = jornadaSelect.value;

        if (jornada) {
            cargarPartidos(jugador, jornada);
        }
    });

    // Evento al hacer clic en "Pegar Resultados"

    pegarResultadosButton.addEventListener('click', async () => {
        try {
            const text = await navigator.clipboard.readText();
            const resultados = processClipboardResults(text); // Procesar el texto del portapapeles
            updateScoreInputs(resultados); // Actualizar los cuadros de texto con los resultados
        } catch (err) {
            console.error('Error al acceder al portapapeles: ', err);
        }
    });


// Función para normalizar nombres de equipos (quita acentos, pasa a minúsculas, elimina símbolos, y elimina espacios)
function normalizeTeamName(name) {
    return name
        .normalize('NFD') // Descompone caracteres con acentos
        .replace(/[\u0300-\u036f]/g, '') // Elimina los acentos
        .replace(/[^a-zA-Z0-9\s]/g, '') // Elimina caracteres especiales y emojis
        .toLowerCase()
        .trim()
        .replace(/\s+/g, ' '); // Elimina espacios adicionales
}
  
// Función para procesar los resultados del portapapeles
function processClipboardResults(text) {
    const lines = text.split('\n');
    const resultados = {};

    // Parsear resultados del texto
    lines.forEach(line => {
        //const match = line.match(/(?:\d+\.\s+)?(.+?)\s+(\d+)\s*$/);            
      //const match = line.match(/(?:\d+\.\s+)?\*?\s*(.+?)\s*\*?\s+(\d+)\s*$/);
      const match = line.match(/^(?:\d+\.\s+)?\**\s*(.*?)\s*\**\s+(\d+)\s*\**:?$/);

      

        
        if (match) {            
            const equipo = normalizeTeamName(match[1]); // Normalizar nombre de equipo
            const marcador = match[2].trim();
            resultados[equipo] = marcador; // Guardar el marcador por nombre de equipo normalizado
        }
    });

    return resultados; // Retornar los resultados
}

// Función para actualizar los cuadros de texto con los resultados procesados
function updateScoreInputs(resultados) {
    partidosContainer.querySelectorAll('.partido').forEach((div, index) => {
        const partido = partidos[index]; // Obtener el partido actual

        // Normalizar nombres de equipos en la jornada
        const equipo1 = normalizeTeamName(partido.equipo1);
        const equipo2 = normalizeTeamName(partido.equipo2);

        const input1 = div.querySelector(`#resultado${index}_1`);
        const input2 = div.querySelector(`#resultado${index}_2`);

        // Debugging: Muestra los nombres de los equipos y sus resultados
        console.log(`Actualizando resultados para: ${equipo1} y ${equipo2}`);
        console.log(`Marcador en resultados: ${JSON.stringify(resultados)}`);

        // Actualiza los cuadros de texto con los nuevos valores si hay resultados disponibles
        if (resultados[equipo1] !== undefined) {
            input1.value = resultados[equipo1]; // Asignar el marcador del equipo 1
        } else {
            console.log(`No se encontró marcador para ${equipo1}`);
        }

        if (resultados[equipo2] !== undefined) {
            input2.value = resultados[equipo2]; // Asignar el marcador del equipo 2
        } else {
            console.log(`No se encontró marcador para ${equipo2}`);
        }
    });
}

    // Evento al hacer clic en "Guardar Resultados"
    saveResultadosButton.addEventListener('click', () => {
        const jugador = jugadorSelect.value;
        const jornada = jornadaSelect.value;
        const pronosticos = [];

        partidosContainer.querySelectorAll('.partido').forEach((div, index) => {
            const input1 = div.querySelector(`#resultado${index}_1`);
            const input2 = div.querySelector(`#resultado${index}_2`);
            pronosticos.push({
                equipo1: partidos[index].equipo1,
                marcador1: input1.value,
                equipo2: partidos[index].equipo2,
                marcador2: input2.value
            });
        });

        fetch('/api/resultados', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ jugador, jornada, pronosticos })
        })
        .then(response => response.json())
        .then(() => {
            alert('Resultados guardados correctamente.');
        });
    });

    loadJugadores();
    loadJornadas();
});

