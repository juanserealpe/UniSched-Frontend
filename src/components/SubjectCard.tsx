import React from 'react';
import type { SubjectWithState } from '../types';
import { Lock, Check, AlertCircle, Info } from 'lucide-react';
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
                return 'bg-gradient-to-br from-[#00447C] to-[#00335D] text-white border-transparent shadow-blue-200 premium-shadow scale-[1.02] active:scale-100';
            case 'blocked':
                return 'bg-slate-100 text-slate-400 border-slate-200 grayscale-[0.5] opacity-70 cursor-not-allowed';
            case 'available':
            default:
                if (subject.warning) {
                    return 'bg-amber-50 text-amber-900 border-amber-200 hover:border-amber-400 hover:shadow-amber-100/50 premium-shadow -translate-y-0.5 cursor-pointer';
                }
                return 'bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:shadow-blue-100/50 premium-shadow hover:-translate-y-1 cursor-pointer';
        }
    };

    const StatusIcon = () => {
        if (subject.status === 'selected') return <Check size={16} className="text-white" />;
        if (subject.status === 'blocked') return <Lock size={14} className="text-slate-400" />;
        if (subject.warning) return <AlertCircle size={16} className="text-amber-500" />;
        return <Info size={14} className="text-slate-300 group-hover:text-blue-400 transition-colors" />;
    };

    return (
        <div
            onClick={handleClick}
            className={twMerge(
                'relative p-4 rounded-xl border transition-all duration-300 flex items-center justify-between gap-3 select-none group',
                getStatusStyles()
            )}
        >
            <div className="flex-1">
                <div className="text-[11px] font-bold uppercase tracking-wider opacity-60 mb-1">
                    ID: {subject.id}
                </div>
                <div className="font-semibold text-sm leading-snug">
                    {subject.name}
                </div>
            </div>

            <div className={twMerge(
                "shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                subject.status === 'selected' ? "bg-white/20" : "bg-slate-50 group-hover:bg-blue-50"
            )}>
                <StatusIcon />
            </div>

            {/* Tooltip for blocked/warning states */}
            {(subject.blockReason || subject.warning) && (
                <div className="absolute opacity-0 group-hover:opacity-100 transition-all duration-200 bg-slate-900 text-white text-xs p-3 rounded-xl bottom-full mb-3 left-1/2 -translate-x-1/2 w-56 text-center shadow-2xl z-50 pointer-events-none translate-y-2 group-hover:translate-y-0">
                    <p className="font-medium">
                        {subject.warning || subject.blockReason}
                    </p>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900" />
                </div>
            )}
        </div>
    );
};
