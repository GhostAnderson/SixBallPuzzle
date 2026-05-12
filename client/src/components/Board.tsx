import { useRef, useEffect } from 'react';
import type { Grid, TrianglePiece, GridPosition } from '@six-balls/shared';
import { getRowWidth, getPieceBallPositions } from '@six-balls/shared';

const BALL_RADIUS = 14;
const HEX_SIZE = 30;
const COLORS: Record<string, string> = {
  red: '#ff4444',
  purple: '#9944ff',
  yellow: '#ffdd44',
  blue: '#4488ff',
  green: '#44cc44',
};

interface BoardProps {
  grid: Grid;
  currentPiece?: TrianglePiece | null;
}

export default function Board({ grid, currentPiece }: BoardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, width, height);

    const TOTAL_ROWS = 12;
    const cellSize = HEX_SIZE;

    for (let row = 0; row < TOTAL_ROWS; row++) {
      const rowWidth = getRowWidth(row);
      const isEvenRow = row % 2 === 0;

      for (let col = 0; col < rowWidth; col++) {
        // Calculate canvas position (row 0 at bottom, row 11 at top)
        const x = col * cellSize + 40 + (isEvenRow ? 0 : cellSize / 2);
        const y = (TOTAL_ROWS - 1 - row) * cellSize + 40;

        const ball = grid[row][col];

        if (ball) {
          // Draw filled ball
          ctx.beginPath();
          ctx.arc(x, y, BALL_RADIUS, 0, Math.PI * 2);
          ctx.fillStyle = COLORS[ball.color] || '#ccc';
          ctx.fill();
          ctx.strokeStyle = '#333';
          ctx.lineWidth = 2;
          ctx.stroke();
        } else {
          // Draw empty cell marker
          ctx.beginPath();
          ctx.arc(x, y, BALL_RADIUS, 0, Math.PI * 2);
          ctx.fillStyle = '#2a2a3e';
          ctx.fill();
          ctx.strokeStyle = '#3a3a4e';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    // Draw falling piece
    if (currentPiece) {
      const piecePositions = getPieceBallPositions(currentPiece);
      for (let i = 0; i < 3; i++) {
        const pos = piecePositions[i];
        const isEvenRow = pos.row % 2 === 0;
        const x = pos.col * HEX_SIZE + 40 + (isEvenRow ? 0 : HEX_SIZE / 2);
        const y = (TOTAL_ROWS - 1 - pos.row) * HEX_SIZE + 40;
        const color = currentPiece.colors[i];

        ctx.beginPath();
        ctx.arc(x, y, BALL_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = COLORS[color] || '#ccc';
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }
  }, [grid, currentPiece]);

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={500}
      style={{ border: '2px solid #333', borderRadius: '4px' }}
    />
  );
}
