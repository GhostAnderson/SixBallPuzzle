import { useRef, useEffect } from 'react';
import {
  type Grid, type TrianglePiece, type GridPosition,
  getRowWidth, getPieceBallPositions, movePiece, canPlacePiece, getSpeedInterval,
} from '@six-balls/shared';

const BALL_RADIUS = 18;
const HEX_SIZE = 36;
const Y_SPACING = HEX_SIZE * Math.sqrt(3) / 2;
const PADDING_X = 44;
const PADDING_Y = 32;
const TOTAL_ROWS = 12;
const CANVAS_W = 420;
// Height: top padding + 11 row-spacings + bottom padding (symmetric to top)
const CANVAS_H = Math.ceil(11 * Y_SPACING + PADDING_Y * 2);

const HEX_COLORS: Record<string, string> = {
  red: '#ff3366', purple: '#8833ff', yellow: '#ffbb00', blue: '#3366ff', green: '#22bb55',
};

interface BurstBall {
  x: number; y: number; color: string;
  startTime: number; duration: number;
}

interface SettlingBall {
  fromX: number; fromY: number;
  toX: number; toY: number;
  toRow: number; toCol: number;
  color: string;
  startTime: number; duration: number;
}

export interface BoardProps {
  grid: Grid;
  currentPiece: TrianglePiece | null;
  startTime: number | null;
  isMyBoard?: boolean;
}

function posToCanvas(pos: GridPosition): { x: number; y: number } {
  const x = pos.col * HEX_SIZE + PADDING_X + (pos.row % 2 === 0 ? 0 : HEX_SIZE / 2);
  const y = (TOTAL_ROWS - 1 - pos.row) * Y_SPACING + PADDING_Y;
  return { x, y };
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawBall(ctx: CanvasRenderingContext2D, x: number, y: number, colorKey: string, alpha = 1, radius = BALL_RADIUS) {
  const base = HEX_COLORS[colorKey] ?? '#cccccc';
  const rVal = parseInt(base.slice(1, 3), 16);
  const gVal = parseInt(base.slice(3, 5), 16);
  const bVal = parseInt(base.slice(5, 7), 16);
  const hi = `rgb(${Math.min(255, rVal + 120)},${Math.min(255, gVal + 120)},${Math.min(255, bVal + 120)})`;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.shadowColor = base + '88';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 2;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  const grad = ctx.createRadialGradient(x - radius * 0.24, y - radius * 0.36, radius * 0.05, x, y, radius);
  grad.addColorStop(0, hi);
  grad.addColorStop(1, base);
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
  ctx.strokeStyle = 'white'; ctx.lineWidth = 3; ctx.stroke();
  ctx.restore();
}

function easeOut(t: number): number {
  return 1 - (1 - t) * (1 - t);
}

function drawBurst(ctx: CanvasRenderingContext2D, x: number, y: number, colorKey: string, t: number) {
  const base = HEX_COLORS[colorKey] ?? '#cccccc';
  if (t < 0.55) {
    const scale = t < 0.25 ? 1 + 0.45 * (t / 0.25) : 1.45 - 0.35 * ((t - 0.25) / 0.3);
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, BALL_RADIUS * scale, 0, Math.PI * 2);
    ctx.fillStyle = base;
    ctx.fill();
    ctx.restore();
  }
  const ringAlpha = 0.9 * (1 - t);
  if (ringAlpha > 0) {
    const ringRadius = BALL_RADIUS * (0.4 + t * 2.1);
    ctx.save();
    ctx.globalAlpha = ringAlpha;
    ctx.beginPath();
    ctx.arc(x, y, ringRadius, 0, Math.PI * 2);
    ctx.strokeStyle = base; ctx.lineWidth = 3; ctx.stroke();
    ctx.restore();
  }
  if (t < 0.48) {
    const pt = t / 0.48;
    for (let i = 0; i < 8; i++) {
      const angle = (i * 45 * Math.PI) / 180;
      const dist = (20 + (i % 3) * 4) * pt;
      const px = x + Math.cos(angle) * dist;
      const py = y + Math.sin(angle) * dist;
      const pAlpha = pt < 0.7 ? 1 : 1 - (pt - 0.7) / 0.3;
      const pRadius = 4 * (1 - pt * 0.5);
      ctx.save();
      ctx.globalAlpha = pAlpha;
      ctx.beginPath();
      ctx.arc(px, py, pRadius, 0, Math.PI * 2);
      ctx.fillStyle = base; ctx.fill();
      ctx.restore();
    }
  }
}

export default function Board({ grid, currentPiece, startTime, isMyBoard = false }: BoardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const gridRef = useRef(grid);
  const currentPieceRef = useRef(currentPiece);
  const startTimeRef = useRef(startTime);
  const lastDropTimeRef = useRef(Date.now());
  const prevGridRef = useRef<Grid>(grid);
  const lastPieceRef = useRef<TrianglePiece | null>(null);
  // Stores the canvas (x,y) of each ball at the START of the current fall step,
  // enabling smooth X+Y interpolation across hex row-parity changes.
  const prevBallPositionsRef = useRef<Array<{ x: number; y: number }> | null>(null);
  const settlingBallsRef = useRef<SettlingBall[]>([]);
  const settlingPosRef = useRef<Set<string>>(new Set());
  const burstingRef = useRef<BurstBall[]>([]);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const prevPiece = currentPieceRef.current;
    const prevGrid = prevGridRef.current;
    const now = Date.now();

    if (currentPiece) lastPieceRef.current = currentPiece;

    // Determine fall animation state based on how the piece changed.
    const prevRow = prevPiece?.position.row ?? -99;
    const prevCol = prevPiece?.position.col ?? -99;
    const prevRot = prevPiece?.rotation ?? -99;
    const curRow  = currentPiece?.position.row ?? -99;
    const curCol  = currentPiece?.position.col ?? -99;
    const curRot  = currentPiece?.rotation ?? -99;

    if (prevRow !== curRow || prevCol !== curCol || prevRot !== curRot) {
      if (prevPiece && currentPiece && prevRow === curRow + 1 && prevCol === curCol) {
        // Piece fell exactly one row: save current canvas positions and start interpolation.
        prevBallPositionsRef.current = getPieceBallPositions(prevPiece).map(posToCanvas);
        lastDropTimeRef.current = now;
      } else {
        // Any other change (spawn, hard-drop, rotate, horizontal move): snap immediately.
        prevBallPositionsRef.current = null;
      }
    }

    if (prevGrid !== grid) {
      // Burst animation for cleared balls.
      const bursts: BurstBall[] = [];
      for (let row = 0; row < TOTAL_ROWS; row++) {
        const rw = getRowWidth(row);
        for (let col = 0; col < rw; col++) {
          if (prevGrid[row]?.[col] && !grid[row]?.[col]) {
            const { x, y } = posToCanvas({ row, col });
            bursts.push({ x, y, color: prevGrid[row][col]!.color, startTime: now, duration: 380 });
          }
        }
      }
      if (bursts.length > 0) burstingRef.current = [...burstingRef.current, ...bursts];

      // Settling animation: detect balls that newly appeared in the grid (piece just landed).
      // Use prevPiece (the piece that was active when the grid changed) as the starting position.
      if (prevPiece) {
        const newBalls: Array<{ row: number; col: number; color: string }> = [];
        for (let row = 0; row < TOTAL_ROWS; row++) {
          const rw = getRowWidth(row);
          for (let col = 0; col < rw; col++) {
            if (!prevGrid[row]?.[col] && grid[row]?.[col]) {
              newBalls.push({ row, col, color: grid[row][col]!.color });
            }
          }
        }
        if (newBalls.length > 0 && newBalls.length <= 3) {
          const startPositions = getPieceBallPositions(prevPiece).map(posToCanvas);
          settlingBallsRef.current = newBalls.map((ball, i) => ({
            fromX: startPositions[Math.min(i, 2)].x,
            fromY: startPositions[Math.min(i, 2)].y,
            toX: posToCanvas({ row: ball.row, col: ball.col }).x,
            toY: posToCanvas({ row: ball.row, col: ball.col }).y,
            toRow: ball.row, toCol: ball.col,
            color: ball.color,
            startTime: now + i * 30,
            duration: 250,
          }));
          settlingPosRef.current = new Set(newBalls.map(b => `${b.row},${b.col}`));
        }
      }
    }

    currentPieceRef.current = currentPiece;
    prevGridRef.current = grid;
    startTimeRef.current = startTime;
    gridRef.current = grid;
  }, [grid, currentPiece, startTime]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    function render() {
      const now = Date.now();
      const piece = currentPieceRef.current;
      const g = gridRef.current;
      const st = startTimeRef.current;

      ctx.fillStyle = '#ffffff';
      roundRect(ctx, 0, 0, CANVAS_W, CANVAS_H, 12);
      ctx.fill();

      ctx.strokeStyle = isMyBoard ? '#ff4499' : '#cc66ff';
      ctx.lineWidth = 4;
      roundRect(ctx, 2, 2, CANVAS_W - 4, CANVAS_H - 4, 10);
      ctx.stroke();

      ctx.save();
      ctx.globalAlpha = 0.05;
      for (let dx = 12; dx < CANVAS_W; dx += 20) {
        for (let dy = 12; dy < CANVAS_H; dy += 20) {
          ctx.beginPath();
          ctx.arc(dx, dy, 2, 0, Math.PI * 2);
          ctx.fillStyle = '#cc44aa';
          ctx.fill();
        }
      }
      ctx.restore();

      const settling = settlingPosRef.current;
      for (let row = 0; row < TOTAL_ROWS; row++) {
        const rw = getRowWidth(row);
        for (let col = 0; col < rw; col++) {
          const ball = g[row][col];
          if (!ball || settling.has(`${row},${col}`)) continue;
          const { x, y } = posToCanvas({ row, col });
          drawBall(ctx, x, y, ball.color);
        }
      }

      if (piece) {
        let ghost = piece;
        while (true) {
          const next = movePiece(ghost, 'down');
          if (canPlacePiece(g, next)) ghost = next; else break;
        }
        if (ghost.position.row !== piece.position.row) {
          const gPos = getPieceBallPositions(ghost);
          ctx.save();
          ctx.setLineDash([5, 4]);
          for (let i = 0; i < 3; i++) {
            const { x, y } = posToCanvas(gPos[i]);
            ctx.globalAlpha = 0.25;
            ctx.beginPath();
            ctx.arc(x, y, BALL_RADIUS, 0, Math.PI * 2);
            ctx.strokeStyle = HEX_COLORS[piece.colors[i]] ?? '#ccc';
            ctx.lineWidth = 2;
            ctx.stroke();
          }
          ctx.setLineDash([]); ctx.restore();
        }
      }

      // Draw the active piece with smooth X+Y interpolation across each row drop.
      if (piece) {
        const positions = getPieceBallPositions(piece);
        const prev = prevBallPositionsRef.current;
        if (prev) {
          const elapsed = now - lastDropTimeRef.current;
          const interval = st ? getSpeedInterval(now - st) : 1000;
          const t = Math.min(elapsed / interval, 1);
          for (let i = 0; i < 3; i++) {
            const to = posToCanvas(positions[i]);
            const x = prev[i].x + (to.x - prev[i].x) * t;
            const y = prev[i].y + (to.y - prev[i].y) * t;
            drawBall(ctx, x, y, piece.colors[i]);
          }
        } else {
          for (let i = 0; i < 3; i++) {
            const { x, y } = posToCanvas(positions[i]);
            drawBall(ctx, x, y, piece.colors[i]);
          }
        }
      }

      const stillSettling: SettlingBall[] = [];
      for (const sb of settlingBallsRef.current) {
        const elapsed = now - sb.startTime;
        if (elapsed < 0) {
          drawBall(ctx, sb.fromX, sb.fromY, sb.color);
          stillSettling.push(sb);
          continue;
        }
        const t = Math.min(elapsed / sb.duration, 1);
        const ex = easeOut(t);
        drawBall(ctx, sb.fromX + (sb.toX - sb.fromX) * ex, sb.fromY + (sb.toY - sb.fromY) * ex, sb.color);
        if (t < 1) { stillSettling.push(sb); }
        else { settlingPosRef.current.delete(`${sb.toRow},${sb.toCol}`); }
      }
      settlingBallsRef.current = stillSettling;

      const stillBursting: BurstBall[] = [];
      for (const bb of burstingRef.current) {
        const t = Math.min((now - bb.startTime) / bb.duration, 1);
        drawBurst(ctx, bb.x, bb.y, bb.color, t);
        if (t < 1) stillBursting.push(bb);
      }
      burstingRef.current = stillBursting;

      rafRef.current = requestAnimationFrame(render);
    }

    rafRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafRef.current);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_W}
      height={CANVAS_H}
      style={{ display: 'block', borderRadius: '12px', boxShadow: '0 4px 24px rgba(255,68,153,0.15)' }}
    />
  );
}
