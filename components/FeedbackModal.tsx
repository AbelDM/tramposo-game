import React, { useState } from 'react';
import { MailIcon, WhatsAppIcon } from './icons';

interface FeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
    const [feedback, setFeedback] = useState('');
    const [charCount, setCharCount] = useState(0);
    const maxChars = 500;

    if (!isOpen) return null;

    const handleFeedbackChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const text = e.target.value;
        if (text.length <= maxChars) {
            setFeedback(text);
            setCharCount(text.length);
        }
    };

    const handleSendEmail = () => {
        if (feedback.trim() === '') {
            alert('Por favor, escribe un comentario antes de enviar.');
            return;
        }

        const subject = encodeURIComponent('Comentarios sobre la app Tramposo');
        const body = encodeURIComponent(feedback);
        window.location.href = `mailto:ev9155732@gmail.com?subject=${subject}&body=${body}`;
        onClose();
    };

    const handleSendWhatsApp = () => {
        if (feedback.trim() === '') {
            alert('Por favor, escribe un comentario antes de enviar.');
            return;
        }
        const text = encodeURIComponent(feedback);
        const phoneNumber = '51994447715';
        window.open(`https://wa.me/${phoneNumber}?text=${text}`, '_blank');
        onClose();
    };


    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in"
            onClick={onClose}
        >
            <div 
                className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl max-h-[90vh] flex flex-col ring-1 ring-black/5 dark:ring-white/10"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-violet-600 dark:text-violet-400 font-orbitron">Enviar Comentarios</h2>
                </div>
                
                <p className="text-slate-600 dark:text-slate-300 text-center">
                    ¿Tienes alguna sugerencia o encontraste un error? ¡Házmelo saber! Tu opinión es muy valiosa.
                </p>

                <div>
                    <textarea
                        value={feedback}
                        onChange={handleFeedbackChange}
                        placeholder="Escribe tus comentarios aquí..."
                        rows={6}
                        maxLength={maxChars}
                        className="w-full p-3 bg-slate-100 dark:bg-slate-700/50 rounded-lg text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                        aria-label="Campo de texto para comentarios"
                    />
                    <p className="text-right text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {charCount}/{maxChars}
                    </p>
                </div>

                <div className="flex flex-col gap-4 pt-2">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            onClick={handleSendEmail}
                            className="w-full flex items-center justify-center gap-2 bg-slate-600 hover:bg-slate-700 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={!feedback.trim()}
                            aria-label="Enviar comentarios por Email"
                        >
                            <MailIcon className="w-6 h-6" />
                            <span>Enviar por Email</span>
                        </button>
                        <button
                            onClick={handleSendWhatsApp}
                            className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1EBE57] text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={!feedback.trim()}
                            aria-label="Enviar comentarios por WhatsApp"
                        >
                            <WhatsAppIcon className="w-6 h-6" />
                            <span>Enviar por WhatsApp</span>
                        </button>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-full bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-bold py-3 px-4 rounded-lg transition-colors"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FeedbackModal;