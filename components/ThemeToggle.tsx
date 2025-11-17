import React from 'react';
import { SunIcon, MoonIcon } from './icons';

interface ThemeToggleProps {
    theme: string;
    onToggle: () => void;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, onToggle }) => {
    return (
        <button
            onClick={onToggle}
            className="fixed top-4 right-4 z-50 p-2 rounded-full bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm text-slate-800 dark:text-slate-200 hover:bg-white/80 dark:hover:bg-slate-700/80 transition-colors duration-300 ring-1 ring-black/5 dark:ring-white/10"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
            {theme === 'light' ? (
                <MoonIcon className="w-6 h-6" />
            ) : (
                <SunIcon className="w-6 h-6" />
            )}
        </button>
    );
};

export default ThemeToggle;