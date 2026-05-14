import { useRef, useEffect, useState } from 'react';
import type { Grid, TrianglePiece, GridPosition } from '@six-balls/shared';
import { getRowWidth, getPieceBallPositions } from '@six-balls/shared';
import { THEMES } from '../themes/themes';

const BALL_RADIUS = 14;
const HEX_SIZE = 32;
const Y_SPACING = HEX_SIZE * Math.sqrt(3) / 2;
const PADDING_X = 50;
const PADDING_Y = 40;
const TOTAL_ROWS = 12;

const COLORS: Record<string, string> = {
  red: '#ff4444', purple: '#9944ff', yellow: '#ffdd44', blue: '#4488ff', green: '#44cc44',
};

interface BoardProps {
  grid: Grid;
  currentPiece?: TrianglePiece | null;
  nextPiece?: TrianglePiece | null;
  theme?: string;
}

function posToCanvas(pos: GridPosition): { x: number; y: number } {
  const isEvenRow = pos.row % 2 === 0;
  const x = pos.col * HEX_SIZE + PADDING_X + (isEvenRow ? 0 : HEX_SIZE / 2);
  const y = (TOTAL_ROWS - 1 - pos.row) * Y_SPACING + PADDING_Y;
  return { x, y };
}

function lighten(hex: string, pct: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const add = (v: number) => Math.min(255, v + pct);
  return `rgb(${add(num >> 16)},${add((num >> 8) & 0xff)},${add(num & 0xff)})`;
}

interface AnimatingBall {
  x: number;
  y: number;
  color: string;
  progress: number;
}

function drawBall(ctx: CanvasRenderingContext2D, x: number, y: number, color: string, themeName: string) {
  const base = COLORS[color] || '#ccc';

  const theme = THEMES.find(t => t.name === themeName);
  const renderer = theme?.renderer || 'gradient';

  if (renderer === 'emoji') {
    ctx.beginPath();
    ctx.arc(x, y, BALL_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = base;
    ctx.fill();
    ctx.font = '18px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const emoji = theme?.emojiMap?.[color] || '●';
    ctx.fillText(emoji, x, y);
    return;
  }

  ctx.beginPath();
  ctx.arc(x, y, BALL_RADIUS, 0, Math.PI * 2);

  if (renderer === 'gradient') {
    const gradient = ctx.createRadialGradient(x - 4, y - 4, 2, x, y, BALL_RADIUS);
    gradient.addColorStop(0, lighten(base, 40));
    gradient.addColorStop(1, base);
    ctx.fillStyle = gradient;
  } else {
    // solid renderer
    ctx.fillStyle = base;
  }

  ctx.fill();
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 2;
  ctx.stroke();
}

export default function Board({ grid, currentPiece, nextPiece, theme = 'Classic' }: BoardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prevGridRef = useRef<Grid | null>(null);
  const [animatingBalls, setAnimatingBalls] = useState<AnimatingBall[]>([]);
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width, h = canvas.height;

    // Background
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, w, h);

    // Detect removed balls from previous render
    const prevGrid = prevGridRef.current;
    if (prevGrid && prevGrid !== grid) {
      const removed: AnimatingBall[] = [];
      for (let row = 0; row < TOTAL_ROWS; row++) {
        const rw = getRowWidth(row);
        for (let col = 0; col < rw; col++) {
          if (prevGrid[row]?.[col] && !grid[row]?.[col]) {
            const { x, y } = posToCanvas({ row, col });
            removed.push({ x, y, color: prevGrid[row][col]!.color, progress: 0 });
          }
        }
      }
      if (removed.length > 0) setAnimatingBalls(prev => [...prev, ...removed]);
    }
    prevGridRef.current = grid.map(r => [...r]);

    // Board frame
    ctx.strokeStyle = '#4a4a6e';
    ctx.lineWidth = 3;
    ctx.strokeRect(15, 15, w - 30, h - 30);

    // Hex cell backgrounds
    for (let row = 0; row < TOTAL_ROWS; row++) {
      const rowWidth = getRowWidth(row);
      for (let col = 0; col < rowWidth; col++) {
        const { x, y } = posToCanvas({ row, col });
        ctx.beginPath();
        ctx.arc(x, y, BALL_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = '#222240';
        ctx.fill();
        ctx.strokeStyle = '#2a2a4e';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    // Draw placed balls
    for (let row = 0; row < TOTAL_ROWS; row++) {
      const rowWidth = getRowWidth(row);
      for (let col = 0; col < rowWidth; col++) {
        const ball = grid[row][col];
        if (!ball) continue;
        const { x, y } = posToCanvas({ row, col });
        drawBall(ctx, x, y, ball.color, theme);
      }
    }

    // Draw falling piece
    if (currentPiece) {
      const positions = getPieceBallPositions(currentPiece);
      for (let i = 0; i < 3; i++) {
        const pos = positions[i];
        const { x, y } = posToCanvas(pos);
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

    // Next piece preview
    if (nextPiece) {
      const px = w - 80, py = 45;
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      ctx.fillRect(px - 10, py - 5, 65, 55);
      ctx.strokeStyle = '#4a4a6e';
      ctx.strokeRect(px - 10, py - 5, 65, 55);
      ctx.fillStyle = '#aaa';
      ctx.font = '10px sans-serif';
      ctx.fillText('NEXT', px, py + 10);

      const nextPos = getPieceBallPositions(nextPiece);
      for (let i = 0; i < 3; i++) {
        const rp = nextPos[i];
        ctx.beginPath();
        ctx.arc(px + 22 + rp.col * 10, py + 20 - rp.row * 8, 7, 0, Math.PI * 2);
        ctx.fillStyle = COLORS[nextPiece.colors[i]] || '#ccc';
        ctx.fill();
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    // Animate burst
    for (const a of animatingBalls) {
      const alpha = 1 - a.progress;
      const r = BALL_RADIUS * (1 + a.progress * 0.5);
      ctx.save();
      ctx.globalAlpha = Math.max(0, alpha);
      ctx.beginPath();
      ctx.arc(a.x, a.y, r, 0, Math.PI * 2);
      ctx.fillStyle = COLORS[a.color] || '#ccc';
      ctx.fill();
      ctx.restore();
    }

    // Progress animation
    if (animatingBalls.length > 0) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = requestAnimationFrame(function step() {
        setAnimatingBalls(prev => {
          const next = prev.map(a => ({ ...a, progress: a.progress + 0.05 })).filter(a => a.progress < 1);
          return next;
        });
      });
    }
  }, [grid, currentPiece, nextPiece, theme, animatingBalls]);

  return <canvas ref={canvasRef} width={400} height={470} style={{ border: '2px solid #333', borderRadius: '8px' }} />;
}
