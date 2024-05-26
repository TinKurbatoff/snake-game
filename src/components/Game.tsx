import React from "react";
import { useState, useEffect, useCallback } from "react";
import { Container } from "react-bootstrap";

type Position = { x: number; y: number };

const getRandomPosition = (gridSize: number): Position => {
  return {
    x: Math.floor(Math.random() * (gridSize - 2)) + 1,
    y: Math.floor(Math.random() * (gridSize - 2)) + 1,
  };
};

const Game: React.FC = () => {
  const gridSize = 35;
  const initialSnake = [{ x: 10, y: 10 }];
  const [snake, setSnake] = useState<Position[]>(initialSnake);
  const [direction, setDirection] = useState<Position>({ x: 0, y: 0 });
  const [apple, setApple] = useState<Position>(getRandomPosition(gridSize));
  const [speed, setSpeed] = useState(150);
  const [delay, setDelay] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [pause, setPause] = useState(false);

  const moveSnake = useCallback(() => {
    if (gameOver || pause) return;

    setSnake((prevSnake) => {
      const newHead = {
        x: prevSnake[0].x + direction.x,
        y: prevSnake[0].y + direction.y,
      };

      if (
        newHead.x < 0 ||
        newHead.x >= gridSize ||
        newHead.y < 0 ||
        newHead.y >= gridSize
        // prevSnake.some(
        //   (segment) => segment.x === newHead.x && segment.y === newHead.y
        // )
      ) {
        setGameOver(true);
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];
      console.log(speed, delay, pause);

      if (newHead.x < 2 || newHead.x >= gridSize - 2) {
        setDelay(30);
      } else if (newHead.y < 2 || newHead.y >= gridSize - 2) {
        setDelay(30);
      } else {
        setDelay(0);
      }

      if (newHead.x === apple.x && newHead.y === apple.y) {
        setApple(getRandomPosition(gridSize));
        setSpeed((prevSpeed) => (prevSpeed > 50 ? prevSpeed - 10 : prevSpeed));
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [apple, direction, pause, gameOver, gridSize, pause]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (pause && event.key !== "p") return;
      switch (event.key) {
        case "Escape":
          setSnake(initialSnake);
          setGameOver(!gameOver);
          break;
        case "p":
          setPause(!pause); // toggle pause
          break;
        case "ArrowUp":
          if (direction.y === 1) return;
          setDirection({ x: 0, y: -1 });
          break;
        case "ArrowDown":
          if (direction.y === -1) return;
          setDirection({ x: 0, y: 1 });
          break;
        case "ArrowLeft":
          if (direction.x === 1) return;
          setDirection({ x: -1, y: 0 });
          break;
        case "ArrowRight":
          if (direction.x === -1) return;
          setDirection({ x: 1, y: 0 });
          break;

        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [pause, gameOver, delay, direction]);

  useEffect(() => {
    const interval = setInterval(moveSnake, speed + delay);
    return () => clearInterval(interval);
  }, [moveSnake, speed, delay, gameOver]);

  return (
    <Container>
      <div>
        <h1>Snake Game</h1>
        {gameOver ? <h2>Game Over</h2> : null}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${gridSize}, 11px)`,
            gridTemplateRows: `repeat(${gridSize}, 11px)`,
            gap: "1px",
            margin: "20px auto",
          }}
        >
          {Array.from({ length: gridSize }).map((_, row) =>
            Array.from({ length: gridSize }).map((_, col) => {
              const isSnake = snake.some(
                (segment) => segment.x === col && segment.y === row
              );
              const isApple = apple.x === col && apple.y === row;
              const isHead = snake[0].x === col && snake[0].y === row;
              return (
                <div
                  key={`${row}-${col}`}
                  style={{
                    width: "11px",
                    height: "11px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "lightgray",
                  }}
                >
                  {isApple ? (
                    <span
                      style={{
                        width: "11px",
                        height: "11px",
                        fontSize: "11px",
                        marginBottom: "5px",
                      }}
                    >
                      🍎
                    </span>
                  ) : null}
                  {isSnake ? (
                    <div
                      style={{
                        width: "10px",
                        height: "10px",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        backgroundColor: isHead ? "#AAAA07" : "green",
                      }}
                    ></div>
                  ) : null}
                </div>
              );
            })
          )}
        </div>
      </div>
    </Container>
  );
};

export default Game;
