document.addEventListener('DOMContentLoaded', () => {
    const jugadorSelect = document.getElementById('jugadorSelect');
    const jornadaSelect = document.getElementById('jornadaSelect');
    const addResultadosButton = document.getElementById('addResultadosButton');
    const partidosContainer = document.getElementById('partidosContainer');
    const saveResultadosButton = document.getElementById('saveResultadosButton');

    let partidos = [];

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

    function loadResultadosPrevios(jugador, jornada) {
        fetch(`/api/resultados/${jugador}/${jornada}`)
            .then(response => response.json())
            .then(data => {
                if (Array.isArray(data)) {
                    partidosContainer.innerHTML = '';
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
                    partidosContainer.innerHTML = '';
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

    addResultadosButton.addEventListener('click', () => {
        const jugador = jugadorSelect.value;
        const jornada = jornadaSelect.value;

        if (jornada) {
            fetch(`/api/jornadas`)
                .then(response => response.json())
                .then(data => {
                    const partidosData = data.find(([nombre]) => nombre === jornada)[1];
                    partidos = partidosData;

                    loadResultadosPrevios(jugador, jornada);
                });
        }
    });

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


/*document.addEventListener('DOMContentLoaded', () => {
    const jugadorSelect = document.getElementById('jugadorSelect');
    const jornadaSelect = document.getElementById('jornadaSelect');
    const addResultadosButton = document.getElementById('addResultadosButton');
    const partidosContainer = document.getElementById('partidosContainer');
    const saveResultadosButton = document.getElementById('saveResultadosButton');

    let partidos = [];

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

    addResultadosButton.addEventListener('click', () => {
        const jornada = jornadaSelect.value;

        if (jornada) {
            fetch(`/api/jornadas`)
                .then(response => response.json())
                .then(data => {
                    const partidosData = data.find(([nombre]) => nombre === jornada)[1];
                    partidosContainer.innerHTML = '';
                    partidosData.forEach((partido, index) => {
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
                    partidos = partidosData;
                });
        }
    });

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
});*/