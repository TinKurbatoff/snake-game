import React from "react";
import { useState, useEffect, useCallback } from "react";
import { Container } from "react-bootstrap";

const startSpeed = 150;
const gridSize = 35;

type Position = { x: number; y: number };

const getRandomPosition = (gridSize: number): Position => {
  return {
    x: Math.floor(Math.random() * (gridSize - 2)) + 1,
    y: Math.floor(Math.random() * (gridSize - 2)) + 1,
  };
};

const Game = () => {
  const initialSnake = [getRandomPosition(gridSize)];
  const [snake, setSnake] = useState<Position[]>(initialSnake);
  const [direction, setDirection] = useState<Position>({ x: 0, y: 0 });
  const [apple, setApple] = useState<Position>(getRandomPosition(gridSize));
  const [speed, setSpeed] = useState(startSpeed);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [delay, setDelay] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [pause, setPause] = useState(false);

  // Load the high score from localStorage when the component mounts
  useEffect(() => {
    const storedHighScore = localStorage.getItem("highScore");
    if (storedHighScore) {
      setHighScore(Number(storedHighScore));
    }
  }, []);

  // Update the high score in state and localStorage if the score changes
  useEffect(() => {
    if (score > highScore) {
      setHighScore(parseInt(score.toString()));
      localStorage.setItem("highScore", score.toString());
    }
  }, [score, highScore]);

  const moveSnake = useCallback(() => {
    if (gameOver || pause) return;

    setSnake((prevSnake) => {
      const newHead = {
        x: prevSnake[0].x + direction.x,
        y: prevSnake[0].y + direction.y,
      };
      const newSnake = [newHead, ...prevSnake]; // Adds a new head to the snake

      // Check if the snake hits the wall or itself
      if (
        newHead.x < 0 ||
        newHead.x >= gridSize ||
        newHead.y < 0 ||
        newHead.y >= gridSize ||
        prevSnake
          .slice(2)
          .some((segment) => segment.x === newHead.x && segment.y === newHead.y)
      ) {
        setGameOver(true);
        return prevSnake;
      }

      // Slow down the snake if it is near the wall
      if (newHead.x < 2 || newHead.x >= gridSize - 2) {
        setDelay(50);
      } else if (newHead.y < 2 || newHead.y >= gridSize - 2) {
        setDelay(50);
      } else {
        setDelay(0);
      }

      if (newHead.x === apple.x && newHead.y === apple.y) {
        // Note that the apple is eaten, tail is not removed then
        setScore((prevScore) => prevScore + 1);
        setApple(getRandomPosition(gridSize)); // Moves the apple
        setSpeed((prevSpeed) => (prevSpeed > 30 ? prevSpeed - 4 : prevSpeed)); // Increases the speed
      } else {
        newSnake.pop(); // Removes the tail of the snake
      }

      return newSnake;
    });
  }, [direction, gameOver, pause]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (pause && event.key !== "p") return;
      switch (event.key) {
        case "Escape":
          if (gameOver) {
            setSpeed(startSpeed);
            setSnake(initialSnake);
            setScore(0);
          } // When game is restarted
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
  }, [gameOver, pause, direction, delay]);

  useEffect(() => {
    console.log(speed, delay, speed + delay);
    const interval = setInterval(moveSnake, speed + delay);
    return () => clearInterval(interval);
  }, [moveSnake, delay, speed]);

  return (
    <Container>
      <div>
        <h1>Snake Game</h1>
        {gameOver || pause ? (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              color: "red",
              backgroundColor: "rgba(255, 255, 255, 0.8)",
              padding: "20px",
              borderRadius: "10px",
              zIndex: 10,
            }}
          >
            <h2>{gameOver ? "Game Over" : "Pause"}</h2>
          </div>
        ) : null}
        <div>
          <p style={{ fontSize: "0.9rem", marginBottom: "4px" }}>
            Score: {score} (High Score: {highScore})
          </p>
        </div>

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
                      role="img"
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
                        backgroundColor: isHead ? "darkgreen" : "green",
                      }}
                    ></div>
                  ) : null}
                </div>
              );
            })
          )}
        </div>
      </div>
      <div>
        <p style={{ fontSize: "0.9rem" }}>P — pause, ESC — restart</p>
      </div>
    </Container>
  );
};

export default Game;
