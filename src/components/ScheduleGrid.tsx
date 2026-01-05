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
    const h = Math.abs(hash) % 360;
    return `hsl(${h}, 70%, 45%)`;
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
                    top: (startMins / 60) * 100, // percentage of one hour height (e.g. 4rem)
                    height: ((endMins - startMins) / 60) * 100,
                    color,
                });
            });
        });

        return allBlocks;
    }, [schedule]);

    const hourHeight = 4; // rem

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
            <div className="min-w-[800px]">
                {/* Header Days */}
                <div className="grid grid-cols-7 border-b border-slate-200 sticky top-0 bg-white z-10">
                    <div className="p-3 text-center text-xs font-bold text-slate-400 border-r border-slate-100">
                        HORA
                    </div>
                    {DAYS.map((day) => (
                        <div key={day} className="p-3 text-center text-sm font-bold text-slate-700">
                            {DAY_LABELS[day]}
                        </div>
                    ))}
                </div>

                {/* Grid Body */}
                <div className="relative flex">
                    {/* Time Column */}
                    <div className="w-[calc(100%/7)] border-r border-slate-100">
                        {HOURS.map((hour) => (
                            <div
                                key={hour}
                                className="border-b border-slate-50 text-[10px] text-slate-400 text-right pr-2 font-medium"
                                style={{ height: `${hourHeight}rem`, lineHeight: '1rem', paddingTop: '0.2rem' }}
                            >
                                {hour}:00
                            </div>
                        ))}
                    </div>

                    {/* Columns for Days */}
                    <div className="flex-1 grid grid-cols-6 relative">
                        {/* Vertical Grid Lines */}
                        {DAYS.map((_, i) => (
                            <div key={i} className="absolute top-0 bottom-0 border-r border-slate-100" style={{ left: `${(i + 1) * (100 / 6)}%` }} />
                        ))}

                        {/* Horizontal Grid Lines */}
                        {HOURS.map((_, i) => (
                            <div
                                key={i}
                                className="absolute left-0 right-0 border-b border-slate-50"
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
                                            className="absolute left-1 right-1 rounded-md p-2 text-white shadow-sm transition-all hover:scale-[1.02] hover:z-20 group cursor-default"
                                            style={{
                                                top: `${(block.top / 100) * hourHeight}rem`,
                                                height: `${(block.height / 100) * hourHeight - 0.1}rem`,
                                                backgroundColor: block.color,
                                            }}
                                        >
                                            <div className="flex flex-col h-full overflow-hidden">
                                                <div className="text-[10px] font-bold leading-tight truncate">
                                                    {block.subject.subjectName}
                                                </div>
                                                <div className="text-[9px] opacity-90 font-medium">
                                                    Grup {block.subject.groupCode}
                                                </div>

                                                {/* Details on Hover or if enough height */}
                                                <div className="mt-auto hidden group-hover:block lg:group-hover:block">
                                                    <div className="text-[8px] opacity-80 truncate border-t border-white/20 pt-0.5 mt-0.5">
                                                        {block.subject.professors.split(',').map(p => p.trim().split(' ').map(n => n[0]).join('')).join(', ')}
                                                    </div>
                                                </div>

                                                {/* Tooltip-like info on hover */}
                                                <div className="absolute left-full ml-2 top-0 w-48 p-3 bg-slate-900 text-white text-xs rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-30 pointer-events-none">
                                                    <div className="font-bold border-b border-slate-700 pb-1 mb-1">{block.subject.subjectName}</div>
                                                    <div className="space-y-1">
                                                        <div className="flex justify-between">
                                                            <span className="text-slate-400">Grupo:</span>
                                                            <span>{block.subject.groupCode}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-slate-400">Hora:</span>
                                                            <span>{block.startTime.slice(0, 5)} - {block.endTime.slice(0, 5)}</span>
                                                        </div>
                                                        <div className="text-slate-400 mt-1">Profesores:</div>
                                                        <div className="text-[10px] italic">{block.subject.professors}</div>
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
