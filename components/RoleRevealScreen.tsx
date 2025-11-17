import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Player, Role, GameSettings, GameMode } from '../types';
import { UserIcon, SpyIcon, ChevronDoubleUpIcon } from './icons';

interface RoleRevealScreenProps {
    players: Player[];
    secretWord: string;
    tramposoWord?: string;
    settings: GameSettings;
    onRevealComplete: () => void;
}

const RoleRevealScreen: React.FC<RoleRevealScreenProps> = ({ players, secretWord, tramposoWord, settings, onRevealComplete }) => {
    const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
    const [curtainTranslateY, setCurtainTranslateY] = useState(0);
    const [isRevealed, setIsRevealed] = useState(false); // Controls "Next Player" button visibility
    const [revealCount, setRevealCount] = useState(0);
    const MAX_REVEALS = 3;

    const cardRef = useRef<HTMLDivElement>(null);
    const isDraggingRef = useRef(false);
    const dragStartRef = useRef({ y: 0, initialTranslateY: 0 });

    const currentPlayer = players[currentPlayerIndex];
    const isTramposo = currentPlayer.role === Role.Tramposo;
    const isMysteryMode = settings.gameMode === GameMode.Mystery;
    const isLockedOpen = revealCount >= MAX_REVEALS;

    const handleNextPlayer = useCallback(() => {
        if (currentPlayerIndex < players.length - 1) {
            setCurrentPlayerIndex(prev => prev + 1);
        } else {
            onRevealComplete();
        }
    }, [currentPlayerIndex, players.length, onRevealComplete]);

    // Reset curtain and revealed state when player changes
    useEffect(() => {
        setCurtainTranslateY(0);
        setIsRevealed(false);
        setRevealCount(0);
    }, [currentPlayerIndex]);

    const handleDragMove = useCallback((e: MouseEvent | TouchEvent) => {
        if (!isDraggingRef.current) return;
        
        const currentY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        const deltaY = currentY - dragStartRef.current.y;
        let newY = dragStartRef.current.initialTranslateY + deltaY;

        const cardHeight = cardRef.current?.offsetHeight || 400;
        newY = Math.max(-cardHeight, Math.min(0, newY)); // Clamp movement
        setCurtainTranslateY(newY);

        // Automatically show button when curtain is dragged past a threshold
        if (newY < -cardHeight * 0.3) {
            setIsRevealed(true);
        }
    }, []);

    const handleDragEnd = useCallback(() => {
        if (!isDraggingRef.current) return;
        isDraggingRef.current = false;

        const cardHeight = cardRef.current?.offsetHeight || 400;
        const wasClosed = dragStartRef.current.initialTranslateY > -5; // Tolerance
        const snapToOpen = curtainTranslateY < -cardHeight * 0.3;
        
        if (snapToOpen) {
            setCurtainTranslateY(-cardHeight);
            setIsRevealed(true);
            
            if (wasClosed) {
                setRevealCount(prev => prev + 1);
            }
        } else {
             // Snap back to closed if not dragged far enough and not locked open
            if (!isLockedOpen) {
                 setCurtainTranslateY(0);
            }
        }
        
        window.removeEventListener('mousemove', handleDragMove);
        window.removeEventListener('touchmove', handleDragMove);
        window.removeEventListener('mouseup', handleDragEnd);
        window.removeEventListener('touchend', handleDragEnd);
    }, [curtainTranslateY, handleDragMove, isLockedOpen]);
    
    const handleDragStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        if (isLockedOpen) return;

        isDraggingRef.current = true;
        e.preventDefault();
        
        const startY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        dragStartRef.current = { y: startY, initialTranslateY: curtainTranslateY };
        
        window.addEventListener('mousemove', handleDragMove);
        window.addEventListener('touchmove', handleDragMove);
        window.addEventListener('mouseup', handleDragEnd);
        window.addEventListener('touchend', handleDragEnd);
    }, [curtainTranslateY, handleDragEnd, handleDragMove, isLockedOpen]);


    const CardContent = () => (
         isMysteryMode ? (
            <>
                <h2 className="text-lg text-slate-600 dark:text-slate-400">Memoriza tu palabra:</h2>
                <div className="my-6 bg-slate-100 dark:bg-slate-700/50 p-4 rounded-lg">
                    <p className="text-3xl font-bold text-slate-900 dark:text-white tracking-wider">
                        {isTramposo ? tramposoWord : secretWord}
                    </p>
                </div>
                <p className="text-md text-slate-500 dark:text-slate-300">
                    {settings.numTramposos > 1 ? 'Algunos jugadores tienen una palabra ligeramente diferente. ¡Descúbrelos!' : 'Alguien tiene una palabra ligeramente diferente. ¡Descúbrelo!'}
                </p>
            </>
        ) : (
            <>
                <h2 className="text-lg text-slate-600 dark:text-slate-400">Tu rol es...</h2>
                <div className="flex justify-center my-4">
                    {isTramposo ? <SpyIcon className="w-24 h-24 text-rose-500" /> : <UserIcon className="w-24 h-24 text-cyan-500 dark:text-cyan-400" />}
                </div>
                <h1 className={`text-5xl font-bold font-orbitron ${isTramposo ? 'text-rose-500' : 'text-cyan-500 dark:text-cyan-400'}`}>
                    {isTramposo ? 'TRAMPOSO' : 'CIVIL'}
                </h1>
                {!isTramposo && (
                    <div className="mt-6 bg-slate-100 dark:bg-slate-700/50 p-4 rounded-lg">
                        <p className="text-md text-slate-500 dark:text-slate-400">La palabra secreta es:</p>
                        <p className="text-3xl font-bold text-slate-900 dark:text-white tracking-wider">{secretWord}</p>
                    </div>
                )}
                {isTramposo && settings.tramposoHint && tramposoWord && (
                     <div className="mt-6 bg-slate-100 dark:bg-slate-700/50 p-4 rounded-lg">
                        <p className="text-md text-slate-500 dark:text-slate-400">Tu palabra de pista es:</p>
                        <p className="text-3xl font-bold text-amber-500 dark:text-amber-400 tracking-wider">{tramposoWord}</p>
                    </div>
                )}
                {isTramposo && !settings.tramposoHint && (
                     <p className="mt-6 text-lg text-rose-700 dark:text-rose-400">¡Descubre la palabra secreta y no dejes que te atrapen!</p>
                )}
            </>
        )
    );

    return (
        <div className="flex flex-col items-center justify-start h-full text-center animate-fade-in pt-4 md:pt-8">
            <div className="w-full max-w-md mb-6">
                 <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Pasa el dispositivo a:</h2>
                 <p className="text-4xl font-bold text-violet-600 dark:text-violet-400 my-4 font-orbitron">{currentPlayer.name}</p>
                 <p className="text-sm text-slate-500 dark:text-slate-400">No dejes que los demás vean.</p>
            </div>

            <div 
                ref={cardRef} 
                className="relative w-full max-w-md bg-white/80 dark:bg-slate-800/80 rounded-2xl shadow-lg overflow-hidden ring-1 ring-black/5 dark:ring-white/10"
            >
                {/* The content underneath */}
                <div className="p-8 text-center min-h-[320px] flex flex-col justify-center">
                    <CardContent />
                </div>

                {/* The draggable curtain */}
                <div
                    className={`absolute inset-0 bg-gradient-to-br from-violet-600 to-purple-700 text-white flex flex-col items-center justify-center p-6 text-center select-none ${isLockedOpen ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'} ${!isDraggingRef.current ? 'transition-transform duration-300 ease-out' : ''}`}
                    style={{ transform: `translateY(${curtainTranslateY}px)` }}
                    onMouseDown={handleDragStart}
                    onTouchStart={handleDragStart}
                >
                    <div className={`transition-opacity duration-300 ${curtainTranslateY < -10 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                        <ChevronDoubleUpIcon className="w-10 h-10 text-white/80 animate-bounce mx-auto"/>
                        <p className="mt-4 text-xl font-bold tracking-wider uppercase">Desliza para revelar</p>
                    </div>

                    {!isLockedOpen && (
                         <div className="absolute bottom-6 text-white/70 text-sm font-semibold tracking-wider">
                            Intentos restantes: {MAX_REVEALS - revealCount}
                        </div>
                    )}
                </div>
            </div>

            <div className="w-full max-w-md mt-6 h-16 flex items-center justify-center">
                {isRevealed && (
                    <button
                        onClick={handleNextPlayer}
                        className="w-full bg-gradient-to-r from-purple-600 to-rose-600 hover:from-purple-700 hover:to-rose-700 text-white font-bold py-3 px-4 rounded-xl text-lg tracking-wider font-orbitron transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 animate-fade-in"
                    >
                        {currentPlayerIndex === players.length - 1 ? 'Empezar a Jugar' : 'Pasar al Siguiente Jugador'}
                    </button>
                )}
            </div>
        </div>
    );
};

export default RoleRevealScreen;