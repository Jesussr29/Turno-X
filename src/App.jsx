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
  const [mostrarModalRegistro, setMostrarModalRegistro] = useState(false);
  const [turnoInicial, setTurnoInicial] = useState(TURNS.X);
  const [dificultad, setDificultad] = useState("dificil");

  const [datos, setDatos] = useState([]);

  const [nombre, setNombre] = useState("");
  const [mensaje, setMensaje] = useState("");

  const [mostrarModal, setMostrarModal] = useState(false);

  const manejarEnvio = async (e) => {
    e.preventDefault();
  
    try {
      const respuesta = await fetch("https://ruizgijon.ddns.net/rinconj/turno_x/Backend/Controller/añadirUsuario.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ nombre })
      });
  
      const datos = await respuesta.json();
  
      if (datos.mensaje) {
        setMensaje(datos.mensaje);
        setNombre(""); // Limpiar campo
        setMostrarModalRegistro(false); // Cerrar el modal después de añadir el usuario
        obtenerUsuarios(); // Recargar la lista de usuarios
      } else {
        setMensaje(datos.error || "Error al añadir usuario");
      }
    } catch (error) {
      setMensaje("Error de conexión con el servidor");
      console.error(error);
    }
  };


  const obtenerUsuarios = () => {
    fetch("https://ruizgijon.ddns.net/rinconj/turno_x/Backend/Controller/recogerUsuarios.php")
      .then((res) => res.json())
      .then((data) => setDatos(data))
      .catch((error) => console.error("Error:", error));
  };
  

    // Manejador para cuando el mouse entra en el h1.ojo
    const handleMouseEnter = () => {
      document.querySelector(".winner").style.opacity = 0; // Hacer la sección winner transparente
    };
  
    // Manejador para cuando el mouse sale del h1.ojo
    const handleMouseLeave = () => {
      document.querySelector(".winner").style.opacity = 1; // Restaurar la opacidad normal
    };

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

      // Si gana X y la dificultad es "extremo"
    if (newWinner === TURNS.X && dificultad === "extremo") {
      console.log("¡Increíble! X ha ganado en modo extremo.");
      setMostrarModalRegistro(true);
      // Aquí puedes añadir cualquier acción adicional, como mostrar un mensaje especial
    }

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
    obtenerUsuarios();
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

    if (dificultad === "extremo") {
      // 99% óptimo
      return Math.random() < 0.99 ? getOptimalMove(tablero) : getRandomMove(tablero);
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
    setMostrarModalRegistro(false);
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
    <>
    <main className="board">
      <h1>Turno-X</h1>
      <h2>({gameMode === "vsPlayer" ? "2 Players" : "Contra IA: " + dificultad})</h2>
      <button onClick={() => {
          if (gameMode === "vsPlayer") {
            resetGame(false); // Mostrar el modal para "vsAI"
          } else {
            resetGame(true); // Ocultar el modal para "vsPlayer"
          }
        }}>Resetear Juego</button>
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
          <h2>{winner === false ? "Empate" : `Ganó: ${winner}`}</h2>
          <header className="win">
            {winner && winner !== false && <Square>{winner}</Square>}
          </header>
          <footer className="conjunto-btn">
            <button 
            onClick={() => {
          if (gameMode === "vsPlayer") {
            resetGame(false); // Mostrar el modal para "vsAI"
          } else {
            resetGame(true); // Ocultar el modal para "vsPlayer"
          }
        }}>Volver a jugar</button>
            <div>
              <button className="ojo" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                👁️
              </button>
            </div>
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
                <option value="extremo">Extremo</option>
              </select>
            </div>
            <h2>¿Quién empieza?</h2>
            <button onClick={() => iniciarVsIA(TURNS.X)}>Tú</button>
            <button onClick={() => iniciarVsIA(TURNS.O)}>IA</button>
          </div>
        </section>
      )}

      {winner === "X" && dificultad == "extremo" && mostrarModalRegistro == true &&(
        <section className="modal-inicio">
          <div className="modal-contenido">
            <h2>AÑADE TU NOMBRE AL MURAL DE LA FAMA</h2>
            <form onSubmit={manejarEnvio}>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Nombre del usuario"
                required
              />
              <button type="submit">Añadir</button>
            </form>
            {mensaje && <p>{mensaje}</p>}
          </div>
        </section>
      )}
    
    </main>

    <section className="portal-fama">
      <div className="titulo-fama">
      <h2>MURAL DE LA FAMA</h2>
        <i
          className="fas fa-question-circle icono-info"
          onClick={() => setMostrarModal(true)}
        ></i>
      </div>
      <br></br>
      <ul>
      {datos.length === 0 ? (
        <p style={{textAlign: 'center'}}>Todavia nadie lo ha conseguido, prueba a intentarlo.</p>
      ) : (
        datos.map((item, index) => (
          <p key={index}>
            - {item.nombre} : {item.fecha}
          </p>
        ))
      )}
        
      </ul>
    </section>

    {mostrarModal && (
        <div className="modal-fondo" onClick={() => setMostrarModal(false)}>
          <div className="modal-contenido" onClick={(e) => e.stopPropagation()}>
            <h2>¿Que es el mural de la fama?</h2>
            <p>El <span style={{color: '#ffcc00'}}>mural de la fama</span> es un reconocimiento a los usuarios que logran ganar en el <span style={{color: '#ffcc00'}}>nivel de dificultad extremo</span>, una vez ganas podras poner tu nombre y los demas usuarios podran ver que lo conseguiste.</p>
            <a className="cerrar-info" onClick={() => setMostrarModal(false)}>Cerrar</a>
          </div>
        </div>
    )}

    <br></br>
    </>
  );
  
}

export default App;