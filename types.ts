export enum GamePhase {
    Setup = 'setup',
    RoleReveal = 'roleReveal',
    Discussion = 'discussion',
    Voting = 'voting',
    End = 'end',
}

export enum Role {
    Civilian = 'Civilian',
    Tramposo = 'Tramposo',
}

export enum GameMode {
    Classic = 'Clásico',
    Mystery = 'Misterioso',
}

export interface Player {
    name: string;
    role: Role;
    isEliminated: boolean;
}

export interface GameSettings {
    numPlayers: number;
    numTramposos: number;
    category: string;
    timer: number; // in seconds
    gameMode: GameMode;
    tramposoHint?: boolean;
}

export interface GameState {
    gamePhase: GamePhase;
    players: Player[];
    settings: GameSettings | null;
    secretWord: string;
    tramposoWord?: string;
    tramposos: string[];
    winner: 'civiles' | 'tramposos' | null;
}