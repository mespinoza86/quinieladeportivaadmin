document.addEventListener('DOMContentLoaded', () => {
    const jornadaSeleccionada = localStorage.getItem('jornadaSeleccionada');
    if (jornadaSeleccionada !== null) {
        loadPartidos(jornadaSeleccionada);
    }

    const copiarTextoButton = document.getElementById('copiarTextoButton');
    copiarTextoButton.addEventListener('click', copiarResultados);
});

function loadPartidos(index) {
    fetch('/get-jornadas')
        .then(response => response.json())
        .then(data => {
            const jornada = data[index];
            const partidos = jornada[1]; // Partidos de la jornada seleccionada
            mostrarPartidos(partidos);
        })
        .catch(error => console.error('Error al cargar los partidos:', error));
}

function mostrarPartidos(partidos) {
    const partidosContainer = document.getElementById('partidosContainer');
    partidosContainer.innerHTML = ''; 

    partidos.forEach((partido, i) => {
        const partidoDiv = document.createElement('div');
        partidoDiv.classList.add('partido-container');

        partidoDiv.innerHTML = `
            <label>${partido.equipo1}</label>
            <input type="text" id="resultadoEquipo1_${i}">
            <label>vs</label>
            <input type="text" id="resultadoEquipo2_${i}">
            <label>${partido.equipo2}</label>
        `;
        partidosContainer.appendChild(partidoDiv);
    });
}

function copiarResultados() {
    const nombreJugador = document.getElementById('nombreJugador').value.trim();
    const partidosContainer = document.getElementById('partidosContainer');
    let textoResultado = '';

    // Agregar el nombre del jugador al principio del texto
    textoResultado += `-------------------------------\n`;
    if (nombreJugador) {
        textoResultado += `Nombre: ${nombreJugador}\n`;
    } else {
        textoResultado += `Nombre: [Sin nombre]\n\n`; // En caso de que no se ingrese nombre
    }

    // Recorrer los partidos y agregar el formato correspondiente
    Array.from(partidosContainer.children).forEach((partidoDiv, index) => {
        const equipo1 = partidoDiv.children[0].textContent;
        const resultado1 = document.getElementById(`resultadoEquipo1_${index}`).value || '0';
        const equipo2 = partidoDiv.children[4].textContent;
        const resultado2 = document.getElementById(`resultadoEquipo2_${index}`).value || '0';

        textoResultado += `-------------------------------\n|${resultado1}| ${equipo1} vs ${equipo2} |${resultado2}|\n`;
    });

    textoResultado += `-------------------------------\n`;
    // Copiar al portapapeles
    navigator.clipboard.writeText(textoResultado).then(() => {
        alert('Texto copiado al portapapeles');
    }).catch(err => {
        console.error('Error al copiar el texto:', err);
    });
}
