import React from 'react';
import { GiftIcon } from './icons';

interface DonateModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const DonateModal: React.FC<DonateModalProps> = ({ isOpen, onClose }) => {
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
                    <GiftIcon className="w-16 h-16 mx-auto text-violet-500" />
                    <h2 className="text-3xl font-bold text-violet-600 dark:text-violet-400 font-orbitron">Donar al Juego</h2>
                    <p className="text-slate-600 dark:text-slate-300">
                        Dona a este proyecto a través de Yape o Plin escaneando los códigos QR a continuación ó a mi número 994447715 a nombre de Julio A. Daza M. Si deseas donar por un medio distinto, ponte en contacto conmigo al correo: <a href="mailto:ev9155732@gmail.com" className="text-violet-500 hover:underline">ev9155732@gmail.com</a>
                    </p>
                    <div className="flex flex-row justify-around items-center gap-4 pt-4">
                        <div className="flex flex-col items-center gap-2">
                            <h3 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-200">Yape</h3>
                            <img src="https://i.ibb.co/761xR1C/qr-yape-abel-dm.png" alt="Código QR para donación Yape" className="w-32 h-32 sm:w-40 sm:h-40 rounded-lg bg-white p-2 shadow-md ring-1 ring-slate-200 dark:ring-slate-700" />
                        </div>
                         <div className="flex flex-col items-center gap-2">
                            <h3 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-200">Plin</h3>
                            <img src="https://i.ibb.co/k6hRWNm5/qr-plin-abeldm.png" alt="Código QR para donación Plin" className="w-32 h-32 sm:w-40 sm:h-40 rounded-lg bg-white p-2 shadow-md ring-1 ring-slate-200 dark:ring-slate-700" />
                        </div>
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

export default DonateModal;