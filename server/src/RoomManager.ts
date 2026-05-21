import type { GameState } from '@six-balls/shared';

type PlayerId = string;
type RoomCode = string;

interface Room {
  code: RoomCode;
  players: PlayerId[];
  ready: Set<PlayerId>;
  socketToPlayer: Map<string, PlayerId>;
  gameState: GameState | null;
}

export class RoomManager {
  private rooms: Map<RoomCode, Room> = new Map();
  private playerToRoom: Map<PlayerId, RoomCode> = new Map();

  generateCode(): RoomCode {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code: string;
    do {
      code = '';
      for (let i = 0; i < 6; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
      }
    } while (this.rooms.has(code));
    return code;
  }

  createRoom(playerId: PlayerId, socketId: string): RoomCode {
    const code = this.generateCode();
    const room: Room = {
      code,
      players: [playerId],
      ready: new Set(),
      socketToPlayer: new Map([[socketId, playerId]]),
      gameState: null,
    };
    this.rooms.set(code, room);
    this.playerToRoom.set(playerId, code);
    return code;
  }

  joinRoom(code: RoomCode, playerId: PlayerId, socketId: string): boolean {
    const room = this.rooms.get(code);
    if (!room || room.players.length >= 2) return false;

    room.players.push(playerId);
    room.socketToPlayer.set(socketId, playerId);
    this.playerToRoom.set(playerId, code);
    return true;
  }

  leaveRoom(playerId: PlayerId): RoomCode | null {
    const code = this.playerToRoom.get(playerId);
    if (!code) return null;

    const room = this.rooms.get(code);
    if (!room) return null;

    this.playerToRoom.delete(playerId);
    room.players = room.players.filter(p => p !== playerId);
    room.ready.delete(playerId);

    if (room.players.length === 0) {
      this.rooms.delete(code);
    }

    return code;
  }

  setReady(playerId: PlayerId): void {
    const code = this.playerToRoom.get(playerId);
    if (!code) return;
    const room = this.rooms.get(code);
    if (!room) return;
    room.ready.add(playerId);
  }

  isAllReady(code: RoomCode): boolean {
    const room = this.rooms.get(code);
    if (!room) return false;
    return room.players.length === 2 && room.ready.size === 2;
  }

  getRoom(code: RoomCode): Room | undefined {
    return this.rooms.get(code);
  }

  getRoomBySocketId(socketId: string): Room | undefined {
    for (const room of this.rooms.values()) {
      if (room.socketToPlayer.has(socketId)) return room;
    }
    return undefined;
  }

  getPlayerIdBySocket(socketId: string): PlayerId | undefined {
    for (const room of this.rooms.values()) {
      const playerId = room.socketToPlayer.get(socketId);
      if (playerId) return playerId;
    }
    return undefined;
  }
}
