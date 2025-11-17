import React, { useState, useCallback, useEffect } from 'react';
import { GamePhase, Player, GameSettings, GameState, Role, GameMode } from './types';
import { WORD_CATEGORIES, MYSTERY_WORD_CATEGORIES } from './constants';
import SetupScreen from './components/SetupScreen';
import RoleRevealScreen from './components/RoleRevealScreen';
import GameScreen from './components/GameScreen';
import VotingScreen from './components/VotingScreen';
import EndScreen from './components/EndScreen';
import { GoogleGenAI, Type } from "@google/genai";


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

    const handleStartGame = useCallback(async (settings: GameSettings, playerNames: string[]) => {
        setIsLoading(true);
        try {
            if (settings.category === "Aleatorio (IA)") {
                // In a browser environment, we must use window.aistudio to select an API key.
                const aistudio = (window as any).aistudio;
                if (aistudio && typeof aistudio.hasSelectedApiKey === 'function') {
                    const hasKey = await aistudio.hasSelectedApiKey();
                    if (!hasKey) {
                        await aistudio.openSelectKey();
                        // Per guidelines, assume key selection is successful and proceed.
                    }
                }
            }

            const shuffledPlayers = [...playerNames].sort(() => Math.random() - 0.5);
            const tramposoNames = shuffledPlayers.slice(0, settings.numTramposos);
            
            const players: Player[] = playerNames.map(name => ({
                name,
                role: tramposoNames.includes(name) ? Role.Tramposo : Role.Civilian,
                isEliminated: false,
            }));

            let secretWord = '';
            let tramposoWord: string | undefined = undefined;

            if (settings.category === "Aleatorio (IA)") {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                const needsPair = settings.gameMode === GameMode.Mystery || (settings.gameMode === GameMode.Classic && settings.tramposoHint);

                if (needsPair) {
                    const prompt = "Genera una lista de 10 pares de palabras en español para un juego de roles ocultos. Cada par debe consistir en un sustantivo común y un sustantivo relacionado pero diferente. El segundo puede ser una pista para el primero. Devuelve la respuesta como un array de arrays de strings JSON, como [['palabra1', 'pista1'], ['palabra2', 'pista2']].";
                    const response = await ai.models.generateContent({
                        model: 'gemini-2.5-flash',
                        contents: prompt,
                        config: {
                            responseMimeType: "application/json",
                            responseSchema: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.ARRAY,
                                    items: { type: Type.STRING },
                                },
                            },
                        },
                    });
                    const wordPairs = JSON.parse(response.text.trim());
                    if (!wordPairs || wordPairs.length === 0) throw new Error("Generated words are empty.");
                    const wordPair = wordPairs[Math.floor(Math.random() * wordPairs.length)];
                    secretWord = wordPair[0];
                    tramposoWord = wordPair[1];
                } else { // Classic mode without hint
                    const prompt = "Genera una lista de 20 sustantivos aleatorios en español para un juego de roles ocultos. Deben ser de temática general, moderadamente difíciles y no demasiado obvios. Devuelve la respuesta como un array de strings JSON.";
                     const response = await ai.models.generateContent({
                        model: 'gemini-2.5-flash',
                        contents: prompt,
                        config: {
                            responseMimeType: "application/json",
                            responseSchema: {
                                type: Type.ARRAY,
                                items: { type: Type.STRING },
                            },
                        },
                    });
                    const words = JSON.parse(response.text.trim());
                    if (!words || words.length === 0) throw new Error("Generated words are empty.");
                    secretWord = words[Math.floor(Math.random() * words.length)];
                }

            } else {
                 if (settings.gameMode === GameMode.Mystery) {
                    const categoryWords = MYSTERY_WORD_CATEGORIES[settings.category];
                    const wordPair = categoryWords[Math.floor(Math.random() * categoryWords.length)];
                    secretWord = wordPair[0];
                    tramposoWord = wordPair[1];
                } else { // Classic mode
                    if (settings.tramposoHint) {
                        const categoryWords = MYSTERY_WORD_CATEGORIES[settings.category];
                        const wordPair = categoryWords[Math.floor(Math.random() * categoryWords.length)];
                        secretWord = wordPair[0];
                        tramposoWord = wordPair[1];
                    } else {
                        const categoryWords = WORD_CATEGORIES[settings.category];
                        secretWord = categoryWords[Math.floor(Math.random() * categoryWords.length)];
                    }
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
            console.error("Error al iniciar el juego o generar palabras:", error);
            let errorMessage = "No se pudieron generar las palabras desde la IA. ";

            if (error instanceof Error) {
                if (error.message.toLowerCase().includes("api key") || error.message.includes("requested entity was not found")) {
                    errorMessage += "Se requiere una clave de API. Por favor, selecciona una clave válida e inténtalo de nuevo. ";
                } else if (error instanceof SyntaxError) {
                    errorMessage += "La respuesta del modelo no tuvo el formato esperado (JSON inválido). ";
                } else if (error.message.includes("Generated words are empty")) {
                    errorMessage += "La IA no devolvió ninguna palabra. ";
                }
                else {
                    errorMessage += "Ocurrió un error de red o del servidor. ";
                }
            } else {
                errorMessage += "Ocurrió un error desconocido. ";
            }

            errorMessage += "Puedes reintentarlo o elegir otra categoría.";
            alert(errorMessage);
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
            <div className="w-full max-w-md mx-auto flex-grow flex flex-col py-8">
                {renderScreen()}
            </div>
        </main>
    );
};

export default App;