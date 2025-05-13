import { useEffect, useState } from "react";

const TURNS = {
  X: "X",
  O: "O",
};

const Square = ({ children, isSelected, updateBoard, index }) => {
  const className = `square ${isSelected ? "is-selected" : ""}`;

  const handleClick = () => {
    updateBoard(index);
  };

  return (
    <div onClick={handleClick} className={className}>
      {children}
    </div>
  );
};

const WINNERS_COMBOS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function App() {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [turn, setTurn] = useState(TURNS.X);
  const [winner, setWinner] = useState(null);
  const [gameMode, setGameMode] = useState("vsPlayer");
  const [mostrarModalInicio, setMostrarModalInicio] = useState(false);
  const [turnoInicial, setTurnoInicial] = useState(TURNS.X);
  const [dificultad, setDificultad] = useState("dificil");

  const checkWinner = (boardToCheck) => {
    for (const combo of WINNERS_COMBOS) {
      const [a, b, c] = combo;
      if (boardToCheck[a] && boardToCheck[a] === boardToCheck[b] && boardToCheck[a] === boardToCheck[c]) {
        return boardToCheck[a];
      }
    }
    return null;
  };

  const resetGame = (showModal = false) => {
    setMostrarModalInicio(showModal); // Mostrar el modal solo si se pasa `true`
    const startingTurn = turnoInicial; // Usar el turno inicial asignado
    setBoard(Array(9).fill(null));
    setTurn(startingTurn);
    setWinner(null);
  };

  const updateBoard = (index) => {
    if (board[index] || winner) return;

    const newBoard = [...board];
    newBoard[index] = turn;
    setBoard(newBoard);

    const newWinner = checkWinner(newBoard);
    if (newWinner) {
      setWinner(newWinner);
      // Eliminar el modal automático
      // Antes: setTimeout(() => setMostrarModalInicio(true), 1000);
    } else if (newBoard.every((square) => square !== null)) {
      setWinner(false);
      // Eliminar el modal automático
      // Antes: setTimeout(() => setMostrarModalInicio(true), 1000);
    } else {
      const newTurn = turn === TURNS.X ? TURNS.O : TURNS.X;
      setTurn(newTurn);
    }
  };

  useEffect(() => {
    if (turn === TURNS.O && gameMode === "vsAI" && !winner) {
      const timeout = setTimeout(() => {
        const bestMove = getBestMove(board);
        updateBoard(bestMove);
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [turn, board, winner, gameMode]);

  const getBestMove = (tablero) => {
    const getRandomMove = (tablero) => {
      const movimientosDisponibles = tablero
        .map((valor, i) => (valor === null ? i : null))
        .filter((i) => i !== null);
      return movimientosDisponibles[Math.floor(Math.random() * movimientosDisponibles.length)];
    };

    if (dificultad === "facil") {
      // 60% óptimo, 40% aleatorio
      return Math.random() < 0.6 ? getOptimalMove(tablero) : getRandomMove(tablero);
    }

    if (dificultad === "medio") {
      // 85% óptimo, 15% aleatorio
      return Math.random() < 0.85 ? getOptimalMove(tablero) : getRandomMove(tablero);
    }

    if (dificultad === "dificil") {
      // 95% óptimo, 5% aleatorio
      return Math.random() < 0.95 ? getOptimalMove(tablero) : getRandomMove(tablero);
    }

    // Por defecto, devuelve el movimiento óptimo
    return getOptimalMove(tablero);
  };

  const getOptimalMove = (tablero) => {
    let mejorPuntaje = -Infinity;
    let movimiento = null;
    // Ajusta la profundidad según el nivel de dificultad
    const profundidad = dificultad === "facil" ? 2 : dificultad === "medio" ? 4 : 6;

    for (let i = 0; i < tablero.length; i++) {
      if (tablero[i] === null) {
        tablero[i] = TURNS.O;
        const puntuacion = minimax(tablero, 0, false, profundidad);
        tablero[i] = null;
        if (puntuacion > mejorPuntaje) {
          mejorPuntaje = puntuacion;
          movimiento = i;
        }
      }
    }

    return movimiento;
  };

  const minimax = (board, depth, isMaximizing) => {
    const result = checkWinner(board);
    if (result === TURNS.O) return 10 - depth;
    if (result === TURNS.X) return depth - 10;
    if (board.every((square) => square !== null)) return 0;

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < board.length; i++) {
        if (board[i] === null) {
          board[i] = TURNS.O;
          const score = minimax(board, depth + 1, false);
          board[i] = null;
          bestScore = Math.max(score, bestScore);
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < board.length; i++) {
        if (board[i] === null) {
          board[i] = TURNS.X;
          const score = minimax(board, depth + 1, true);
          board[i] = null;
          bestScore = Math.min(score, bestScore);
        }
      }
      return bestScore;
    }
  };

  const iniciarVsIA = (turnoElegido) => {
    setTurnoInicial(turnoElegido);
    setTurn(turnoElegido);
    setGameMode("vsAI");
    setMostrarModalInicio(false);
    const nuevoTablero = Array(9).fill(null);

    if (turnoElegido === TURNS.O) {
      const bestMove = getBestMove(nuevoTablero);
      nuevoTablero[bestMove] = TURNS.O;
      setTurn(TURNS.X);
    }

    setBoard(nuevoTablero);
    setWinner(null);
  };

  return (
    <main className="board">
      <h1>Turno {turn}</h1>
      <h2>({gameMode === "vsPlayer" ? "2 Players" : "Contra IA"})</h2>
      <button onClick={() => resetGame(false)}>Resetear Juego</button>
      <button
        style={{ minWidth: "50px" }}
        className="cambio-modo"
        onClick={() => {
          if (gameMode === "vsPlayer") {
            setGameMode("vsAI");
            resetGame(true); // Mostrar el modal para "vsAI"
          } else {
            setGameMode("vsPlayer");
            setTurn(TURNS.X);
            setTurnoInicial(TURNS.X);
            resetGame(false); // Ocultar el modal para "vsPlayer"
          }
        }}
      >
        Cambiar Modo
      </button>

      <section className="game">
        {board.map((value, index) => (
          <Square
            key={index}
            index={index}
            updateBoard={gameMode === "vsPlayer" || turn === TURNS.X ? updateBoard : () => {}}
          >
            {value}
          </Square>
        ))}
      </section>

      <section className="turn">
        <Square isSelected={turn === TURNS.X}>{TURNS.X}</Square>
        <Square isSelected={turn === TURNS.O}>{TURNS.O}</Square>
      </section>

      {winner !== null && (
        <section className="winner">
          <div className="text">
            <h2>{winner === false ? "Empate" : `Ganó: `}</h2>
            <header className="win">{winner && <Square>{winner}</Square>}</header>
            <footer>
              <button onClick={() => resetGame(true)}>Volver a jugar</button>
            </footer>
          </div>
        </section>
      )}

      {mostrarModalInicio && (
        <section className="modal-inicio">
          <div className="modal-contenido">
            <div>
              <h2>Dificultad:</h2>
              <select value={dificultad} onChange={(e) => setDificultad(e.target.value)}>
                <option value="facil">Fácil</option>
                <option value="medio">Medio</option>
                <option value="dificil">Difícil</option>
              </select>
            </div>
            <h2>¿Quién empieza?</h2>
            <button onClick={() => iniciarVsIA(TURNS.X)}>Tú</button>
            <button onClick={() => iniciarVsIA(TURNS.O)}>IA</button>
          </div>
        </section>
      )}
    </main>
  );
}

export default App;