import { useEffect, useState } from 'react'

const TURNS = {
  X: 'X',
  O: 'O'
}

const Square = ({ children, isSelected, updateBoard, index }) => {
  const className = `square ${isSelected ? 'is-selected' : ''}`

  const handleClick = () => {
    updateBoard(index)
  }

  return (
    <div onClick={handleClick} className={className}>
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
  const [board, setBoard] = useState(Array(9).fill(null))
  const [turn, setTurn] = useState(TURNS.X)
  const [winner, setWinner] = useState(null)
  const [gameMode, setGameMode] = useState('vsPlayer') // 'vsPlayer' o 'vsAI'

  const checkWinner = (boardToCheck) => {
    for (const combo of WINNERS_COMBOS) {
      const [a, b, c] = combo
      if (boardToCheck[a] && boardToCheck[a] === boardToCheck[b] && boardToCheck[a] === boardToCheck[c]) {
        return boardToCheck[a]
      }
    }
    return null
  }

  const resetGame = () => {
    setBoard(Array(9).fill(null))
    setTurn(TURNS.X)
    setWinner(null)
  }

  const updateBoard = (index) => {
    if (board[index] || winner) return

    const newBoard = [...board]
    newBoard[index] = turn
    setBoard(newBoard)

    const newWinner = checkWinner(newBoard)
    if (newWinner) {
      setWinner(newWinner)
    } else if (newBoard.every(square => square !== null)) {
      setWinner(false)
    } else {
      const newTurn = turn === TURNS.X ? TURNS.O : TURNS.X
      setTurn(newTurn)
    }
  }

  useEffect(() => {
    if (turn === TURNS.O && gameMode === 'vsAI' && !winner) {
      const timeout = setTimeout(() => {
        const bestMove = getBestMove(board)
        updateBoard(bestMove)
      }, 500)
      return () => clearTimeout(timeout)
    }
  }, [turn, board, winner, gameMode])

  const getBestMove = (newBoard) => {
    let bestScore = -Infinity
    let move = null

    for (let i = 0; i < newBoard.length; i++) {
      if (newBoard[i] === null) {
        newBoard[i] = TURNS.O
        const score = minimax(newBoard, 0, false)
        newBoard[i] = null
        if (score > bestScore) {
          bestScore = score
          move = i
        }
      }
    }

    return move
  }

  const minimax = (board, depth, isMaximizing) => {
    const result = checkWinner(board)
    if (result === TURNS.O) return 10 - depth
    if (result === TURNS.X) return depth - 10
    if (board.every(square => square !== null)) return 0

    if (isMaximizing) {
      let bestScore = -Infinity
      for (let i = 0; i < board.length; i++) {
        if (board[i] === null) {
          board[i] = TURNS.O
          const score = minimax(board, depth + 1, false)
          board[i] = null
          bestScore = Math.max(score, bestScore)
        }
      }
      return bestScore
    } else {
      let bestScore = Infinity
      for (let i = 0; i < board.length; i++) {
        if (board[i] === null) {
          board[i] = TURNS.X
          const score = minimax(board, depth + 1, true)
          board[i] = null
          bestScore = Math.min(score, bestScore)
        }
      }
      return bestScore
    }
  }

  return (
    <main className='board'>
      <h1>Turno {turn}</h1>
      <h2>({gameMode === 'vsPlayer' ? '2 Players' : 'Contra IA'})</h2>
      <button onClick={resetGame}>Resetear Juego</button>
      <button style={{minWidth: '50px'}} className='cambio-modo' onClick={() => setGameMode(gameMode === 'vsPlayer' ? 'vsAI' : 'vsPlayer')}>
        Cambiar Modo
      </button>
      
      <section className='game'>
        {
          board.map((value, index) => (
            <Square
              key={index}
              index={index}
              updateBoard={gameMode === 'vsPlayer' || turn === TURNS.X ? updateBoard : () => {}}
            >
              {value}
            </Square>
          ))
        }
      </section>

      <section className='turn'>
        <Square isSelected={turn === TURNS.X}>{TURNS.X}</Square>
        <Square isSelected={turn === TURNS.O}>{TURNS.O}</Square>
      </section>

      {
        winner !== null && (
          <section className='winner'>
            <div className='text'>
              <h2>{winner === false ? 'Empate' : `Ganó: `}</h2>
              <header className='win'>{winner && <Square>{winner}</Square>}</header>
              <footer><button onClick={resetGame}>Empezar de nuevo</button></footer>
            </div>
          </section>
        )
      }
    </main>
  )
}

export default App
