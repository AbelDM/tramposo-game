import React from 'react';
import { SpyIcon, UserIcon } from './icons';
import { GameSettings, GameMode } from '../types';

interface EndScreenProps {
    winner: 'civiles' | 'tramposos';
    tramposos: string[];
    secretWord: string;
    tramposoWord?: string;
    settings: GameSettings;
    onPlayAgain: () => void;
}

const ConfettiAnimation: React.FC<{ winner: 'civiles' | 'tramposos' }> = ({ winner }) => {
    const confettiCount = 150;
    const colors = {
        civiles: ['#06b6d4', '#22d3ee', '#67e8f9', '#a5f3fc', '#ffffff'], // Cyan palette + white
        tramposos: ['#f43f5e', '#fb7185', '#fda4af', '#fecdd3', '#ffffff'] // Rose palette + white
    };

    const confetti = Array.from({ length: confettiCount }).map((_, i) => {
        const style = {
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${3 + Math.random() * 5}s`,
            backgroundColor: colors[winner][Math.floor(Math.random() * colors[winner].length)],
            transform: `rotate(${Math.random() * 360}deg)`,
            width: `${Math.floor(Math.random() * 8) + 8}px`,
            height: `${Math.floor(Math.random() * 6) + 6}px`,
            opacity: 0,
        };
        return <div key={i} className="confetti-piece" style={style} />;
    });

    return <div className="fixed inset-0 overflow-hidden pointer-events-none z-50">{confetti}</div>;
};

const EndScreen: React.FC<EndScreenProps> = ({ winner, tramposos, secretWord, tramposoWord, settings, onPlayAgain }) => {
    const isTramposoWin = winner === 'tramposos';
    const isMysteryMode = settings.gameMode === GameMode.Mystery;
    const isPlural = tramposos.length > 1;

    const winnerTitleColor = isTramposoWin ? 'text-rose-500' : 'text-cyan-500 dark:text-cyan-400';

    // Dynamic titles based on winner and number of impostors
    let titleLine1 = '';
    let titleLine2 = '';

    if (isTramposoWin) {
        if (isPlural) {
            titleLine1 = '¡VICTORIAS DE LOS';
            titleLine2 = 'TRAMPOSOS!';
        } else {
            titleLine1 = '¡VICTORIA DEL';
            titleLine2 = 'TRAMPOSO!';
        }
    } else {
        titleLine1 = '¡VICTORIA DE LOS';
        titleLine2 = 'CIVILES!';
    }

    const winnerTitleSize = isTramposoWin ? 'text-4xl sm:text-5xl' : 'text-5xl sm:text-6xl';

    return (
        <>
            <ConfettiAnimation winner={winner} />
            <div className="w-full max-w-md mx-auto p-8 rounded-2xl shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm text-center animate-fade-in transition-colors duration-300 ring-1 ring-black/5 dark:ring-white/10">
                <div className="flex justify-center mb-4">
                    {isTramposoWin ? <SpyIcon className="w-24 h-24 text-rose-500" /> : <UserIcon className="w-24 h-24 text-cyan-500 dark:text-cyan-400" />}
                </div>
                <h1 className="text-xl font-bold text-slate-800 dark:text-white">{titleLine1}</h1>
                <h2 className={`break-words font-bold font-orbitron my-2 ${winnerTitleColor} ${winnerTitleSize}`}>
                    {titleLine2}
                </h2>
                
                <div className="my-8 bg-slate-100 dark:bg-slate-700/50 p-4 rounded-lg">
                    <p className="text-md text-slate-500 dark:text-slate-400">La palabra de los civiles era:</p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white tracking-wider">{secretWord}</p>
                    {tramposoWord && (
                        <>
                            <p className="text-md text-slate-500 dark:text-slate-400 mt-4">{
                                isMysteryMode
                                    ? (isPlural ? 'La palabra de los Sres. Truquito era:' : 'La palabra del Sr. Truquito era:')
                                    : (isPlural ? 'La pista de los Tramposos era:' : 'La pista del Tramposo era:')
                            }</p>
                            <p className="text-3xl font-bold text-amber-600 dark:text-amber-400 tracking-wider">{tramposoWord}</p>
                        </>
                    )}
                </div>

                <div className="my-8 bg-slate-100 dark:bg-slate-700/50 p-4 rounded-lg">
                    <p className="text-md text-slate-500 dark:text-slate-400">{
                        isMysteryMode
                            ? (isPlural ? 'Los Sres. Truquito (Tramposos) eran:' : 'El Sr. Truquito (Tramposo) era:')
                            : (isPlural ? 'Los tramposos eran:' : 'El tramposo era:')
                    }</p>
                    <div className="flex flex-wrap justify-center gap-x-4 mt-2">
                        {tramposos.map(tramposo => (
                            <p key={tramposo} className="text-xl font-bold text-rose-500">{tramposo}</p>
                        ))}
                    </div>
                </div>
                
                <button
                    onClick={onPlayAgain}
                    className="w-full bg-gradient-to-r from-purple-600 to-rose-600 hover:from-purple-700 hover:to-rose-700 text-white font-bold py-3 px-4 rounded-lg text-xl tracking-wider transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                    JUGAR DE NUEVO
                </button>
            </div>
        </>
    );
};

export default EndScreen;