document.addEventListener('DOMContentLoaded', () => {
    const equipo1Input = document.getElementById('equipo1Input');
    const equipo2Input = document.getElementById('equipo2Input');
    const comodinCheckbox = document.getElementById('comodinCheckbox');
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
    const modificarComodinCheckbox = document.getElementById('modificarComodinSelect');

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
                        
                        // Línea 1: Checkbox para modificar el estado de comodín
                        const comodinCheckbox = document.createElement('input');
                        comodinCheckbox.type = 'checkbox';
                        comodinCheckbox.id = `comodinCheckbox_${index}`;
                        comodinCheckbox.dataset.index = index;
                        comodinCheckbox.checked = partido.comodin;
                        const comodinLabel = document.createElement('label');
                        comodinLabel.textContent = partido.comodin ? 'Quitar de comodín' : 'Agregar como comodín';
                        comodinLabel.htmlFor = `comodinCheckbox_${index}`;
                        comodinCheckbox.addEventListener('change', handleComodinChange);

                        const comodinLine = document.createElement('div');
                        comodinLine.appendChild(comodinCheckbox);
                        comodinLine.appendChild(comodinLabel);
                        
                        li.appendChild(comodinLine);

                        // Línea 2: Partido
                        const partidoLine = document.createElement('div');
                        partidoLine.textContent = `${partido.equipo1} vs ${partido.equipo2}`;
                        if (partido.comodin) {
                            partidoLine.textContent += ' (Comodín)';
                        }
                        li.appendChild(partidoLine);

                        // Línea 3: Checkbox para eliminar el partido
                        const eliminarCheckbox = document.createElement('input');
                        eliminarCheckbox.type = 'checkbox';
                        eliminarCheckbox.id = `eliminarCheckbox_${index}`;
                        eliminarCheckbox.dataset.index = index;
                        const eliminarLabel = document.createElement('label');
                        eliminarLabel.textContent = 'Selecciona para eliminar';
                        eliminarLabel.htmlFor = `eliminarCheckbox_${index}`;

                        const eliminarLine = document.createElement('div');
                        eliminarLine.appendChild(eliminarCheckbox);
                        eliminarLine.appendChild(eliminarLabel);
                        
                        li.appendChild(eliminarLine);

                        partidosModificarList.appendChild(li);
                    });
                });
        }
    }

    function handleComodinChange(event) {
        const index = event.target.dataset.index;
        const isChecked = event.target.checked;

        const message = isChecked ? 
            '¿Está seguro que quiere mover este partido a comodín?' :
            '¿Está seguro que quiere cambiar este partido a que no sea comodín?';

        if (confirm(message)) {
            const selectedJornada = modificarJornadaSelect.value;
            fetch(`/api/jornadas/${selectedJornada}`)
                .then(response => response.json())
                .then(partidos => {
                    partidos[index].comodin = isChecked;
                    fetch('/api/jornadas', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ nombre: selectedJornada, partidos: partidos })
                    })
                    .then(() => {
                        updateJornadaPartidos();
                        updateModificarJornadaPartidos();
                    });
                });
        } else {
            event.target.checked = !isChecked; // Revertir el checkbox si no se confirma
        }
    }

    addPartidoButton.addEventListener('click', () => {
        const equipo1 = equipo1Input.value.trim();
        const equipo2 = equipo2Input.value.trim();
        const comodin = comodinCheckbox.checked;

        if (equipo1 && equipo2) {
            currentPartidos.push({ equipo1, equipo2, comodin });
            updatePartidosList();
            equipo1Input.value = '';
            equipo2Input.value = '';
            comodinCheckbox.checked = false;
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
            alert('No hay partidos para agregar a la jornada.');
        }
    });

    jornadaSelect.addEventListener('change', updateJornadaPartidos);
    modificarJornadaSelect.addEventListener('change', () => {
        jornadaActualParaModificar = modificarJornadaSelect.value;
        modificarJornadaControls.style.display = jornadaActualParaModificar ? 'block' : 'none';
        updateModificarJornadaPartidos();
    });

    agregarPartidoButton.addEventListener('click', () => {
        const equipo1 = modificarEquipo1Input.value.trim();
        const equipo2 = modificarEquipo2Input.value.trim();
        const comodin = modificarComodinCheckbox.checked;

        if (equipo1 && equipo2 && jornadaActualParaModificar) {
            fetch(`/api/jornadas/${jornadaActualParaModificar}`)
                .then(response => response.json())
                .then(partidos => {
                    partidos.push({ equipo1, equipo2, comodin });
                    fetch('/api/jornadas', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ nombre: jornadaActualParaModificar, partidos: partidos })
                    })
                    .then(() => {
                        updateJornadaPartidos();
                        updateModificarJornadaPartidos();
                        modificarEquipo1Input.value = '';
                        modificarEquipo2Input.value = '';
                        modificarComodinCheckbox.checked = false;
                    });
                });
        }
    });

    eliminarPartidosButton.addEventListener('click', () => {
        const selectedIndices = Array.from(document.querySelectorAll('#partidosModificarList input[type="checkbox"]:checked'))
                                    .map(cb => cb.dataset.index);

        if (selectedIndices.length > 0 && jornadaActualParaModificar) {
            fetch(`/api/jornadas/${jornadaActualParaModificar}`)
                .then(response => response.json())
                .then(partidos => {
                    const updatedPartidos = partidos.filter((_, index) => !selectedIndices.includes(index.toString()));
                    fetch('/api/jornadas', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ nombre: jornadaActualParaModificar, partidos: updatedPartidos })
                    })
                    .then(() => {
                        updateJornadaPartidos();
                        updateModificarJornadaPartidos();
                    });
                });
        }
    });

    loadJornadas();
});
