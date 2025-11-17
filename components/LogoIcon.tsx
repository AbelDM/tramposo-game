import React from 'react';

const LogoIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-label="Logo de Tramposo"
        role="img"
    >
        <g transform="rotate(-5 100 100)">
            {/* Glasses */}
            <g fill="currentColor">
                {/* Left Lens */}
                <path d="M 75,140 C 90,165 40,170 25,145 C 10,120 35,110 50,120 L 75,140 Z" />
                {/* Right Lens */}
                <path d="M 125,140 C 110,165 160,170 175,145 C 190,120 165,110 150,120 L 125,140 Z" />
                {/* Bridge */}
                <path d="M 78,138 C 90,125 110,125 122,138" stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round" />
                 {/* Glare on Right Lens */}
                <path d="M 135,125 L 160,150" stroke="white" strokeWidth="8" fill="none" strokeOpacity="0.2" strokeLinecap="round" />
            </g>
            
            {/* Hat */}
            <g fill="currentColor">
                 {/* Brim */}
                <path d="M 20,110 C 20,100 180,100 180,110 C 180,120 20,120 20,110 Z" />
                {/* Crown */}
                <path d="M 50,110 C 45,70 70,40 100,40 C 130,40 155,70 150,110 Z" />
                {/* Band */}
                <rect x="48" y="98" width="104" height="12" rx="3" fillOpacity="0.7" />
            </g>
        </g>
    </svg>
);

export default LogoIcon;