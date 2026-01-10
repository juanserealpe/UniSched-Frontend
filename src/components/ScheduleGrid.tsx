import React, { useMemo } from 'react';
import type { GeneratedSchedule, ApiSubjectGroup } from '../types';

interface ScheduleGridProps {
    schedule: GeneratedSchedule;
}

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
const DAY_LABELS: Record<string, string> = {
    MONDAY: 'Lunes',
    TUESDAY: 'Martes',
    WEDNESDAY: 'Miércoles',
    THURSDAY: 'Jueves',
    FRIDAY: 'Viernes',
    SATURDAY: 'Sábado',
};

const START_HOUR = 7;
const END_HOUR = 20; // 8 PM
const HOURS = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i);

// Helper to generate a consistent color for a subject name
const getSubjectColor = (subjectName: string) => {
    let hash = 0;
    for (let i = 0; i < subjectName.length; i++) {
        hash = subjectName.charCodeAt(i) + ((hash << 5) - hash);
    }
    // Using a more curated institutional palette based on Unicauca's colors
    const colors = [
        '#00447C', // Unicauca Blue
        '#D32F2F', // Unicauca Red
        '#C5A059', // Accent Gold
        '#1E293B', // Slate
        '#0369A1', // Sky
        '#0F172A', // Dark Indigo
        '#7C2D12', // Rust brown
    ];
    return colors[Math.abs(hash) % colors.length];
};

// Helper to convert "HH:mm:ss" to minutes from 7:00 AM
const timeToMinutes = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    return (h - START_HOUR) * 60 + m;
};

export const ScheduleGrid: React.FC<ScheduleGridProps> = ({ schedule }) => {
    // Flatten all schedules with their subject info
    const blocks = useMemo(() => {
        const allBlocks: Array<{
            subject: ApiSubjectGroup;
            dayOfWeek: string;
            startTime: string;
            endTime: string;
            top: number;
            height: number;
            color: string;
        }> = [];

        schedule.forEach((group) => {
            const color = getSubjectColor(group.subjectName);
            group.schedules.forEach((s) => {
                const startMins = timeToMinutes(s.startTime);
                const endMins = timeToMinutes(s.endTime);
                allBlocks.push({
                    subject: group,
                    dayOfWeek: s.dayOfWeek,
                    startTime: s.startTime,
                    endTime: s.endTime,
                    top: (startMins / 60) * 100,
                    height: ((endMins - startMins) / 60) * 100,
                    color,
                });
            });
        });

        return allBlocks;
    }, [schedule]);

    const hourHeight = 4.5; // rem - slightly taller for breathing room

    return (
        <div className="bg-white rounded-[2rem] shadow-xl border border-slate-200/60 overflow-x-auto custom-scrollbar">
            <div className="min-w-[900px]">
                {/* Header Days */}
                <div className="grid grid-cols-7 border-b border-slate-100 sticky top-0 bg-white/90 backdrop-blur-md z-10">
                    <div className="p-4 text-center text-[10px] font-black text-slate-400 border-r border-slate-50 uppercase tracking-[0.2em]">
                        Hora
                    </div>
                    {DAYS.map((day) => (
                        <div key={day} className="p-4 text-center">
                            <span className="text-xs font-black text-slate-800 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">
                                {DAY_LABELS[day]}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Grid Body */}
                <div className="relative flex">
                    {/* Time Column */}
                    <div className="w-[calc(100%/7)] border-r border-slate-50">
                        {HOURS.map((hour) => (
                            <div
                                key={hour}
                                className="border-b border-slate-50/50 flex items-start justify-end pr-4"
                                style={{ height: `${hourHeight}rem`, paddingTop: '0.5rem' }}
                            >
                                <span className="text-[10px] font-black text-slate-400 tabular-nums">
                                    {hour}:00
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Columns for Days */}
                    <div className="flex-1 grid grid-cols-6 relative">
                        {/* Vertical Grid Lines */}
                        {DAYS.map((_, i) => (
                            <div key={i} className="absolute top-0 bottom-0 border-r border-slate-50/50" style={{ left: `${(i + 1) * (100 / 6)}%` }} />
                        ))}

                        {/* Horizontal Grid Lines */}
                        {HOURS.map((_, i) => (
                            <div
                                key={i}
                                className="absolute left-0 right-0 border-b border-slate-50/50"
                                style={{ top: `${(i + 1) * hourHeight}rem` }}
                            />
                        ))}

                        {/* Blocks */}
                        {DAYS.map((day) => (
                            <div key={day} className="relative h-full">
                                {blocks
                                    .filter((b) => b.dayOfWeek === day)
                                    .map((block, i) => (
                                        <div
                                            key={`${block.subject.id}-${i}`}
                                            className="absolute left-[3px] right-[3px] rounded-xl p-2.5 text-white shadow-lg transition-all hover:scale-[1.02] hover:z-20 group cursor-pointer border border-white/20"
                                            style={{
                                                top: `${(block.top / 100) * hourHeight}rem`,
                                                height: `${(block.height / 100) * hourHeight - 0.1}rem`,
                                                backgroundColor: block.color,
                                            }}
                                        >
                                            <div className="flex flex-col h-full overflow-hidden">
                                                <div className="text-[10px] font-black leading-tight mb-0.5 line-clamp-2 uppercase tracking-tight">
                                                    {block.subject.subjectName}
                                                </div>
                                                <div className="text-[9px] font-bold opacity-80 flex items-center gap-1">
                                                    <span className="w-1 h-1 bg-white rounded-full" />
                                                    G{block.subject.groupCode}
                                                </div>

                                                {/* Tooltip-like info on hover */}
                                                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-56 p-4 bg-slate-900/95 backdrop-blur-md text-white text-xs rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none border border-slate-700">
                                                    <div className="flex items-center gap-2 mb-2 border-b border-slate-700 pb-2">
                                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: block.color }} />
                                                        <span className="font-black uppercase tracking-tight truncate">{block.subject.subjectName}</span>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between items-center text-[10px]">
                                                            <span className="text-slate-400 font-bold">GRUPO</span>
                                                            <span className="font-black text-white">{block.subject.groupCode}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center text-[10px]">
                                                            <span className="text-slate-400 font-bold">HORARIO</span>
                                                            <span className="font-black text-white">{block.startTime.slice(0, 5)} - {block.endTime.slice(0, 5)}</span>
                                                        </div>
                                                        {block.subject.professors && (
                                                            <div className="pt-2 border-t border-slate-700/50">
                                                                <div className="text-slate-400 font-bold mb-1 text-[9px]">PROFESOR(ES)</div>
                                                                <div className="text-[10px] font-medium leading-relaxed italic">{block.subject.professors}</div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
