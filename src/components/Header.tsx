import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

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
        <header className="bg-slate-900 text-white p-4 shadow-md sticky top-0 z-20">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {showBackButton && (
                        <button
                            onClick={handleBackClick}
                            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                            title="Volver"
                        >
                            <ArrowLeft size={24} />
                        </button>
                    )}
                    <div
                        className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={handleTitleClick}
                    >
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-lg">
                            U
                        </div>
                        <h1 className="text-xl font-bold tracking-tight">UNISCHED</h1>
                    </div>
                </div>

                {subtitle && (
                    <div className="text-sm text-slate-400 hidden sm:block">
                        {subtitle}
                    </div>
                )}

                {rightElement && (
                    <div className="flex items-center gap-4">
                        {rightElement}
                    </div>
                )}
            </div>
        </header>
    );
};
