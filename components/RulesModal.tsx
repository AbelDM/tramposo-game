import React, { useState } from 'react';
import { UserIcon, SpyIcon } from './icons';

interface RulesModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const StepIndicator: React.FC<{ count: number; current: number }> = ({ count, current }) => (
    <div className="flex justify-center space-x-2">
        {Array.from({ length: count }).map((_, i) => (
            <div
                key={i}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                    i === current ? 'bg-violet-500' : 'bg-slate-300 dark:bg-slate-600'
                }`}
            />
        ))}
    </div>
);


const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
    const [step, setStep] = useState(0);

    if (!isOpen) return null;

    const steps = [
        // Step 1: El Objetivo
        {
            title: 'El Objetivo',
            content: (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
                    <div className="bg-slate-100 dark:bg-slate-700/50 p-4 rounded-lg flex flex-col items-center justify-center">
                        <UserIcon className="w-16 h-16 mx-auto text-cyan-600 dark:text-cyan-400" />
                        <h4 className="text-xl font-bold mt-2 text-cyan-600 dark:text-cyan-400">Civiles</h4>
                        <p className="mt-1 text-slate-600 dark:text-slate-300">Descubran y eliminen a todos los tramposos.</p>
                    </div>
                    <div className="bg-slate-100 dark:bg-slate-700/50 p-4 rounded-lg flex flex-col items-center justify-center">
                        <SpyIcon className="w-16 h-16 mx-auto text-rose-600 dark:text-rose-500" />
                        <h4 className="text-xl font-bold mt-2 text-rose-600 dark:text-rose-500">Tramposos</h4>
                        <p className="mt-1 text-slate-600 dark:text-slate-300">Sobrevivan sin ser descubiertos hasta que sean mayoría.</p>
                    </div>
                </div>
            )
        },
        // Step 2: Modos de Juego
        {
            title: 'Modos de Juego',
            content: (
                <div className="space-y-4 text-left">
                    <div className="bg-slate-100 dark:bg-slate-700/50 p-4 rounded-lg">
                        <h4 className="font-bold text-lg text-slate-900 dark:text-white">Clásico</h4>
                        <p className="text-slate-600 dark:text-slate-300">Los <strong className="text-cyan-600 dark:text-cyan-400">Civiles</strong> conocen la palabra secreta. Los <strong className="text-rose-600 dark:text-rose-500">Tramposos</strong> no, y deben adivinarla para no ser descubiertos.</p>
                    </div>
                    <div className="bg-slate-100 dark:bg-slate-700/50 p-4 rounded-lg">
                        <h4 className="font-bold text-lg text-slate-900 dark:text-white">Misterioso</h4>
                        <p className="text-slate-600 dark:text-slate-300">Nadie sabe su rol. El <strong className="text-amber-500">"Sr. Truquito"</strong> recibe una palabra muy parecida. El objetivo es encontrar al jugador con la palabra diferente.</p>
                    </div>
                </div>
            )
        },
        // Step 3: Flujo del Juego
        {
            title: '¿Cómo se Juega?',
            content: (
                <ol className="space-y-3 text-left">
                    <li className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-violet-100 dark:bg-violet-900/50 text-violet-600 dark:text-violet-300 rounded-full flex items-center justify-center font-bold text-lg">1</div>
                        <div>
                            <h4 className="font-semibold text-slate-900 dark:text-white">Preparación</h4>
                            <p className="text-slate-600 dark:text-slate-300">Cada jugador recibe su rol y su palabra en secreto.</p>
                        </div>
                    </li>
                    <li className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-violet-100 dark:bg-violet-900/50 text-violet-600 dark:text-violet-300 rounded-full flex items-center justify-center font-bold text-lg">2</div>
                        <div>
                            <h4 className="font-semibold text-slate-900 dark:text-white">Discusión</h4>
                            <p className="text-slate-600 dark:text-slate-300">Por turnos, cada uno da una pista de una palabra. ¡No digas la palabra secreta!</p>
                        </div>
                    </li>
                    <li className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-violet-100 dark:bg-violet-900/50 text-violet-600 dark:text-violet-300 rounded-full flex items-center justify-center font-bold text-lg">3</div>
                        <div>
                            <h4 className="font-semibold text-slate-900 dark:text-white">Votación</h4>
                            <p className="text-slate-600 dark:text-slate-300">Al acabar el tiempo, discutan y voten para eliminar a un sospechoso.</p>
                        </div>
                    </li>
                     <li className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-violet-100 dark:bg-violet-900/50 text-violet-600 dark:text-violet-300 rounded-full flex items-center justify-center font-bold text-lg">4</div>
                        <div>
                            <h4 className="font-semibold text-slate-900 dark:text-white">Victoria</h4>
                            <p className="text-slate-600 dark:text-slate-300">El juego termina cuando un equipo cumple su objetivo.</p>
                        </div>
                    </li>
                </ol>
            )
        }
    ];

    const handleNext = () => setStep(s => Math.min(s + 1, steps.length - 1));
    const handlePrev = () => setStep(s => Math.max(s - 1, 0));

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in"
            onClick={onClose}
        >
            <div 
                className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-lg w-full space-y-6 shadow-2xl max-h-[90vh] flex flex-col ring-1 ring-black/5 dark:ring-white/10"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-violet-600 dark:text-violet-400 font-orbitron">{steps[step].title}</h2>
                </div>
                
                <div className="flex-grow min-h-[280px] flex items-center justify-center p-2">
                    {steps[step].content}
                </div>

                <div className="space-y-4">
                    <StepIndicator count={steps.length} current={step} />
                    
                    <div className="flex gap-4">
                        {step > 0 && (
                            <button
                                onClick={handlePrev}
                                className="w-full bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-bold py-2 px-4 rounded-lg transition-colors"
                            >
                                Anterior
                            </button>
                        )}
                        {step < steps.length - 1 ? (
                            <button
                                onClick={handleNext}
                                className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                            >
                                Siguiente
                            </button>
                        ) : (
                             <button
                                onClick={onClose}
                                className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                            >
                                ¡A Jugar!
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RulesModal;