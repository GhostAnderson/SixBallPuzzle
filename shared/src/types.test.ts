import { describe, it, expect } from 'vitest';
import {
  BALL_COLORS,
  GRID_WIDTH_EVEN,
  GRID_WIDTH_ODD,
  GRID_HEIGHT
} from './types';

describe('types', () => {
  it('has 5 ball colors', () => {
    expect(BALL_COLORS).toHaveLength(5);
    expect(BALL_COLORS).toContain('red');
    expect(BALL_COLORS).toContain('purple');
    expect(BALL_COLORS).toContain('yellow');
    expect(BALL_COLORS).toContain('blue');
    expect(BALL_COLORS).toContain('green');
  });

  it('has correct grid dimensions', () => {
    expect(GRID_WIDTH_EVEN).toBe(10);
    expect(GRID_WIDTH_ODD).toBe(9);
    expect(GRID_HEIGHT).toBe(12);
  });
});
