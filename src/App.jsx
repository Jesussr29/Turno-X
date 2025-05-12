import { use, useState } from 'react'

const TURNS = {
  X: 'X',
  O: 'O'
}

const Square = ({ children, isSelected, updateBoard, index }) => {
  const className = `square ${isSelected ? 'is-selected' : ''}`

  const handleClick = () => {
    updateBoard(index);
  }

  return (
    <div onClick={handleClick} className = {className}>
      {children}
    </div>
  )
}

const WINNERS_COMBOS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
]


function App() {
  // Array donde meter todas las posiciiiones de X o O
  const [board, setBoard] = useState(
    Array(9).fill(null)
  );

  // Estado para saber si es el turno de X o O
  const [turn, setTurn] = useState(TURNS.X);

  // Estado para saber si hay un ganador
  const [winner, setWinner] = useState(null);

  const checkWinner = (boardToCheck) => {
    for (const combo of WINNERS_COMBOS) {
      const [a, b, c] = combo
      if (boardToCheck[a] && boardToCheck[a] === boardToCheck[b] && boardToCheck[a] === boardToCheck[c]) {
        return boardToCheck[a]
      }
    }
    // Si no hay ganador, se devuelve null
    return null
  }

  const resetGame = () => {
    setBoard(Array(9).fill(null))
    setTurn(TURNS.X)
    setWinner(null)
  }

  const updateBoard = (index) => {
    // Si la posición ya tiene un valor, no se puede cambiar
    if (board[index] || board[index] === '' || winner) {
      return
    }
    const newBoard = [...board]
    newBoard[index] = turn
    setBoard(newBoard)

    // Cambiar el valor de la posición del tablero
    const newTurn = turn === TURNS.X ? TURNS.O : TURNS.X;
    console.log(newTurn);
    setTurn(newTurn);

    // Comprobar si hay un ganador
    const newWinner = checkWinner(newBoard)
    if (newWinner) {
      setWinner(newWinner)
    } else if (newBoard.every((square) => square !== null)) {
      setWinner(false)
    }
  }

  return (
    <main className='board'>
      <h1>Turno X</h1>
      <button onClick={resetGame}>Resetear Juego</button>
      <section className='game'>
        {
          board.map ((row, index) => {
            return (
              <Square
              key={index}
              index={index}
              updateBoard= {updateBoard}
              >
                {board[index]}
              </Square>
            )
          })
        }
      </section>

      <section className='turn'>
        <Square isSelected={turn === TURNS.X} >
          {TURNS.X}
        </Square>

        <Square isSelected={turn === TURNS.O} >
          {TURNS.O}
        </Square>
      </section>

      {
        winner !== null && (
          <section className='winner'>
            <div className='text'>
              <h2>
                {
                  winner === false
                    ? 'Empate'
                    : 'Ganó: '
                }
              </h2>

              <header className='win'>
                {winner && <Square>{winner}</Square>}
              </header>

              <footer>
                <button onClick={resetGame}>Empezar de nuevo</button>
              </footer>

            </div>
            </section>
        )
      }

    </main>
    
  )
}

export default App
