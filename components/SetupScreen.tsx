import React, { useState, useMemo, useEffect } from 'react';
import { GameSettings, GameMode } from '../types';
import { WORD_CATEGORIES, MIN_PLAYERS, MAX_PLAYERS } from '../constants';
import { PlusIcon, TrashIcon, UsersIcon, BookOpenIcon, SpyIcon, GameModeIcon, TimerIcon, HintIcon, CategoryIcon, ChevronRightIcon, LoadingSpinnerIcon, InfoIcon, SunIcon, MoonIcon, GiftIcon, MailIcon, ShareIcon, GraduationCapIcon } from './icons';
import RulesModal from './RulesModal';
import FeedbackModal from './FeedbackModal';
import DonateModal from './DonateModal';
import LogoIcon from './LogoIcon';
import InteractiveTutorial from './InteractiveTutorial';

const AboutModal: React.FC<{ isOpen: boolean; onClose: () => void; }> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in"
            onClick={onClose}
        >
            <div 
                className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-lg w-full space-y-6 shadow-2xl max-h-[90vh] flex flex-col ring-1 ring-black/5 dark:ring-white/10"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="text-center space-y-4">
                    <InfoIcon className="w-16 h-16 mx-auto text-violet-500" />
                    <h2 className="text-3xl font-bold text-violet-600 dark:text-violet-400 font-orbitron">Sobre Tramposo</h2>
                    <p className="text-slate-600 dark:text-slate-300">
                        Un juego con roles ocultos, engaño y deducción social.
                    </p>
                    <div className="pt-4 text-sm text-slate-500 dark:text-slate-400">
                         <p>Versión 1.1.0</p>
                         <p>Creado con <span role="img" aria-label="corazón" className="text-rose-500">❤️</span> por AbelDM</p>
                         <p className="mt-2">Última actualización: 24 de Julio, 2024</p>
                    </div>
                </div>
                
                <button
                    onClick={onClose}
                    className="w-full mt-auto bg-violet-600 hover:bg-violet-700 text-white font-bold py-2 px-4 rounded-lg text-lg transition-colors"
                >
                    Cerrar
                </button>
            </div>
        </div>
    );
};

interface SetupScreenProps {
    onStartGame: (settings: GameSettings, players: string[]) => void;
    isLoading?: boolean;
    theme: string;
    onToggle: () => void;
}

type ModalType = 'gameMode' | 'players' | 'tramposos' | 'hint' | 'category' | 'timer' | null;

const tutorialSteps = [
    { selector: '[data-tutorial-id="title"]', title: '¡Bienvenido a Tramposo!', content: 'Este es un juego de engaño y deducción social. ¡Vamos a repasar rápidamente cómo configurar tu primera partida!', placement: 'bottom' as const },
    { selector: '[data-tutorial-id="game-mode"]', title: '1. Modo de Juego', content: 'Elige entre el modo Clásico (el tramposo debe adivinar la palabra) o Misterioso (todos tienen una palabra y deben encontrar la que es diferente).', placement: 'bottom' as const },
    { selector: '[data-tutorial-id="players"]', title: '2. Jugadores', content: 'Aquí puedes añadir, eliminar y cambiar el nombre de los jugadores. Se necesita un mínimo de 3 para jugar.', placement: 'bottom' as const },
    { selector: '[data-tutorial-id="tramposos"]', title: '3. Número de Tramposos', content: 'Define cuántos tramposos habrá en la partida. ¡A más tramposos, más caos!', placement: 'top' as const },
    { selector: '[data-tutorial-id="category"]', title: '4. Categoría de Palabras', content: 'Elige un tema para la palabra secreta. ¡Prueba "Aleatorio (IA)" para que la IA genere palabras únicas!', placement: 'top' as const },
    { selector: '[data-tutorial-id="timer"]', title: '5. Tiempo de Debate', content: 'Establece un límite de tiempo para que todos discutan y den sus pistas antes de la votación.', placement: 'top' as const },
    { selector: '[data-tutorial-id="how-to-play"]', title: 'Cómo Jugar', content: 'Si alguna vez necesitas un recordatorio de las reglas completas, puedes encontrarlas aquí.', placement: 'top' as const },
    { selector: '[data-tutorial-id="start-game"]', title: '¡A Jugar!', content: 'Cuando todo esté listo, presiona este botón para comenzar la partida. ¡Buena suerte!', placement: 'top' as const },
];

const SetupScreen: React.FC<SetupScreenProps> = ({ onStartGame, isLoading = false, theme, onToggle }) => {
    const [players, setPlayers] = useState<string[]>(() => {
        try {
            const saved = localStorage.getItem('tramposo_players');
            const parsed = saved ? JSON.parse(saved) : null;
            if (Array.isArray(parsed) && parsed.length >= MIN_PLAYERS && parsed.length <= MAX_PLAYERS) {
                return parsed;
            }
        } catch (e) { console.error("Error loading players from localStorage", e); }
        return ['Jugador 1', 'Jugador 2', 'Jugador 3'];
    });
    const [newPlayerName, setNewPlayerName] = useState('');
    const [numTramposos, setNumTramposos] = useState(() => {
        const saved = localStorage.getItem('tramposo_numTramposos');
        return saved ? parseInt(saved, 10) : 1;
    });
    const [category, setCategory] = useState(() => {
        const saved = localStorage.getItem('tramposo_category');
        return (saved && WORD_CATEGORIES[saved]) ? saved : Object.keys(WORD_CATEGORIES)[0];
    });
    const [timer, setTimer] = useState(() => {
        const saved = localStorage.getItem('tramposo_timer');
        const parsed = saved ? parseInt(saved, 10) : 180;
        return (parsed >= 60 && parsed <= 900) ? parsed : 180;
    });
    const [gameMode, setGameMode] = useState<GameMode>(() => {
        const saved = localStorage.getItem('tramposo_gameMode');
        return (saved === GameMode.Classic || saved === GameMode.Mystery) ? saved as GameMode : GameMode.Classic;
    });
    const [tramposoHint, setTramposoHint] = useState(() => {
        const saved = localStorage.getItem('tramposo_tramposoHint');
        return saved ? saved === 'true' : true;
    });

    const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
    const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
    const [isDonateModalOpen, setIsDonateModalOpen] = useState(false);
    const [activeModal, setActiveModal] = useState<ModalType>(null);
    const [showCopiedMessage, setShowCopiedMessage] = useState(false);
    const [isTutorialActive, setIsTutorialActive] = useState(false);
    const [tutorialStep, setTutorialStep] = useState(0);
    const [showTutorialPrompt, setShowTutorialPrompt] = useState(false);

    const maxTramposos = useMemo(() => Math.max(1, Math.floor((players.length - 1) / 2)), [players.length]);

    useEffect(() => {
        const tutorialSeen = localStorage.getItem('tramposo_tutorial_seen');
        if (!tutorialSeen) {
            setShowTutorialPrompt(true);
        }
    }, []);
    
    // Effect to save settings to localStorage whenever they change
    useEffect(() => {
        try {
            localStorage.setItem('tramposo_players', JSON.stringify(players));
            localStorage.setItem('tramposo_numTramposos', String(numTramposos));
            localStorage.setItem('tramposo_category', category);
            localStorage.setItem('tramposo_timer', String(timer));
            localStorage.setItem('tramposo_gameMode', gameMode);
            localStorage.setItem('tramposo_tramposoHint', String(tramposoHint));
        } catch (error) {
            console.error("Failed to save game settings:", error);
        }
    }, [players, numTramposos, category, timer, gameMode, tramposoHint]);

    // Effect to validate numTramposos when players list changes or on initial load
    useEffect(() => {
        if (numTramposos > maxTramposos) {
            setNumTramposos(maxTramposos);
        } else if (numTramposos < 1) {
            setNumTramposos(1);
        }
    }, [players.length, numTramposos, maxTramposos]);


    useEffect(() => {
        if (players.length < MAX_PLAYERS) {
            setNewPlayerName(`Jugador ${players.length + 1}`);
        } else {
            setNewPlayerName('');
        }
    }, [players.length]);

    const handlePlayerNameChange = (index: number, newName: string) => {
        const updatedPlayers = [...players];
        updatedPlayers[index] = newName;
        setPlayers(updatedPlayers);
    };

    const handleAddPlayer = () => {
        if (newPlayerName.trim() && players.length < MAX_PLAYERS) {
            setPlayers([...players, newPlayerName.trim()]);
        }
    };
    
    const handleRemovePlayer = (index: number) => {
        const updatedPlayers = players.filter((_, i) => i !== index);
        setPlayers(updatedPlayers);
        // Validation is handled by the useEffect hook now.
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (players.length >= MIN_PLAYERS && players.every(p => p.trim() !== '')) {
            onStartGame({
                numPlayers: players.length,
                numTramposos: numTramposos,
                category,
                timer,
                gameMode,
                tramposoHint: gameMode === GameMode.Classic ? tramposoHint : true,
            }, players.map(p => p.trim()));
        }
    };

    const handleShare = async () => {
        const shareData = {
            title: 'Tramposo',
            text: '¡Juega Tramposo! Un divertido juego de engaño y deducción social.',
            url: 'https://tramposogame.netlify.app/',
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.error("Error al compartir:", err);
            }
        } else {
            try {
                await navigator.clipboard.writeText(shareData.url);
                setShowCopiedMessage(true);
                setTimeout(() => setShowCopiedMessage(false), 2000);
            } catch (err) {
                console.error("No se pudo copiar el enlace:", err);
                alert("No se pudo copiar el enlace. Por favor, cópialo manualmente desde la barra de direcciones.");
            }
        }
    };

    const isStartDisabled = useMemo(() => {
        return players.length < MIN_PLAYERS || players.some(p => p.trim() === '');
    }, [players]);

    const startTutorial = () => {
        setTutorialStep(0);
        setIsTutorialActive(true);
        setShowTutorialPrompt(false);
        localStorage.setItem('tramposo_tutorial_seen', 'true');
    };

    const handleTutorialNext = () => {
        if (tutorialStep < tutorialSteps.length - 1) {
            setTutorialStep(prev => prev + 1);
        } else {
            setIsTutorialActive(false);
        }
    };

    const handleTutorialPrev = () => {
        setTutorialStep(prev => Math.max(0, prev - 1));
    };

    const handleTutorialEnd = () => {
        setIsTutorialActive(false);
        localStorage.setItem('tramposo_tutorial_seen', 'true');
    };
    
    const dismissTutorialPrompt = () => {
        setShowTutorialPrompt(false);
        localStorage.setItem('tramposo_tutorial_seen', 'true');
    }

    const SettingItem: React.FC<{ icon: React.ReactElement<{ className?: string }>; label: string; value: string; onClick: () => void }> = ({ icon, label, value, onClick }) => (
        <button
            type="button"
            onClick={onClick}
            className="w-full flex items-center justify-between text-left p-3 bg-white/50 dark:bg-slate-900/50 rounded-xl hover:bg-white/80 dark:hover:bg-slate-900/70 transition-all focus:outline-none focus:ring-2 focus:ring-violet-500"
        >
            <div className="flex items-center gap-4">
                {React.cloneElement(icon, { className: `w-8 h-8 ${icon.props.className || ''}` })}
                <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{label}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{value}</p>
                </div>
            </div>
            <ChevronRightIcon className="h-6 w-6 text-slate-400 dark:text-slate-500" />
        </button>
    );

    const renderModalContent = () => {
        switch (activeModal) {
            case 'gameMode': return (
                <>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Modo de Juego</h3>
                    <div className="flex bg-slate-200 dark:bg-slate-900 rounded-lg p-1">
                        <button type="button" onClick={() => setGameMode(GameMode.Classic)} className={`w-1/2 p-2 rounded-md font-bold transition-colors ${gameMode === GameMode.Classic ? 'bg-violet-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'}`}>Clásico</button>
                        <button type="button" onClick={() => setGameMode(GameMode.Mystery)} className={`w-1/2 p-2 rounded-md font-bold transition-colors ${gameMode === GameMode.Mystery ? 'bg-violet-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'}`}>Misterioso</button>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 px-1 pt-2 h-16">{gameMode === GameMode.Classic ? "El tramposo sabe su rol y debe descubrir la palabra." : "Nadie sabe su rol. El tramposo (Sr. Truquito) recibe una palabra similar."}</p>
                </>
            );
            case 'players': return (
                 <>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Jugadores ({players.length})</h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                        {players.map((player, index) => (
                            <div key={index} className="flex items-center justify-between bg-slate-100 dark:bg-slate-700 p-2 rounded-lg gap-2">
                                <div className="flex items-center gap-2 flex-grow">
                                    <UsersIcon className="w-5 h-5 flex-shrink-0" />
                                    <input type="text" value={player} onChange={(e) => handlePlayerNameChange(index, e.target.value)} className="bg-transparent text-slate-900 dark:text-white p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 w-full" placeholder="Nombre del jugador" aria-label={`Nombre del jugador ${index + 1}`}/>
                                </div>
                                <button onClick={() => handleRemovePlayer(index)} className="text-rose-500 hover:text-rose-400 flex-shrink-0"><TrashIcon className="w-5 h-5" /></button>
                            </div>
                        ))}
                    </div>
                    {players.length < MAX_PLAYERS && (
                        <div className="flex gap-2 pt-2">
                            <input type="text" value={newPlayerName} onChange={(e) => setNewPlayerName(e.target.value)} className="flex-grow bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white p-2 rounded-lg focus:ring-2 focus:ring-violet-500 focus:outline-none" onKeyPress={(e) => e.key === 'Enter' && handleAddPlayer()}/>
                            <button onClick={handleAddPlayer} className="bg-violet-600 hover:bg-violet-700 text-white font-bold p-2 rounded-lg"><PlusIcon className="w-6 h-6" /></button>
                        </div>
                    )}
                </>
            );
            case 'tramposos': return (
                <>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Tramposos: <span className="text-violet-600 dark:text-violet-400">{numTramposos}</span></h3>
                    <input type="range" min="1" max={maxTramposos} value={numTramposos} onChange={(e) => setNumTramposos(parseInt(e.target.value))} className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-violet-600" disabled={maxTramposos < 1}/>
                </>
            );
            case 'hint': return (
                <>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Pista para tramposos</h3>
                    <div className="flex bg-slate-200 dark:bg-slate-900 rounded-lg p-1">
                        <button type="button" onClick={() => setTramposoHint(true)} className={`w-1/2 p-2 rounded-md font-bold transition-colors ${tramposoHint ? 'bg-violet-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'}`}>Activada</button>
                        <button type="button" onClick={() => setTramposoHint(false)} className={`w-1/2 p-2 rounded-md font-bold transition-colors ${!tramposoHint ? 'bg-violet-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'}`}>Desactivada</button>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 px-1 pt-2 h-16">{tramposoHint ? "El tramposo recibe una palabra similar para ayudarle." : "El tramposo no recibe ninguna palabra."}</p>
                </>
            );
            case 'category': return (
                <>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Categoría de Temáticas</h3>
                     <div className="grid grid-cols-2 gap-2">
                        {Object.keys(WORD_CATEGORIES).map((cat) => (
                            <button key={cat} type="button" onClick={() => setCategory(cat)} className={`p-3 rounded-lg transition-all text-sm font-semibold ${category === cat ? 'bg-violet-600 text-white ring-2 ring-violet-400' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'}`}>{cat}</button>
                        ))}
                    </div>
                </>
            );
            case 'timer': {
                const timerMinutesModal = timer / 60;
                const isDefaultTimeModal = timer === 180;
                const timerDisplayModal = `${timerMinutesModal} minuto${timerMinutesModal === 1 ? '' : 's'}${isDefaultTimeModal ? ' (por defecto)' : ''}`;
                return (
                 <>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Tiempo de Debate: <span className="text-violet-600 dark:text-violet-400">{timerDisplayModal}</span></h3>
                    <input type="range" min="60" max="900" step="30" value={timer} onChange={(e) => setTimer(parseInt(e.target.value))} className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-violet-600"/>
                    <p className="text-xs text-slate-500 dark:text-slate-400 px-1 pt-2">El tiempo recomendado y por defecto es de 3 minutos.</p>
                </>
                );
            }
            default: return null;
        }
    };

    const timerMinutes = timer / 60;
    const isDefaultTime = timer === 180;
    const timerDisplay = `${timerMinutes} minuto${timerMinutes === 1 ? '' : 's'}${isDefaultTime ? ' (por defecto)' : ''}`;

    return (
        <div className="flex flex-col h-full">
            <div className="w-full max-w-md mx-auto bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm px-6 pt-2 pb-6 rounded-2xl shadow-lg space-y-6 animate-fade-in transition-colors duration-300 ring-1 ring-black/5 dark:ring-white/10 flex-grow overflow-y-auto pb-32">
                <div data-tutorial-id="title" className="text-center mb-2">
                    <LogoIcon className="w-20 h-20 mx-auto text-violet-600 dark:text-violet-400" />
                    <h1 className="text-3xl font-bold font-orbitron tracking-wider text-gradient -mt-2">TRAMPOSO</h1>
                </div>
                
                <div className="space-y-3">
                    <div data-tutorial-id="game-mode">
                        <SettingItem icon={<GameModeIcon className="text-sky-500" />} label="Modo de Juego" value={gameMode} onClick={() => setActiveModal('gameMode')} />
                    </div>
                    <div data-tutorial-id="players">
                        <SettingItem icon={<UsersIcon className="text-emerald-500" />} label="Jugadores" value={`${players.length} jugadores`} onClick={() => setActiveModal('players')} />
                    </div>
                    <div data-tutorial-id="tramposos">
                        <SettingItem icon={<SpyIcon className="text-rose-500" />} label="Tramposos" value={`${numTramposos} tramposo${numTramposos > 1 ? 's' : ''}`} onClick={() => setActiveModal('tramposos')} />
                    </div>
                    {gameMode === GameMode.Classic && (
                        <div className="animate-fade-in"><SettingItem icon={<HintIcon className="text-amber-500" />} label="Pista para tramposos" value={tramposoHint ? 'Activada' : 'Desactivada'} onClick={() => setActiveModal('hint')} /></div>
                    )}
                    <div data-tutorial-id="category">
                        <SettingItem icon={<CategoryIcon className="text-orange-500" />} label="Temáticas" value={category} onClick={() => setActiveModal('category')} />
                    </div>
                    <div data-tutorial-id="timer">
                        <SettingItem icon={<TimerIcon className="text-indigo-500" />} label="Tiempo de Debate" value={timerDisplay} onClick={() => setActiveModal('timer')} />
                    </div>
                </div>

                <div className="mt-8 pt-4 border-t border-slate-200 dark:border-slate-700/50 space-y-4">
                    <button 
                        onClick={() => setIsRulesModalOpen(true)} 
                        className="w-full flex items-center justify-center gap-3 p-3 bg-violet-100 dark:bg-violet-900/50 rounded-xl hover:bg-violet-200 dark:hover:bg-violet-900 transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500"
                        aria-label="Cómo Jugar"
                        data-tutorial-id="how-to-play"
                    >
                        <BookOpenIcon className="w-6 h-6 text-violet-600 dark:text-violet-400" />
                        <span className="font-bold text-violet-700 dark:text-violet-300 text-lg">Cómo Jugar</span>
                    </button>
                    
                    <div className="flex justify-around items-center text-slate-600 dark:text-slate-400 pt-2">
                        <div className="relative group">
                             <button onClick={onToggle} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" aria-label="Cambiar tema">
                                {theme === 'light' 
                                    ? <MoonIcon className="w-7 h-7 text-indigo-500" /> 
                                    : <SunIcon className="w-7 h-7 text-amber-400" />
                                }
                            </button>
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none invisible group-hover:visible">
                                Cambiar Tema
                            </div>
                        </div>
                        
                        <div className="relative group">
                            <button onClick={() => setIsFeedbackModalOpen(true)} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" aria-label="Enviar comentarios">
                                <MailIcon className="w-7 h-7 text-teal-500" />
                            </button>
                             <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none invisible group-hover:visible">
                                Enviar Comentarios
                            </div>
                        </div>

                        <div className="relative group">
                            <button onClick={startTutorial} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" aria-label="Iniciar tutorial">
                                <GraduationCapIcon className="w-7 h-7 text-blue-500" />
                            </button>
                             <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none invisible group-hover:visible">
                                Tutorial
                            </div>
                        </div>
                       
                        <div className="relative group">
                            <button onClick={handleShare} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" aria-label="Compartir juego">
                                <ShareIcon className="w-7 h-7 text-green-500" />
                            </button>
                            {showCopiedMessage && (
                                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-slate-800 text-white text-xs rounded-md whitespace-nowrap shadow-lg animate-fade-in z-10">
                                    ¡Enlace copiado!
                                </div>
                            )}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none invisible group-hover:visible">
                                Compartir
                            </div>
                        </div>

                        <div className="relative group">
                             <button onClick={() => setIsDonateModalOpen(true)} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" aria-label="Donar al juego">
                                <GiftIcon className="w-7 h-7 text-pink-500" />
                            </button>
                             <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none invisible group-hover:visible">
                                Donar
                            </div>
                        </div>

                         <div className="relative group">
                            <button onClick={() => setIsAboutModalOpen(true)} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" aria-label="Sobre el juego">
                                <InfoIcon className="w-7 h-7 text-gray-500" />
                            </button>
                             <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none invisible group-hover:visible">
                                Sobre el Juego
                            </div>
                        </div>
                    </div>
                </div>

                {activeModal && (
                    <div 
                        className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in"
                        onClick={() => setActiveModal(null)}
                    >
                        <div 
                            className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl ring-1 ring-black/5 dark:ring-white/10"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {renderModalContent()}
                            <button
                                onClick={() => setActiveModal(null)}
                                className="w-full mt-4 bg-violet-600 hover:bg-violet-700 text-white font-bold py-2 px-4 rounded-lg text-lg transition-colors"
                            >
                                Aceptar
                            </button>
                        </div>
                    </div>
                )}
            </div>

             {showTutorialPrompt && !isTutorialActive && (
                <div className="fixed bottom-28 sm:bottom-32 left-1/2 -translate-x-1/2 w-11/12 max-w-md bg-white dark:bg-slate-800 p-4 rounded-xl shadow-2xl z-40 animate-fade-in ring-1 ring-violet-200 dark:ring-violet-900">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white">¿Primera vez aquí?</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 mb-3">¿Te gustaría un tour rápido para aprender a configurar el juego?</p>
                    <div className="flex gap-3">
                        <button onClick={startTutorial} className="w-full bg-violet-600 text-white font-bold py-2 px-3 rounded-lg text-sm">Sí, por favor</button>
                        <button onClick={dismissTutorialPrompt} className="w-full bg-slate-200 dark:bg-slate-700 font-bold py-2 px-3 rounded-lg text-sm">No, gracias</button>
                    </div>
                </div>
            )}


            <div className="fixed bottom-0 left-0 right-0 z-10 pointer-events-none">
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-purple-50 via-purple-50/80 to-transparent dark:from-slate-900 dark:via-slate-900/80 dark:to-transparent"></div>
                <div className="relative w-full max-w-md mx-auto p-4 pointer-events-auto">
                    <form onSubmit={handleSubmit}>
                        <button
                            type="submit"
                            disabled={isStartDisabled || isLoading}
                            className="w-full bg-gradient-to-r from-purple-600 to-rose-600 hover:from-purple-700 hover:to-rose-700 text-white font-bold py-3 px-4 rounded-xl text-lg tracking-wider font-orbitron transition-all disabled:from-slate-400 disabled:to-slate-400 dark:disabled:from-slate-600 dark:disabled:to-slate-600 disabled:text-slate-500 dark:disabled:text-slate-400 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center"
                            data-tutorial-id="start-game"
                        >
                            {isLoading ? (
                                <>
                                    <LoadingSpinnerIcon className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                                    GENERANDO PALABRAS...
                                </>
                            ) : 'COMENZAR JUEGO'}
                        </button>
                        {isStartDisabled && 
                            <p className="text-center text-rose-600 dark:text-rose-400 text-sm mt-2 font-semibold bg-white/50 dark:bg-black/30 backdrop-blur-sm rounded-md py-1 px-2">
                                {players.length < MIN_PLAYERS ? `Se necesitan al menos ${MIN_PLAYERS} jugadores.` : 'Todos los jugadores deben tener un nombre.'}
                            </p>
                        }
                    </form>
                </div>
            </div>
            <FeedbackModal isOpen={isFeedbackModalOpen} onClose={() => setIsFeedbackModalOpen(false)} />
            <RulesModal isOpen={isRulesModalOpen} onClose={() => setIsRulesModalOpen(false)} />
            <AboutModal isOpen={isAboutModalOpen} onClose={() => setIsAboutModalOpen(false)} />
            <DonateModal isOpen={isDonateModalOpen} onClose={() => setIsDonateModalOpen(false)} />
            <InteractiveTutorial 
                steps={tutorialSteps}
                stepIndex={tutorialStep}
                isActive={isTutorialActive}
                onNext={handleTutorialNext}
                onPrev={handleTutorialPrev}
                onEnd={handleTutorialEnd}
            />
        </div>
    );
};

export default SetupScreen;