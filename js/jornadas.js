document.addEventListener('DOMContentLoaded', () => {
    const equipo1Input = document.getElementById('equipo1Input');
    const equipo2Input = document.getElementById('equipo2Input');
    const comodinCheckbox = document.getElementById('comodinCheckbox'); // Nuevo checkbox para comodín
    const addPartidoButton = document.getElementById('addPartidoButton');
    const finalizarJornadaButton = document.getElementById('finalizarJornadaButton');
    const jornadaSelect = document.getElementById('jornadaSelect');
    const partidosJornadaList = document.getElementById('partidosJornadaList');
    const modificarJornadaSelect = document.getElementById('modificarJornadaSelect');
    const partidosModificarList = document.getElementById('partidosModificarList');
    const eliminarPartidosButton = document.getElementById('eliminarPartidosButton');
    const modificarJornadaControls = document.getElementById('modificarJornadaControls');
    const modificarEquipo1Input = document.getElementById('modificarEquipo1Input');
    const modificarEquipo2Input = document.getElementById('modificarEquipo2Input');
    const agregarPartidoButton = document.getElementById('agregarPartidoButton');

    let currentPartidos = [];
    let jornadas = new Map();
    let jornadaActualParaModificar = '';

    function loadJornadas() {
        fetch('/api/jornadas')
            .then(response => response.json())
            .then(data => {
                jornadas = new Map(data);
                updateJornadaSelect();
                updateJornadaPartidos();
            });
    }

    function updatePartidosList() {
        const ul = document.getElementById('partidosList');
        ul.innerHTML = '';
        currentPartidos.forEach(partido => {
            const li = document.createElement('li');
            li.textContent = `${partido.equipo1} vs ${partido.equipo2}`;
            if (partido.comodin) {
                li.textContent += ' (Comodín)';
            }
            ul.appendChild(li);
        });
    }

    function updateJornadaSelect() {
        jornadaSelect.innerHTML = '<option value="">Selecciona una jornada</option>';
        modificarJornadaSelect.innerHTML = '<option value="">Selecciona una jornada</option>';
        jornadas.forEach((_, key) => {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = key;
            jornadaSelect.appendChild(option);

            const optionCopy = option.cloneNode(true);
            modificarJornadaSelect.appendChild(optionCopy);
        });
    }

    function updateJornadaPartidos() {
        const selectedJornada = jornadaSelect.value;
        if (selectedJornada) {
            fetch(`/api/jornadas/${selectedJornada}`)
                .then(response => response.json())
                .then(partidos => {
                    partidosJornadaList.innerHTML = '';
                    partidos.forEach(partido => {
                        const li = document.createElement('li');
                        li.textContent = `${partido.equipo1} vs ${partido.equipo2}`;
                        if (partido.comodin) {
                            li.textContent += ' (Comodín)';
                        }
                        partidosJornadaList.appendChild(li);
                    });
                });
        }
    }

    function updateModificarJornadaPartidos() {
        const selectedJornada = modificarJornadaSelect.value;
        if (selectedJornada) {
            fetch(`/api/jornadas/${selectedJornada}`)
                .then(response => response.json())
                .then(partidos => {
                    partidosModificarList.innerHTML = '';
                    partidos.forEach((partido, index) => {
                        const li = document.createElement('li');
                        const checkbox = document.createElement('input');
                        checkbox.type = 'checkbox';
                        checkbox.value = index;
                        li.appendChild(checkbox);
                        li.appendChild(document.createTextNode(`${partido.equipo1} vs ${partido.equipo2}`));
                        if (partido.comodin) {
                            li.appendChild(document.createTextNode(' (Comodín)'));
                        }
                        partidosModificarList.appendChild(li);
                    });
                });
        }
    }

    addPartidoButton.addEventListener('click', () => {
        const equipo1 = equipo1Input.value.trim();
        const equipo2 = equipo2Input.value.trim();
        const comodin = comodinCheckbox.checked; // Capturamos si es comodín

        if (equipo1 && equipo2) {
            currentPartidos.push({ equipo1, equipo2, comodin });
            updatePartidosList();
            equipo1Input.value = '';
            equipo2Input.value = '';
            comodinCheckbox.checked = false; // Reseteamos el checkbox
        }
    });

    finalizarJornadaButton.addEventListener('click', () => {
        if (currentPartidos.length > 0) {
            const nombreJornada = prompt('Ingrese el nombre de la jornada:');
            if (nombreJornada && !jornadas.has(nombreJornada)) {
                jornadas.set(nombreJornada, [...currentPartidos]);
                fetch('/api/jornadas', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nombre: nombreJornada, partidos: currentPartidos })
                })
                .then(() => {
                    currentPartidos = [];
                    updatePartidosList();
                    loadJornadas();
                });
            }
        } else {
            alert('Debe agregar al menos un partido antes de finalizar la jornada.');
        }
    });

    jornadaSelect.addEventListener('change', () => {
        updateJornadaPartidos();
    });

    modificarJornadaSelect.addEventListener('change', () => {
        const selectedJornada = modificarJornadaSelect.value;
        partidosModificarList.innerHTML = '';
        modificarJornadaControls.style.display = 'block';
        if (selectedJornada) {
            jornadaActualParaModificar = selectedJornada;
            updateModificarJornadaPartidos();
        } else {
            jornadaActualParaModificar = '';
            modificarJornadaControls.style.display = 'none';
        }
    });


    agregarPartidoButton.addEventListener('click', () => {
        if (jornadaActualParaModificar) {
            const equipo1 = modificarEquipo1Input.value.trim();
            const equipo2 = modificarEquipo2Input.value.trim();
            const comodin = modificarComodinSelect.checked; // Capturamos si es comodín

            if (equipo1 && equipo2) {
                const confirmacion = confirm(`¿Está seguro que quiere agregar el partido ${equipo1} vs ${equipo2} a la jornada?`);
                if (confirmacion) {
                    fetch('/api/jornadas/agregar-partido', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            jornada: jornadaActualParaModificar,
                            partido: { equipo1, equipo2, comodin }
                        })
                    })
                    .then(() => {
                        modificarEquipo1Input.value = '';
                        modificarEquipo2Input.value = '';
                        modificarComodinSelect.checked = false; // Reseteamos el checkbox
                        alert('El partido se agregó correctamente.');
                        updateJornadaPartidos();
                        updateModificarJornadaPartidos();
                        jornadaSelect.dispatchEvent(new Event('change'));
                    });
                }
            }
        } else {
            alert('Seleccione una jornada para modificar.');
        }
    });

    eliminarPartidosButton.addEventListener('click', () => {
        const selectedJornada = modificarJornadaSelect.value;
        if (selectedJornada) {
            fetch(`/api/jornadas/${selectedJornada}`)
                .then(response => response.json())
                .then(partidos => {
                    const checkboxes = partidosModificarList.querySelectorAll('input[type="checkbox"]:checked');
                    const indicesToRemove = Array.from(checkboxes).map(cb => parseInt(cb.value));
    
                    if (indicesToRemove.length > 0) {
                        const partidosAEliminar = indicesToRemove.map(index => `${partidos[index].equipo1} vs ${partidos[index].equipo2}`).join('\n');
                        const confirmacion = confirm(`Está seguro que quiere eliminar los siguientes partidos:\n\n${partidosAEliminar}`);
                        if (confirmacion) {
                            fetch('/api/jornadas/eliminar-partidos', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    jornada: selectedJornada,
                                    indices: indicesToRemove
                                })
                            })
                            .then(() => {
                                alert('Los partidos se eliminaron correctamente.');
                                updateModificarJornadaPartidos();
                                jornadaSelect.dispatchEvent(new Event('change'));
                            });
                        }
                    } else {
                        alert('Debe seleccionar al menos un partido para eliminar.');
                    }
                });
        } else {
            alert('Seleccione una jornada para eliminar partidos.');
        }
    });

    loadJornadas();
});
