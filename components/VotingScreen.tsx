import React, { useState, useEffect } from 'react';
import { Player, GameSettings } from '../types';

interface VotingScreenProps {
    players: Player[];
    onVote: (playerName: string) => void;
    settings: GameSettings;
}

const VOTING_TIME = 30; // seconds

const VotingScreen: React.FC<VotingScreenProps> = ({ players, onVote, settings }) => {
    const [timeLeft, setTimeLeft] = useState(VOTING_TIME);
    const [isExiting, setIsExiting] = useState(false);
    const isPlural = settings.numTramposos > 1;

    useEffect(() => {
        if (timeLeft <= 0 || isExiting) {
            return;
        }

        const timerId = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timerId);
    }, [timeLeft, isExiting]);

    const handleVoteClick = (playerName: string) => {
        if (isExiting) return;
        setIsExiting(true);
        setTimeout(() => {
            onVote(playerName);
        }, 800); // Wait for animations to complete
    };

    const radius = 56;
    const circumference = 2 * Math.PI * radius;
    const progress = (timeLeft / VOTING_TIME) * circumference;
    const strokeDashoffset = circumference - progress;

    let timerColorClass = 'text-slate-900 dark:text-white';
    let progressColorClass = 'stroke-violet-600';

    if (timeLeft <= 10) {
        timerColorClass = 'text-amber-500';
        progressColorClass = 'stroke-amber-500';
    }
    if (timeLeft <= 5) {
        timerColorClass = 'text-rose-500';
        progressColorClass = 'stroke-rose-500';
    }

    const entranceDelayBase = 100;

    return (
        <>
            {/* TENSION BACKGROUND EFFECT */}
            <div className="fixed inset-0 tension-bg pointer-events-none"></div>

            <div className="relative w-full max-w-md mx-auto bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm p-6 rounded-2xl shadow-lg space-y-4 text-center transition-colors duration-300 ring-1 ring-black/5 dark:ring-white/10">
                <div 
                    className={isExiting ? 'animate-fade-out-up' : 'animate-fade-in-down'}
                    style={{ animationDelay: isExiting ? '0ms' : `${entranceDelayBase}ms` }}
                >
                    <h1 className="text-3xl font-bold text-center font-orbitron tracking-wider text-slate-800 dark:text-white py-2">¿QUIÉN ES EL TRAMPOSO?</h1>
                    <p className="text-md text-slate-600 dark:text-slate-300">Voten para eliminar al jugador que creen que es {isPlural ? 'un tramposo' : 'el tramposo'}.</p>
                </div>

                {/* Visual Timer */}
                <div 
                    className={`relative w-40 h-40 mx-auto my-4 ${isExiting ? 'animate-scale-out' : 'animate-scale-in'}`}
                    style={{ animationDelay: isExiting ? '100ms' : `${entranceDelayBase + 150}ms` }}
                >
                    <svg className="w-full h-full" viewBox="0 0 120 120">
                        {/* Background Circle */}
                        <circle
                            cx="60"
                            cy="60"
                            r={radius}
                            fill="none"
                            strokeWidth="8"
                            className="stroke-slate-200 dark:stroke-slate-700"
                        />
                        {/* Progress Circle */}
                        <circle
                            cx="60"
                            cy="60"
                            r={radius}
                            fill="none"
                            strokeWidth="8"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            transform="rotate(-90 60 60)"
                            className={`transition-all duration-500 ease-linear ${progressColorClass}`}
                            strokeLinecap="round"
                        />
                    </svg>
                    <div className={`absolute inset-0 flex items-center justify-center text-5xl font-bold font-orbitron transition-colors duration-300 ${timerColorClass}`}>
                        {timeLeft}
                    </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    {players.map((player, index) => (
                        <button
                            key={player.name}
                            onClick={() => handleVoteClick(player.name)}
                            disabled={isExiting}
                            className={`p-4 bg-slate-100 dark:bg-slate-700/50 rounded-lg text-slate-800 dark:text-white font-semibold text-lg hover:bg-rose-200 dark:hover:bg-rose-900/50 transform hover:scale-105 hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-rose-500 ${isExiting ? 'animate-fade-out-down' : 'animate-fade-in-up'}`}
                            style={{ animationDelay: isExiting ? `${(players.length - 1 - index) * 50}ms` : `${entranceDelayBase + 300 + index * 100}ms` }}
                        >
                            {player.name}
                        </button>
                    ))}
                </div>
            </div>
        </>
    );
};

export default VotingScreen;