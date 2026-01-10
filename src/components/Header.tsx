import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpenCheck } from 'lucide-react';

interface HeaderProps {
    subtitle?: string;
    showBackButton?: boolean;
    onBackButtonClick?: () => void;
    rightElement?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
    subtitle,
    showBackButton = false,
    onBackButtonClick,
    rightElement
}) => {
    const navigate = useNavigate();

    const handleTitleClick = () => {
        navigate('/');
    };

    const handleBackClick = () => {
        if (onBackButtonClick) {
            onBackButtonClick();
        } else {
            navigate(-1);
        }
    };

    return (
        <header className="unicauca-gradient text-white shadow-xl sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 sm:h-20">
                    <div className="flex items-center gap-4">
                        {showBackButton && (
                            <button
                                onClick={handleBackClick}
                                className="p-2 hover:bg-white/10 rounded-xl transition-all duration-200 active:scale-95 group"
                                title="Volver"
                            >
                                <ArrowLeft size={22} className="group-hover:-translate-x-0.5 transition-transform" />
                            </button>
                        )}
                        <div
                            className="flex items-center gap-3 cursor-pointer group"
                            onClick={handleTitleClick}
                        >
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-3 transition-transform duration-300">
                                <BookOpenCheck className="text-unicauca-blue" size={24} />
                            </div>
                            <div className="flex flex-col">
                                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight leading-none group-hover:text-blue-50 transition-colors">
                                    UNISCHED
                                </h1>
                                <span className="text-[10px] sm:text-xs font-medium text-blue-200/80 uppercase tracking-[0.2em]">
                                    Unicauca • FIis
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        {subtitle && (
                            <div className="text-sm font-medium text-blue-100/90 hidden md:block px-4 py-1.5 bg-white/10 rounded-full border border-white/10">
                                {subtitle}
                            </div>
                        )}

                        {rightElement && (
                            <div className="flex items-center">
                                {rightElement}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Subtle bottom accent line */}
            <div className="h-1 w-full bg-[#C5A059] opacity-80" />
        </header>
    );
};
