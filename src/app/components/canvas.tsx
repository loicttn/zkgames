import { useEffect, useRef } from 'react';

export type Game = {
  players: string[];
  seedHashes: string[];
  board: number[][];
  finishLines: number[];
  turn: string;
  lastMove: number;
  winner: string;
  lastTime: string;
};

type Props = {
  game: Game;
};

const pos = [
  // PLAYER 1
  [6, 14],
  [6, 13],
  [6, 12],
  [6, 11],
  [6, 10],
  [6, 9],
  [6, 8],
  [5, 8],
  [4, 8],
  [3, 8],
  [2, 8],
  [1, 8],
  [0, 8],
  [0, 7],
  // PLAYER 2
  [0, 6],
  [1, 6],
  [2, 6],
  [3, 6],
  [4, 6],
  [5, 6],
  [6, 6],
  [6, 5],
  [6, 4],
  [6, 3],
  [6, 2],
  [6, 1],
  [6, 0],
  [7, 0],
  // PLAYER 3
  [8, 0],
  [8, 1],
  [8, 2],
  [8, 3],
  [8, 4],
  [8, 5],
  [8, 6],
  [9, 6],
  [10, 6],
  [11, 6],
  [12, 6],
  [13, 6],
  [14, 6],
  [14, 7],
  // PLAYER 4
  [14, 8],
  [13, 8],
  [12, 8],
  [11, 8],
  [10, 8],
  [9, 8],
  [8, 8],
  [8, 9],
  [8, 10],
  [8, 11],
  [8, 12],
  [8, 13],
  [8, 14],
  [7, 14],
];

const finishLines = [
  // PLAYER 1
  [7, 13],
  [7, 12],
  [7, 11],
  [7, 10],
  [7, 9],
  [7, 8],
  // PLAYER 2
  [1, 7],
  [2, 7],
  [3, 7],
  [4, 7],
  [5, 7],
  [6, 7],
  // PLAYER 3
  [7, 1],
  [7, 2],
  [7, 3],
  [7, 4],
  [7, 5],
  [7, 6],
  // PLAYER 4
  [13, 7],
  [12, 7],
  [11, 7],
  [10, 7],
  [9, 7],
  [8, 7],
];
const Canvas = ({ game }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(new Image());
  const size = 500; // size of the canvas
  const blockSize = size / 15; // size of each block

  useEffect(() => {
    imageRef.current.src = 'horse.png';
    imageRef.current.onload = function () {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.save();
      ctx.translate(3 * blockSize, 3 * blockSize);
      ctx.rotate((-180 * Math.PI) / 180);
      ctx.scale(-1, 1);
      ctx.drawImage(imageRef.current, -3 * blockSize, -3 * blockSize, blockSize * 6, blockSize * 6);
      ctx.restore();

      ctx.save();
      ctx.translate(12 * blockSize, 3 * blockSize);
      ctx.rotate((-180 * Math.PI) / 180);
      ctx.drawImage(imageRef.current, -3 * blockSize, -3 * blockSize, blockSize * 6, blockSize * 6);
      ctx.restore();

      ctx.save();
      ctx.scale(-1, 1);
      ctx.drawImage(imageRef.current, -15 * blockSize, 9 * blockSize, blockSize * 6, blockSize * 6);
      ctx.restore();

      ctx.drawImage(imageRef.current, 0 * blockSize, 9 * blockSize, blockSize * 6, blockSize * 6);

      // draw idling horses
      game.board.forEach((b, p) => {
        let idling = 0;
        for (let i = 0; i < 4; i++) {
          const playerHorseColors = ['purple', 'black', 'pink', 'orange'];
          ctx.fillStyle = playerHorseColors[p];
          if (b[i] === 0) {
            if (p == 0) ctx.fillRect(idling++ * blockSize, 14 * blockSize, blockSize, blockSize);
            if (p == 1) ctx.fillRect(idling++ * blockSize, 0 * blockSize, blockSize, blockSize);
            if (p == 2) ctx.fillRect((14 - idling++) * blockSize, 0 * blockSize, blockSize, blockSize);
            if (p == 3) ctx.fillRect((14 - idling++) * blockSize, 14 * blockSize, blockSize, blockSize);
          }
        }
      });
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const playerColors = ['red', 'green', 'blue', 'yellow'];
    const winPlayerColors = ['darkred', 'darkgreen', 'darkblue', 'orange'];
    const playerHorseColors = ['purple', 'black', 'pink', 'orange'];

    // clear the canvas
    ctx.clearRect(0, 0, size, size);

    // draw board
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = playerColors[i];
      for (let j = 14 * i; j < 14 * i + 14; j++) {
        ctx.fillRect(pos[j][0] * blockSize, pos[j][1] * blockSize, blockSize, blockSize);
      }
    }

    // draw finish lines
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = winPlayerColors[i];
      for (let j = 6 * i; j < 6 * i + 6; j++) {
        ctx.fillRect(finishLines[j][0] * blockSize, finishLines[j][1] * blockSize, blockSize, blockSize);
      }
    }

    // draw players
    game.board.forEach((b, p) => {
      for (let i = 0; i < 4; i++) {
        ctx.fillStyle = playerHorseColors[p];
        if (b[i] === 0) {
          continue;
        } else {
          ctx.fillRect(pos[b[i] - 1][0] * blockSize, pos[b[i] - 1][1] * blockSize, blockSize, blockSize);
        }
      }
    });
  }, [game]);

  return <canvas ref={canvasRef} width={500} height={500} />;
};

export default Canvas;
