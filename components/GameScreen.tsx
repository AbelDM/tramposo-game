import React, { useState, useEffect } from 'react';
import { GameSettings, Player } from '../types';
import { UserIcon } from './icons';

interface GameScreenProps {
    settings: GameSettings;
    players: Player[];
    onTimeUp: () => void;
}

const GameScreen: React.FC<GameScreenProps> = ({ settings, players, onTimeUp }) => {
    const [timeLeft, setTimeLeft] = useState(settings.timer);

    useEffect(() => {
        if (timeLeft <= 0) {
            onTimeUp();
            return;
        }

        const timerId = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timerId);
    }, [timeLeft, onTimeUp]);

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    return (
        <div className="w-full max-w-md mx-auto bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm p-6 rounded-2xl shadow-lg space-y-6 text-center animate-fade-in transition-colors duration-300 ring-1 ring-black/5 dark:ring-white/10">
            <div className="bg-slate-100 dark:bg-slate-900/50 p-2 rounded-lg">
                <p className="text-sm text-slate-500 dark:text-slate-400">Categoría</p>
                <h2 className="text-2xl font-bold text-violet-600 dark:text-violet-400">{settings.category}</h2>
            </div>

            <div>
                <h1 className="text-8xl font-bold font-orbitron text-slate-900 dark:text-white tracking-widest">
                    {minutes}:{seconds.toString().padStart(2, '0')}
                </h1>
                <p className="text-lg text-slate-600 dark:text-slate-300">
                    ¡Hablen y descubran a{settings.numTramposos > 1 ? ' los tramposos' : 'l tramposo'}!
                </p>
            </div>
            
            <div>
                <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-3">Jugadores Activos</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {players.filter(p => !p.isEliminated).map(player => (
                        <div key={player.name} className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700/50 p-2 rounded-lg">
                            <UserIcon className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                            <span className="text-slate-800 dark:text-white truncate">{player.name}</span>
                        </div>
                    ))}
                </div>
            </div>

             <button 
                onClick={onTimeUp}
                className="w-full mt-4 bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 px-4 rounded-lg text-xl tracking-wider font-orbitron transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
             >
                IR A VOTACIÓN
             </button>
        </div>
    );
};

export default GameScreen;