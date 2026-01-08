import React from 'react';
import type { SubjectWithState } from '../types';
import { Lock, Check, AlertTriangle } from 'lucide-react';
import { useSubjects } from '../context/SubjectContext';
import { twMerge } from 'tailwind-merge';

interface SubjectCardProps {
    subject: SubjectWithState;
}

export const SubjectCard: React.FC<SubjectCardProps> = ({ subject }) => {
    const { toggleSubject } = useSubjects();

    const handleClick = () => {
        if (subject.status === 'blocked') return;
        toggleSubject(subject.id);
    };

    const getStatusStyles = () => {
        switch (subject.status) {
            case 'selected':
                return 'bg-blue-600 text-white border-blue-700 shadow-md';
            case 'blocked':
                return 'bg-gray-200 text-gray-500 border-gray-300 cursor-not-allowed';
            case 'available':
            default:
                const baseStyles = 'bg-white text-slate-800 border-gray-200 hover:border-green-500 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer';
                if (subject.warning) {
                    return 'bg-amber-50 text-slate-800 border-amber-300 hover:border-amber-500 hover:shadow-md cursor-pointer';
                }
                return baseStyles;
        }
    };

    const Icon = () => {
        if (subject.status === 'selected') return <Check size={18} />;
        if (subject.status === 'blocked') return <Lock size={18} />;
        if (subject.warning) return <AlertTriangle size={18} className="text-amber-500" />;
        return null;
    };

    return (
        <div
            onClick={handleClick}
            className={twMerge(
                'relative p-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-between gap-3 select-none group',
                getStatusStyles()
            )}
            title={subject.blockReason}
        >
            <div className="flex-1 font-medium text-sm leading-snug">
                {subject.name}
            </div>

            <div className="shrink-0 opacity-80">
                <Icon />
            </div>

            {/* Tooltip for blocked/warning states */}
            {(subject.blockReason || subject.warning) && (
                <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-xs p-2 rounded bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 text-center pointer-events-none z-10 shadow-xl">
                    {subject.warning || subject.blockReason}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
                </div>
            )}
        </div>
    );
};
