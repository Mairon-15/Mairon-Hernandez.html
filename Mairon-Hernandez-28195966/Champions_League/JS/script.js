document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const FormatoDelTorneo = document.getElementById('FormatoDelTorneo');
    const NombreEquipoInput = document.getElementById('NombreEquipo');
    const AggEquipoBtn = document.getElementById('AggEquipoBtn');
    const ListaDeEquipos = document.getElementById('ListaDeEquipos');
    const ConteoDeEquipos = document.getElementById('ConteoDeEquipos');
    const EquiposMax = document.getElementById('EquiposMax');
    const BtnIniciarTorneo = document.getElementById('BtnIniciarTorneo');
    const BtnReiniciarEquipos = document.getElementById('BtnReiniciarEquipos');
    const SetupPanel = document.getElementById('SetupPanel');
    const TournamentBracket = document.getElementById('TournamentBracket');
    const bracketContainer = document.querySelector('.bracket-container');
    const BtnBaraja = document.getElementById('BtnBaraja');
    const BtnSimular = document.getElementById('BtnSimular');
    const BtnReiniciarTorneo = document.getElementById('BtnReiniciarTorneo');
    const ChampionContainer = document.getElementById('ChampionContainer');
    const ChampionName = document.getElementById('ChampionName');

    // Variables de estado
    let teams = [];
    let currentRound = 0;
    let tournamentRounds = [];
    let winners = [];

    // Cargar datos del localStorage al iniciar
    loadFromLocalStorage();

    // Event listeners
    FormatoDelTorneo.addEventListener('change', updateMaxTeams);
    AggEquipoBtn.addEventListener('click', addTeam);
    BtnIniciarTorneo.addEventListener('click', startTournament);
    BtnReiniciarEquipos.addEventListener('click', resetTeams);
    BtnBaraja.addEventListener('click', shuffleTeams);
    BtnSimular.addEventListener('click', simulateRound);
    BtnReiniciarTorneo.addEventListener('click', resetTournament);
    NombreEquipoInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') addTeam();
    });

    // Función para actualizar el número máximo de equipos
    function updateMaxTeams() {
        EquiposMax.textContent = FormatoDelTorneo.value;
        checkTeamsCount();
    }

    // Función para añadir un equipo
    function addTeam() {
        const teamName = NombreEquipoInput.value.trim();
        
        if (!teamName) {
            alert('Por favor ingresa un nombre de equipo válido.');
            return;
        }
        
        if (teams.includes(teamName)) {
            alert('Este equipo ya ha sido añadido.');
            return;
        }
        
        if (teams.length >= parseInt(FormatoDelTorneo.value)) {
            alert(`Ya has alcanzado el máximo de ${FormatoDelTorneo.value} equipos para este formato.`);
            return;
        }
        
        teams.push(teamName);
        renderTeamList();
        NombreEquipoInput.value = '';
        NombreEquipoInput.focus();
        saveToLocalStorage();
    }

    // Función para renderizar la lista de equipos
    function renderTeamList() {
        ListaDeEquipos.innerHTML = '';
        teams.forEach((team, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                ${team}
                <span class="remove-team" data-index="${index}">✕</span>
            `;
            ListaDeEquipos.appendChild(li);
        });
        
        ConteoDeEquipos.textContent = teams.length;
        checkTeamsCount();
        
        // Añadir event listeners a los botones de eliminar
        document.querySelectorAll('.remove-team').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                teams.splice(index, 1);
                renderTeamList();
                saveToLocalStorage();
            });
        });
    }

    // Función para verificar si se puede iniciar el torneo
    function checkTeamsCount() {
        const requiredTeams = parseInt(FormatoDelTorneo.value);
        BtnIniciarTorneo.disabled = teams.length !== requiredTeams;
    }

    // Función para reiniciar los equipos
    function resetTeams() {
        if (confirm('¿Estás seguro de que quieres eliminar todos los equipos?')) {
            teams = [];
            renderTeamList();
            saveToLocalStorage();
        }
    }

    // Función para mezclar los equipos
    function shuffleTeams() {
        if (currentRound > 0) {
            alert("Solo puedes reordenar equipos antes de comenzar la primera ronda.");
            return;
        }
        
        shuffleArray(teams);
        setupTournamentRounds();
        renderRound(0);
        saveToLocalStorage();
    }

    // Función para iniciar el torneo
    function startTournament() {
        shuffleArray(teams);
        setupTournamentRounds();
        SetupPanel.style.display = 'none';
        TournamentBracket.style.display = 'block';
        renderRound(0);
    }

    // Función para configurar las rondas del torneo
    function setupTournamentRounds() {
        tournamentRounds = [];
        let currentTeams = [...teams];
        
        while (currentTeams.length > 1) {
            const round = {
                matches: [],
                name: getRoundName(currentTeams.length)
            };
            
            for (let i = 0; i < currentTeams.length; i += 2) {
                round.matches.push({
                    team1: currentTeams[i],
                    team2: currentTeams[i + 1],
                    winner: null
                });
            }
            
            tournamentRounds.push(round);
            currentTeams = new Array(Math.ceil(currentTeams.length / 2)).fill(null);
        }
        
        currentRound = 0;
        winners = [];
    }

    // Función para obtener el nombre de la ronda
    function getRoundName(numTeams) {
        switch(numTeams) {
            case 16: return 'Octavos de Final';
            case 8: return 'Cuartos de Final';
            case 4: return 'Semifinales';
            case 2: return 'Final';
            default: return `Ronda de ${numTeams} equipos`;
        }
    }

    // Función para simular una ronda
    function simulateRound() {
        const currentMatches = tournamentRounds[currentRound].matches;
        
        // Si ya hay ganadores en esta ronda, avanzar a la siguiente
        if (currentMatches[0].winner && currentRound < tournamentRounds.length - 1) {
            currentRound++;
            renderRound(currentRound);
            return;
        }
        
        // Simular los encuentros de la ronda actual
        winners = [];
        currentMatches.forEach(match => {
            match.winner = Math.random() < 0.5 ? match.team1 : match.team2;
            winners.push(match.winner);
        });
        
        // Preparar la siguiente ronda si no es la final
        if (currentRound < tournamentRounds.length - 1) {
            const nextRound = tournamentRounds[currentRound + 1];
            nextRound.matches.forEach((match, index) => {
                match.team1 = winners[index * 2];
                match.team2 = winners[index * 2 + 1];
            });
        }
        
        // Si es la última ronda, mostrar al campeón
        if (currentRound === tournamentRounds.length - 1) {
            showChampion(winners[0]);
        }
        
        renderRound(currentRound);
        saveToLocalStorage();
    }

    // Función para renderizar una ronda
    function renderRound(roundIndex) {
        bracketContainer.innerHTML = '';
        currentRound = roundIndex;
        
        // Renderizar todas las rondas hasta la actual
        for (let i = 0; i <= roundIndex; i++) {
            const round = document.createElement('div');
            round.className = 'round';
            
            const roundTitle = document.createElement('div');
            roundTitle.className = 'round-title';
            roundTitle.textContent = tournamentRounds[i].name;
            round.appendChild(roundTitle);
            
            tournamentRounds[i].matches.forEach((match, matchIndex) => {
                const matchDiv = document.createElement('div');
                matchDiv.className = 'match';
                
                const team1Div = document.createElement('div');
                team1Div.className = `team ${match.winner === match.team1 ? 'winner' : ''}`;
                team1Div.innerHTML = match.team1;
                if (match.winner) {
                    team1Div.innerHTML += match.winner === match.team1 ? ' <span>✔</span>' : ' <span>✘</span>';
                }
                
                const team2Div = document.createElement('div');
                team2Div.className = `team ${match.winner === match.team2 ? 'winner' : ''}`;
                team2Div.innerHTML = match.team2;
                if (match.winner) {
                    team2Div.innerHTML += match.winner === match.team2 ? ' <span>✔</span>' : ' <span>✘</span>';
                }
                
                matchDiv.appendChild(team1Div);
                matchDiv.appendChild(team2Div);
                round.appendChild(matchDiv);
            });
            
            bracketContainer.appendChild(round);
        }
        
        // Control de botones
        const currentMatches = tournamentRounds[roundIndex].matches;
        const roundFinished = currentMatches[0] && currentMatches[0].winner;
        
        // Mostrar/ocultar botones según el estado
        BtnBaraja.style.display = (currentRound === 0 && !roundFinished) ? 'inline-block' : 'none';
        
        if (roundIndex >= tournamentRounds.length - 1 && roundFinished) {
            BtnSimular.style.display = 'none';
        } else if (roundFinished) {
            BtnSimular.textContent = `Avanzar a ${tournamentRounds[roundIndex + 1].name}`;
        } else {
            BtnSimular.textContent = 'Simular Encuentros';
        }
    }

    // Función para mostrar al campeón
    function showChampion(team) {
        ChampionName.textContent = team;
        ChampionContainer.style.display = 'block';
        BtnSimular.style.display = 'none';
        saveToLocalStorage();
    }

    // Función para reiniciar todo el torneo
    function resetTournament() {
        if (confirm('¿Estás seguro de que quieres reiniciar el torneo? Se perderá todo el progreso.')) {
            TournamentBracket.style.display = 'none';
            SetupPanel.style.display = 'block';
            ChampionContainer.style.display = 'none';
            localStorage.removeItem('championsLeagueTournament');
            teams = [];
            renderTeamList();
        }
    }

    // Función para mezclar un array aleatoriamente (Fisher-Yates)
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // Función para guardar en localStorage
    function saveToLocalStorage() {
        const tournamentData = {
            teams: teams,
            format: FormatoDelTorneo.value,
            tournamentRounds: tournamentRounds,
            currentRound: currentRound,
            winners: winners,
            champion: ChampionContainer.style.display === 'block' ? ChampionName.textContent : null
        };
        localStorage.setItem('championsLeagueTournament', JSON.stringify(tournamentData));
    }

    // Función para cargar desde localStorage
    function loadFromLocalStorage() {
        const savedData = localStorage.getItem('championsLeagueTournament');
        if (savedData) {
            const data = JSON.parse(savedData);
            teams = data.teams || [];
            FormatoDelTorneo.value = data.format || '8';
            tournamentRounds = data.tournamentRounds || [];
            currentRound = data.currentRound || 0;
            winners = data.winners || [];
            
            updateMaxTeams();
            renderTeamList();
            
            if (data.champion) {
                SetupPanel.style.display = 'none';
                TournamentBracket.style.display = 'block';
                ChampionContainer.style.display = 'block';
                ChampionName.textContent = data.champion;
                renderRound(currentRound);
            } else if (tournamentRounds.length > 0) {
                SetupPanel.style.display = 'none';
                TournamentBracket.style.display = 'block';
                renderRound(currentRound);
            }
        } else {
            updateMaxTeams();
        }
    }
});