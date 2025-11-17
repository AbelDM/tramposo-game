import React, { useState, useCallback, useEffect } from 'react';
import { GamePhase, Player, GameSettings, GameState, Role, GameMode } from './types';
import { WORD_CATEGORIES, MYSTERY_WORD_CATEGORIES } from './constants';
import SetupScreen from './components/SetupScreen';
import RoleRevealScreen from './components/RoleRevealScreen';
import GameScreen from './components/GameScreen';
import VotingScreen from './components/VotingScreen';
import EndScreen from './components/EndScreen';



const initialState: GameState = {
    gamePhase: GamePhase.Setup,
    players: [],
    settings: null,
    secretWord: '',
    tramposoWord: '',
    tramposos: [],
    winner: null,
};

const App: React.FC = () => {
    const [gameState, setGameState] = useState<GameState>(initialState);
    const [isLoading, setIsLoading] = useState(false);
    const [theme, setTheme] = useState(() => {
        if (typeof window !== 'undefined' && window.localStorage) {
            return window.localStorage.getItem('theme') || 'light';
        }
        return 'light';
    });

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const handleThemeToggle = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    const handleStartGame = useCallback((settings: GameSettings, playerNames: string[]) => {
        setIsLoading(true);
        try {












            const shuffledPlayers = [...playerNames].sort(() => Math.random() - 0.5);
            const tramposoNames = shuffledPlayers.slice(0, settings.numTramposos);

            const players: Player[] = playerNames.map(name => ({
                name,
                role: tramposoNames.includes(name) ? Role.Tramposo : Role.Civilian,
                isEliminated: false,
            }));

            let secretWord = '';
            let tramposoWord: string | undefined = undefined;
            const useMysteryWords = settings.gameMode === GameMode.Mystery || (settings.gameMode === GameMode.Classic && settings.tramposoHint);

            if (settings.category === "Aleatorio") {
                 if (useMysteryWords) {
                    const allWords = Object.entries(MYSTERY_WORD_CATEGORIES)
                        .filter(([key]) => key !== 'Aleatorio')
                        .flatMap(([, words]) => words);
                    if (!allWords || allWords.length === 0) throw new Error("No hay palabras en las categorías de misterio.");
                    const wordPair = allWords[Math.floor(Math.random() * allWords.length)];















                    secretWord = wordPair[0];
                    tramposoWord = wordPair[1];
                } else {
                    const allWords = Object.entries(WORD_CATEGORIES)
                        .filter(([key]) => key !== 'Aleatorio')
                        .flatMap(([, words]) => words);
                    if (!allWords || allWords.length === 0) throw new Error("No hay palabras en las categorías clásicas.");
                    secretWord = allWords[Math.floor(Math.random() * allWords.length)];










                }

            } else {
                 if (useMysteryWords) {
                    const categoryWords = MYSTERY_WORD_CATEGORIES[settings.category];
                    const wordPair = categoryWords[Math.floor(Math.random() * categoryWords.length)];
                    secretWord = wordPair[0];
                    tramposoWord = wordPair[1];
                } else {
                    const categoryWords = WORD_CATEGORIES[settings.category];
                    secretWord = categoryWords[Math.floor(Math.random() * categoryWords.length)];







                }
            }


            setGameState({
                gamePhase: GamePhase.RoleReveal,
                players,
                settings,
                secretWord,
                tramposoWord,
                tramposos: tramposoNames,
                winner: null,
            });
        } catch (error) {
            console.error("Error al iniciar el juego:", error);
            alert("Ocurrió un error al iniciar el juego. Por favor, inténtalo de nuevo.");


















        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleRolesRevealed = useCallback(() => {
        setGameState(prev => ({ ...prev, gamePhase: GamePhase.Discussion }));
    }, []);

    const handleTimeUp = useCallback(() => {
        setGameState(prev => ({ ...prev, gamePhase: GamePhase.Voting }));
    }, []);

    const handleVote = useCallback((eliminatedPlayerName: string) => {
        // 1. Crear la lista de jugadores actualizada con el eliminado marcado.
        const updatedPlayers = gameState.players.map(p => 
            p.name === eliminatedPlayerName ? { ...p, isEliminated: true } : p
        );

        // 2. Calcular los jugadores activos restantes para cada rol.
        const remainingTramposos = updatedPlayers.filter(p => p.role === Role.Tramposo && !p.isEliminated);
        const remainingCivilians = updatedPlayers.filter(p => p.role === Role.Civilian && !p.isEliminated);

        // 3. Determinar si hay un ganador.
        let gameWinner: 'civiles' | 'tramposos' | null = null;
        if (remainingTramposos.length === 0) {
            gameWinner = 'civiles';
        } else if (remainingTramposos.length >= remainingCivilians.length) {
            gameWinner = 'tramposos';
        }

        // 4. Actualizar el estado del juego.
        if (gameWinner) {
            // Si hay un ganador, finalizar el juego.
            setGameState(prev => ({
                ...prev,
                players: updatedPlayers,
                winner: gameWinner,
                gamePhase: GamePhase.End,
            }));
        } else {
            // De lo contrario, continuar a la siguiente ronda de votación.
            setGameState(prev => ({ 
                ...prev, 
                players: updatedPlayers, 
                gamePhase: GamePhase.Voting 
            })); 
        }
    }, [gameState.players]);

    const handlePlayAgain = useCallback(() => {
        setGameState(initialState);
    }, []);

    const renderScreen = () => {
        switch (gameState.gamePhase) {
            case GamePhase.Setup:
                return <SetupScreen onStartGame={handleStartGame} isLoading={isLoading} theme={theme} onToggle={handleThemeToggle} />;
            case GamePhase.RoleReveal:
                return <RoleRevealScreen 
                    players={gameState.players} 
                    secretWord={gameState.secretWord} 
                    tramposoWord={gameState.tramposoWord}
                    settings={gameState.settings!}
                    onRevealComplete={handleRolesRevealed} 
                />;
            case GamePhase.Discussion:
                return <GameScreen settings={gameState.settings!} onTimeUp={handleTimeUp} players={gameState.players} />;
            case GamePhase.Voting:
                return <VotingScreen settings={gameState.settings!} players={gameState.players.filter(p => !p.isEliminated)} onVote={handleVote} />;
            case GamePhase.End:
                return <EndScreen 
                    winner={gameState.winner!} 
                    tramposos={gameState.tramposos} 
                    secretWord={gameState.secretWord}
                    tramposoWord={gameState.tramposoWord}
                    settings={gameState.settings!} 
                    onPlayAgain={handlePlayAgain} 
                />;
            default:
                return <SetupScreen onStartGame={handleStartGame} isLoading={isLoading} theme={theme} onToggle={handleThemeToggle} />;
        }
    };

    return (
        <main className="text-slate-800 dark:text-slate-200 min-h-screen flex flex-col items-center p-4 transition-colors duration-300">
            <div className="w-full max-w-md mx-auto flex-grow flex flex-col pt-1 pb-6">
                {renderScreen()}
            </div>
        </main>
    );
};

export default App;