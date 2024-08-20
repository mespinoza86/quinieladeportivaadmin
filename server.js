const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static(__dirname));  // Sirve archivos estáticos desde el mismo directorio

// Rutas para servir los archivos HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/jugadores', (req, res) => {
    res.sendFile(path.join(__dirname, 'jugadores.html'));
});

app.get('/jornada', (req, res) => {
    res.sendFile(path.join(__dirname, 'jornadas.html'));
});

app.get('/resultados', (req, res) => {
    res.sendFile(path.join(__dirname, 'resultados.html'));
});

app.get('/ver-resultados', (req, res) => {
    res.sendFile(path.join(__dirname, 'ver-resultados.html'));
});

// Cargar jugadores desde archivo JSON
function loadJugadores() {
    try {
        const data = fs.readFileSync(path.join(__dirname, 'jugadores.json'), 'utf8');
        return JSON.parse(data);
    } catch (err) {
        return [];
    }
}

// Guardar jugadores en archivo JSON
function saveJugadores(jugadores) {
    fs.writeFileSync(path.join(__dirname, 'jugadores.json'), JSON.stringify(jugadores, null, 2));
}

// Cargar jornadas desde archivo JSON
function loadJornadas() {
    try {
        const data = fs.readFileSync(path.join(__dirname, 'jornadas.json'), 'utf8');
        return new Map(JSON.parse(data));
    } catch (err) {
        return new Map();
    }
}

// Guardar jornadas en archivo JSON
function saveJornadas(jornadas) {
    const jornadasArray = Array.from(jornadas.entries());
    fs.writeFileSync(path.join(__dirname, 'jornadas.json'), JSON.stringify(jornadasArray, null, 2));
}

// Cargar resultados desde archivo JSON
function loadResultados() {
    try {
        const data = fs.readFileSync(path.join(__dirname, 'resultados.json'), 'utf8');
        return new Map(JSON.parse(data));
    } catch (err) {
        return new Map();
    }
}

// Guardar resultados en archivo JSON
function saveResultados(resultados) {
    const resultadosArray = Array.from(resultados.entries());
    fs.writeFileSync(path.join(__dirname, 'resultados.json'), JSON.stringify(resultadosArray, null, 2));
}

// Cargar resultados oficiales desde archivo JSON
function loadResultadosOficiales() {
    try {
        const data = fs.readFileSync(path.join(__dirname, 'resultados-oficiales.json'), 'utf8');
        return new Map(JSON.parse(data));
    } catch (err) {
        return new Map();
    }
}

// Guardar resultados oficiales en archivo JSON
function saveResultadosOficiales(resultadosOficiales) {
    fs.writeFileSync(path.join(__dirname, 'resultados-oficiales.json'), JSON.stringify(Array.from(resultadosOficiales.entries()), null, 2));
}

// Endpoints para jugadores
app.get('/api/jugadores', (req, res) => {
    const jugadores = loadJugadores();
    res.json(jugadores);
});

app.post('/api/jugadores', (req, res) => {
    const jugadores = loadJugadores();
    const nuevoJugador = req.body.nombre;
    jugadores.push(nuevoJugador);
    saveJugadores(jugadores);
    res.json(jugadores);
});

// Eliminar jugadores
app.delete('/api/jugadores/:nombre', (req, res) => {
    const jugadores = loadJugadores();
    const nombreJugador = req.params.nombre;
    
    const nuevoJugadores = jugadores.filter(jugador => jugador !== nombreJugador);
    saveJugadores(nuevoJugadores);
    res.json(nuevoJugadores);
});

// Endpoints para jornadas
app.get('/api/jornadas', (req, res) => {
    const jornadas = loadJornadas();
    res.json(Array.from(jornadas.entries()));
});

app.get('/api/jornadas/:nombre', (req, res) => {
    const nombre = req.params.nombre;
    const jornadas = loadJornadas();
    if (jornadas.has(nombre)) {
        res.json(jornadas.get(nombre));
    } else {
        res.status(404).json({ error: 'Jornada no encontrada.' });
    }
});

app.post('/api/jornadas', (req, res) => {
    const jornadas = loadJornadas();
    const nombreJornada = req.body.nombre;
    const partidos = req.body.partidos;

    jornadas.set(nombreJornada, partidos);
    saveJornadas(jornadas);
    res.json(Array.from(jornadas.entries()));
});

app.post('/api/jornadas/agregar-partido', (req, res) => {
    const { jornada, partido } = req.body;
    const jornadas = loadJornadas();
    if (!jornadas.has(jornada)) {
        return res.status(404).json({ error: 'Jornada no encontrada.' });
    }
    let partidos = jornadas.get(jornada);
    partidos.push({
        equipo1: partido.equipo1,
        equipo2: partido.equipo2,
        comodin: partido.comodin || false // Agregar el campo comodín con un valor por defecto de false
    });
    jornadas.set(jornada, partidos);
    saveJornadas(jornadas);
    res.status(200).json({ success: true });
});

app.post('/api/jornadas/eliminar-partidos', (req, res) => {
    const { jornada, indices } = req.body;
    const jornadas = loadJornadas();
    if (!jornadas.has(jornada)) {
        return res.status(404).json({ error: 'Jornada no encontrada.' });
    }
    let partidos = jornadas.get(jornada);
    indices.sort((a, b) => b - a).forEach(index => partidos.splice(index, 1));
    jornadas.set(jornada, partidos);
    saveJornadas(jornadas);
    res.status(200).json({ success: true });
});

// Endpoints para resultados
app.get('/api/resultados', (req, res) => {
    const resultados = loadResultados();
    res.json(Array.from(resultados.entries()));
});

app.post('/api/resultados', (req, res) => {
    const resultados = loadResultados();
    const { jugador, jornada, pronosticos } = req.body;
    const key = `${jugador}_${jornada}`;

    resultados.set(key, pronosticos);
    saveResultados(resultados);
    res.json(Array.from(resultados.entries()));
});

app.get('/api/resultados/:jugador/:jornada', (req, res) => {
    const { jugador, jornada } = req.params;
    const resultados = loadResultados();
    const key = `${jugador}_${jornada}`;
    
    if (resultados.has(key)) {
        res.json(resultados.get(key));
    } else {
        res.json({ message: 'El jugador aún no ha pronosticado esta jornada.' });
    }
});

// Nuevo endpoint para obtener los resultados de una jornada específica
app.get('/api/resultados-oficiales/:jornada', (req, res) => {
    const { jornada } = req.params;
    const resultadosOficiales = loadResultadosOficiales();
    const jornadasMap = loadJornadas();

    // Convertir el Map a un array para utilizar find
    const jornadas = Array.from(jornadasMap.entries());

    const partidosJornada = jornadas.find(([nombre]) => nombre === jornada);
    
    if (!partidosJornada) {
        return res.status(404).json({ error: 'Jornada no encontrada' });
    }

    const partidos = partidosJornada[1];
    const resultadosExistentes = resultadosOficiales.get(jornada) || [];

    const partidosConResultados = partidos.map(partido => {
        const resultado = resultadosExistentes.find(r => r.equipo1 === partido.equipo1 && r.equipo2 === partido.equipo2);
        return {
            equipo1: partido.equipo1,
            equipo2: partido.equipo2,
            marcador1: resultado ? resultado.marcador1 : '',
            marcador2: resultado ? resultado.marcador2 : '',
            comodin: partido.comodin
        };
    });

    res.json({ jornada, partidos: partidosConResultados });
});


// Endpoints para resultados oficiales
app.get('/api/resultados-oficiales', (req, res) => {
    const resultadosOficiales = loadResultadosOficiales();
    res.json(Array.from(resultadosOficiales.entries()));
});

app.post('/api/resultados-oficiales', (req, res) => {
    const resultadosOficiales = loadResultadosOficiales();
    const { jornada, resultados } = req.body;
    
    // Aseguramos que cada resultado tenga el campo comodin
    const resultadosConComodin = resultados.map(resultado => ({
        equipo1: resultado.equipo1,
        marcador1: resultado.marcador1,
        equipo2: resultado.equipo2,
        marcador2: resultado.marcador2,
        comodin: resultado.comodin || false  // Añadimos un valor por defecto si comodin no está presente
    }));

    resultadosOficiales.set(jornada, resultadosConComodin);
    saveResultadosOficiales(resultadosOficiales);
    res.json(Array.from(resultadosOficiales.entries()));
});

// Endpoint para obtener los resultados totales
app.get('/api/resultados-totales', (req, res) => {
    const jugadores = loadJugadores();
    const jornadas = loadJornadas();
    const resultados = loadResultados();
    const resultadosOficiales = loadResultadosOficiales();

    const resultadosTotales = {};

    jugadores.forEach(jugador => {
        resultadosTotales[jugador] = {};  // Se asegura que cada jugador tenga un objeto propio        
        let totalPuntos = 0;

        jornadas.forEach((partidos, jornadaId) => {
            const resultadosJugador = resultados.get(`${jugador}_${jornadaId}`) || [];
            const resultadosOficialesJornada = resultadosOficiales.get(jornadaId) || [];

            let puntosJornada = 0;

            partidos.forEach((partido, index) => {
                const pronostico = resultadosJugador[index];
                const resultadoOficial = resultadosOficialesJornada[index];

                if (typeof resultadoOficial === 'object' && resultadoOficial.equipo1 && resultadoOficial.equipo2) {
                    const { marcador1: marcador1Oficial, marcador2: marcador2Oficial, comodin: fechacomodin = false } = resultadoOficial || {};
                    const { marcador1: marcador1Pronostico = null, marcador2: marcador2Pronostico = null } = pronostico || {};

                    // Función para determinar el resultado de un equipo (ganó, empató, perdió)
                    function determinarResultado(marcador1, marcador2) {
                        if (marcador1 > marcador2) return 'gano';
                        if (marcador1 < marcador2) return 'perdio';
                        return 'empato';
                    }

                    const resultadoOficialEquipo1 = determinarResultado(marcador1Oficial, marcador2Oficial);
                    const resultadoPronosticoEquipo1 = determinarResultado(marcador1Pronostico, marcador2Pronostico);

                    if (resultadoOficialEquipo1 === resultadoPronosticoEquipo1 && marcador1Pronostico !== null && marcador2Pronostico !== null && marcador1Oficial !== "" && marcador2Oficial !== "" && fechacomodin == false) {
                        puntosJornada += 3; // 3 puntos por acertar el resultado (ganó, empató, perdió)
                    }

                    if (resultadoOficialEquipo1 === resultadoPronosticoEquipo1 && marcador1Pronostico !== null && marcador2Pronostico !== null && marcador1Oficial !== "" && marcador2Oficial !== "" && fechacomodin == true) {
                        puntosJornada += 4; // 3 puntos por acertar el resultado (ganó, empató, perdió)
                    }

                    if (marcador1Oficial === marcador1Pronostico && marcador2Oficial === marcador2Pronostico && marcador1Pronostico !== null && marcador1Oficial !== "" && marcador2Oficial !== "" && marcador2Pronostico !== null && fechacomodin == false) {
                        puntosJornada += 2; // 2 puntos por acertar el marcador exacto
                    }

                    if (marcador1Oficial === marcador1Pronostico && marcador2Oficial === marcador2Pronostico && marcador1Pronostico !== null && marcador2Pronostico !== null && marcador1Oficial !== "" && marcador2Oficial !== "" && fechacomodin == true) {
                        puntosJornada += 3; // 2 puntos por acertar el marcador exacto
                    }
                }
            });

            resultadosTotales[jugador][jornadaId] = puntosJornada;  // Guardar puntos por jornada
            totalPuntos += puntosJornada;
        });
        
        //Solo por ahora para ponerme al dia con la tabla general
        switch (jugador) {
            case 'Bryan Arias':
                totalPuntos += 242;
                break;

            case 'Tete':
                totalPuntos += 224;
                break;                

            case 'Quittis':
                totalPuntos += 223;
                break;                  

            case 'DC':
                totalPuntos += 220;
                break;  

            case 'Juan Soto':
                totalPuntos += 206;
                break;  
                
            case 'Orlando':
                totalPuntos += 219;
                break;  
                
            case 'Jeicros':
                totalPuntos += 213;
                break;                  

            case 'Pin':
                totalPuntos += 209;
                break;  

            case 'Mark':
                totalPuntos += 206;
                break;                  

            case 'Hector Espinoza':
                totalPuntos += 202;
                break;                  

            case 'Napoleon':
                totalPuntos += 201;
                break;  

            case 'Steven Ramirez':
                totalPuntos += 198;
                break;  

            case 'Luis Valenciano':
                totalPuntos += 198;
                break;  

            case 'Maria Chinchilla':
                totalPuntos += 197;
                break;  

            case 'Alex Mata': 
                totalPuntos += 197;
                break;                  


            case 'Noel Hernandez':
                totalPuntos += 197;
                break;                  

            case 'Milton':
                totalPuntos += 194;
                break;                  

            case 'Cerritos':
                totalPuntos += 193;
                break;  

            case 'Pablo Espinoza':
                totalPuntos += 192;
                break;  

            case 'Ricardo Solis Nunez':
                totalPuntos += 184;
                break;  

            case 'Esteban Villalta': //Aqui va Chogui
                totalPuntos += 183;
                break;  

            case 'Marco Espinoza':
                totalPuntos += 178;
                break;                  

            case 'Jordi':
                totalPuntos += 164;
                break;   

            case 'Keylor Gonzalez':
                totalPuntos += 164;
                break;                   

            case 'JorgeMarioGamboa':
                totalPuntos += 139;
                break;                   

            default:
                break;
        }

        resultadosTotales[jugador].total = totalPuntos;  // Guardar total de puntos


    });

    res.json(resultadosTotales);
});


app.listen(port, () => {
    console.log(`Servidor iniciado en http://localhost:${port}`);
});
