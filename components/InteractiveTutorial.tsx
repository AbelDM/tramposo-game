import React, { useState, useLayoutEffect, useRef } from 'react';

export interface TutorialStep {
    selector: string;
    title: string;
    content: string;
    placement?: 'top' | 'bottom' | 'left' | 'right';
}

interface InteractiveTutorialProps {
    steps: TutorialStep[];
    stepIndex: number;
    onNext: () => void;
    onPrev: () => void;
    onEnd: () => void;
    isActive: boolean;
}

const InteractiveTutorial: React.FC<InteractiveTutorialProps> = ({ steps, stepIndex, onNext, onPrev, onEnd, isActive }) => {
    const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

    const currentStep = steps[stepIndex];

    useLayoutEffect(() => {
        if (!isActive || !currentStep?.selector) {
            setHighlightRect(null);
            return;
        }

        const targetElement = document.querySelector(currentStep.selector);
        if (targetElement) {
            const rect = targetElement.getBoundingClientRect();
            setHighlightRect(rect);
        } else {
            setHighlightRect(null); // Hide if element not found
        }
    }, [currentStep, isActive, stepIndex]);

    useLayoutEffect(() => {
        if (!highlightRect || !tooltipRef.current) return;

        const PADDING = 16;
        const tooltipHeight = tooltipRef.current.offsetHeight;
        const tooltipWidth = tooltipRef.current.offsetWidth;
        const placement = currentStep.placement || 'bottom';

        let pos = { top: 0, left: 0 };

        switch(placement) {
            case 'top':
                pos.top = highlightRect.top - tooltipHeight - PADDING;
                pos.left = highlightRect.left + (highlightRect.width / 2) - (tooltipWidth / 2);
                break;
            case 'right':
                pos.top = highlightRect.top + (highlightRect.height / 2) - (tooltipHeight / 2);
                pos.left = highlightRect.right + PADDING;
                break;
            case 'left':
                pos.top = highlightRect.top + (highlightRect.height / 2) - (tooltipHeight / 2);
                pos.left = highlightRect.left - tooltipWidth - PADDING;
                break;
            default: // bottom
                pos.top = highlightRect.bottom + PADDING;
                pos.left = highlightRect.left + (highlightRect.width / 2) - (tooltipWidth / 2);
                break;
        }

        // Adjust for viewport edges
        pos.left = Math.max(PADDING, Math.min(pos.left, window.innerWidth - tooltipWidth - PADDING));
        pos.top = Math.max(PADDING, Math.min(pos.top, window.innerHeight - tooltipHeight - PADDING));

        setTooltipPosition(pos);

    }, [highlightRect, currentStep]);

    if (!isActive) return null;

    const highlightStyle: React.CSSProperties = {
        position: 'absolute',
        top: `${(highlightRect?.top ?? 0) - 5}px`,
        left: `${(highlightRect?.left ?? 0) - 5}px`,
        width: `${(highlightRect?.width ?? 0) + 10}px`,
        height: `${(highlightRect?.height ?? 0) + 10}px`,
        boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.7)',
        borderRadius: '12px',
        transition: 'all 0.3s ease-in-out',
        zIndex: 1000,
        pointerEvents: 'none',
        opacity: highlightRect ? 1 : 0,
    };

    const tooltipStyle: React.CSSProperties = {
        position: 'fixed',
        top: `${tooltipPosition.top}px`,
        left: `${tooltipPosition.left}px`,
        zIndex: 1001,
        transition: 'top 0.3s ease-in-out, left 0.3s ease-in-out',
        opacity: highlightRect ? 1 : 0,
    };

    return (
        <div className="fixed inset-0 z-[100]">
            <div style={highlightStyle}></div>
            <div 
                ref={tooltipRef}
                style={tooltipStyle} 
                className="bg-white dark:bg-slate-800 rounded-xl p-4 w-80 shadow-2xl space-y-3 ring-1 ring-black/5 dark:ring-white/10 animate-fade-in"
            >
                <h3 className="text-xl font-bold font-orbitron text-violet-600 dark:text-violet-400">{currentStep.title}</h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm">{currentStep.content}</p>
                <div className="flex justify-between items-center pt-2">
                    <button onClick={onEnd} className="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-semibold">Saltar</button>
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-slate-500">{stepIndex + 1} / {steps.length}</span>
                        {stepIndex > 0 && (
                            <button onClick={onPrev} className="px-3 py-1 bg-slate-200 dark:bg-slate-700 rounded-md text-sm font-bold hover:bg-slate-300 dark:hover:bg-slate-600">Atrás</button>
                        )}
                        <button onClick={onNext} className="px-3 py-1 bg-violet-600 text-white rounded-md text-sm font-bold hover:bg-violet-700">{stepIndex === steps.length - 1 ? 'Finalizar' : 'Siguiente'}</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InteractiveTutorial;
