# Six Balls Puzzle — Full Redesign Spec

**Date:** 2026-05-20
**Status:** Approved

## Overview

The current build is non-playable due to several critical bugs (pieces teleport to bottom, no keyboard controls in online mode, broken spawn position, shared piece index) and the UI/UX and rendering need a full redesign. This spec covers the complete rebuilt client game loop, new visual design, and the shared/server fixes needed to support it.

The shared game engine (`shared/`) is solid and well-tested (76 tests). The server structure is sound. The work is concentrated in the client game loop, rendering layer, and targeted fixes to `shared/src/piece.ts`, `shared/src/types.ts`, and `server/src/GameEngine.ts`.

---

## 1. Visual Design System

### Style: Vibrant & Playful

- **Page background:** soft pink-to-purple diagonal gradient (`#fff5fb` → `#f5f0ff`)
- **Board card:** white background, colored border (pink for local player, purple for opponent), 8px border-radius, soft drop shadow
- **Board grid:** subtle radial dot pattern inside each board card
- **Typography:** bold system-ui; title in hot-pink (`#ff4499`) with 2px text-shadow

### Ball Rendering

- Radial gradient sphere: highlight at 38% 32%, base color → saturated color
- White 3px border, colored drop shadow matching ball color
- 5 colors: red (`#ff3366`), purple (`#8833ff`), yellow (`#ffbb00`), blue (`#3366ff`), green (`#22bb55`)

### Ghost Piece

Dashed same-color circles drawn at the hard-drop destination, 25% opacity. Shows where the triangle will land.

---

## 2. Screen Layout

### Game Screen

```
┌──────────────────────────────────────────────────────┐
│           ✨ SIX BALLS PUZZLE ✨   (title, top)       │
├──────────────────────────────────────────────────────┤
│                                                      │
│  [HUD]  [  P1 Board  ]  VS  [  P2 Board  ]  [HUD]  │
│                                                      │
├──────────────────────────────────────────────────────┤
│   ← → move · ↑ rotate · ↓ soft drop · Space drop   │
└──────────────────────────────────────────────────────┘
```

- Title pinned top with divider line
- Controls guide pinned bottom with divider line
- Game area fills the middle: HUD column → board → VS → board → HUD column

### HUD Column (each player)

```
┌──────────┐
│  NEXT    │  ← triangle mini-preview (3 gradient balls)
│   ●      │
│  ● ●     │
├──────────┤
│ INCOMING │  ← attack queue: mini ball diagram of attack shape
│  ⬡⬡⬡  │     (hexagon cluster / 2 rows / pyramid)
│  ⬡ ⬡   │     "5 rings incoming" / "2 rows incoming" / "4 pyramids incoming"
│  ⬡⬡⬡  │     Shows "safe!" when queue is empty
├──────────┤
│  SCORE   │
│  4,200   │
└──────────┘
```

### Attack Queue Display

Shows the actual shape of the next incoming attack as a mini ball diagram — not just a count:
- **Hexagon ring:** 7-ball ring cluster with hollow center
- **Row attack:** 2 rows of 5 mixed-color balls
- **Pyramid:** 1+2+3 triangle of same-color balls
- **Empty:** "safe!" with muted dots

### Menu Screen

Vibrant style, centered card: title, "Create Room" button, "Join Room" input + button, "Local Play" button.

### Game Over Screen

Overlay on game screen: large "YOU WIN 🎉" or "YOU LOSE 😢" badge (centered, semi-transparent dark backdrop), Play Again button, Back to Menu button.

---

## 3. Game Loop Architecture

### Rendering Phases (Canvas + requestAnimationFrame)

The board uses a continuous `requestAnimationFrame` loop with **two distinct rendering phases**:

#### Phase 1 — Falling

The triangle piece has a continuous float Y position (`subRow: number`, range 0–1 within each row). Each frame:

```
subRow += fallSpeed * deltaTime
if subRow >= 1:
    subRow -= 1
    if canPlacePiece(grid, moveDown(piece)):
        piece.row -= 1   // advance one grid row
    else:
        trigger Phase 2  // can no longer fall
```

Render the piece at canvas Y = `rowToCanvasY(piece.row) + subRow * rowSpacing`.

The player can still move left/right and rotate during this phase (discrete column steps).

#### Phase 2 — Splitting & Settling

When the piece can no longer fall:

1. The 3 balls **separate** into individual animated balls at their current canvas positions
2. Call `landPiece(grid, piece)` to compute the final settled grid (using existing `applyGravity()`)
3. For each of the 3 balls, compute its animation path: current canvas position → final settled canvas position
4. Animate each ball independently: smooth slide along the gravity path, no bounce
5. Duration: ~250ms per ball (staggered 30ms apart by gravity order)
6. On completion: grid state is updated, pattern detection runs

### Fall Speed Schedule

Unchanged from existing design:

| Elapsed | Interval |
|---------|----------|
| 0–30s   | 1000ms   |
| 30–60s  | 800ms    |
| 60–120s | 600ms    |
| 120–180s| 450ms    |
| 180s+   | 300ms    |

### Burst Animation

Triggered when grid cells go from filled → empty (pattern cleared):

1. Ball **scales up to 1.45×** over 95ms
2. **8 particles** fly outward at 45° intervals (20–32px travel), fade out
3. **Expanding ring** at ball position, fades out
4. Ball removed cleanly — no ghost, no placeholder
5. Total duration: ~380ms, driven by `requestAnimationFrame`

---

## 4. Gameplay Bug Fixes

### Fix 1: Piece Spawn Position (`shared/src/piece.ts`)

**Current:** `row: GRID_HEIGHT - 1` = row 11 → rotation 0 places ball 0 at row 12 (out of bounds)

**Fix:** `row: GRID_HEIGHT - 2` = row 10 → ball 0 at row 11 (top of grid, valid)

### Fix 2: Per-Player Piece Index (`shared/src/types.ts`, `GameEngine.ts`, `localGame.ts`)

**Current:** One global `pieceIndex` in `GameState` — when one player lands, the other player's next piece shifts.

**Fix:** Move `pieceIndex` into `PlayerState`. Each player independently advances through the shared `pieceSequence`.

```typescript
// PlayerState gains:
pieceIndex: number;

// GameState loses:
// pieceIndex: number;  ← removed
```

### Fix 3: Auto-Fall Uses softDrop

**Current:** Auto-fall timer calls `hardDrop` → piece teleports to bottom instantly.

**Fix (local mode):** Timer calls `softDrop` per tick, advancing piece one logical row. Visual rendering (Phase 1 above) shows the smooth sub-row animation between ticks.

**Fix (online mode):** `handleAutoDrop` emits `'softDrop'` instead of `'hardDrop'`. Server advances piece one row and broadcasts state.

### Fix 4: Online Keyboard Controls (`client/src/App.tsx`)

**Current:** `useKeyboard` hook exists but is not used in online mode.

**Fix:** Wire `useKeyboard` in App.tsx when `screen === 'playing'`, emitting `playerInput` events to server for each action.

### Fix 5: Restart Flow

Add game-over screen with "Play Again" (rematch in same mode) and "Back to Menu" buttons.

---

## 5. File Change Summary

| File | Change |
|------|--------|
| `shared/src/piece.ts` | Spawn row 11 → 10 |
| `shared/src/types.ts` | Move `pieceIndex` into `PlayerState`, remove from `GameState` |
| `server/src/GameEngine.ts` | Use per-player `pieceIndex` in `createPlayerState` and `handlePieceLand` |
| `client/src/game/localGame.ts` | Use per-player `pieceIndex` |
| `client/src/hooks/useLocalGame.ts` | Timer uses `softDrop` not `hardDrop` |
| `client/src/App.tsx` | Wire `useKeyboard` for online mode, fix auto-drop to `softDrop`, add game-over screen, menu redesign |
| `client/src/components/Board.tsx` | Full rewrite: rAF game loop, continuous fall animation, split/settle animation, burst animation, vibrant visual style |
| `client/src/components/GameView.tsx` | Side-panel HUD layout, attack queue mini-diagram |
| `client/src/components/Menu.tsx` | Vibrant style redesign |
| `client/src/themes/themes.ts` | Update ball color palette to match new design |
| `shared/src/patterns.test.ts` | No change (already passing) |

---

## 6. Testing

- All 76 existing shared tests must continue to pass after `types.ts` and `piece.ts` changes
- Manual: local 2P — verify piece falls smoothly, balls settle into grid independently, burst animation plays on clear
- Manual: online — verify keyboard controls work, auto-fall steps down visually, rematch works
- Manual: verify ghost piece shows correct drop destination at all rotations
