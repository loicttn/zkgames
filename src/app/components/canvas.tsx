import { useEffect, useRef } from 'react';

type Props = {
  game: {
    players: number[];
    seedHashes: string[];
    board: number[];
    finishLines: number[];
    turn: string;
    lastMove: string;
  };
};

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
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const playerColors = ['red', 'green', 'blue', 'yellow'];
    const winPlayerColors = ['darkred', 'darkgreen', 'darkblue', 'orange'];

    // clear the canvas
    ctx.clearRect(0, 0, size, size);

    // draw the grid
    for (let x = 0; x < 15; x++) {
      for (let y = 0; y < 15; y++) {
        // PLAYER 1 AREA (bottom-left)
        if (x === 6 && y >= 9) {
          ctx.fillStyle = playerColors[0];
          ctx.fillRect(x * blockSize, y * blockSize, blockSize, blockSize);
        } else if (x <= 6 && y == 8) {
          ctx.fillStyle = playerColors[0];
          ctx.fillRect(x * blockSize, y * blockSize, blockSize, blockSize);
        }
        // PLAYER 2 AREA (top-left)
        else if (x === 6 && y <= 6) {
          ctx.fillStyle = playerColors[1];
          ctx.fillRect(x * blockSize, y * blockSize, blockSize, blockSize);
        } else if (x < 6 && y == 6) {
          ctx.fillStyle = playerColors[1];
          ctx.fillRect(x * blockSize, y * blockSize, blockSize, blockSize);
        }
        // PLAYER 3 AREA (top-right)
        else if (x === 8 && y <= 6) {
          ctx.fillStyle = playerColors[2];
          ctx.fillRect(x * blockSize, y * blockSize, blockSize, blockSize);
        } else if (x >= 8 && y == 6) {
          ctx.fillStyle = playerColors[2];
          ctx.fillRect(x * blockSize, y * blockSize, blockSize, blockSize);
        }
        // PLAYER 4 AREA (bottom-right)
        else if (x === 8 && y >= 9) {
          ctx.fillStyle = playerColors[3];
          ctx.fillRect(x * blockSize, y * blockSize, blockSize, blockSize);
        } else if (x >= 8 && y == 8) {
          ctx.fillStyle = playerColors[3];
          ctx.fillRect(x * blockSize, y * blockSize, blockSize, blockSize);
        } else {
          ctx.strokeRect(x * blockSize, y * blockSize, blockSize, blockSize);
        }
      }
    }

    // draw winning cases
    ctx.fillStyle = playerColors[0];
    ctx.fillRect(0 * blockSize, 7 * blockSize, blockSize, blockSize);
    ctx.fillStyle = winPlayerColors[0];
    for (let x = 1; x < 7; x++) {
      ctx.fillRect(x * blockSize, 7 * blockSize, blockSize, blockSize);
    }
    ctx.fillStyle = playerColors[1];
    ctx.fillRect(7 * blockSize, 0 * blockSize, blockSize, blockSize);
    ctx.fillStyle = winPlayerColors[1];
    for (let x = 1; x < 7; x++) {
      ctx.fillRect(7 * blockSize, x * blockSize, blockSize, blockSize);
    }
    ctx.fillStyle = playerColors[2];
    ctx.fillRect(14 * blockSize, 7 * blockSize, blockSize, blockSize);
    ctx.fillStyle = winPlayerColors[2];
    for (let x = 1; x < 7; x++) {
      ctx.fillRect(7 * blockSize + x * blockSize, 7 * blockSize, blockSize, blockSize);
    }
    ctx.fillStyle = playerColors[3];
    ctx.fillRect(7 * blockSize, 14 * blockSize, blockSize, blockSize);
    ctx.fillStyle = winPlayerColors[3];
    for (let x = 1; x < 7; x++) {
      ctx.fillRect(7 * blockSize, (7 + x) * blockSize, blockSize, blockSize);
    }
  }, [game]);

  return <canvas ref={canvasRef} width={500} height={500} />;
};

export default Canvas;
