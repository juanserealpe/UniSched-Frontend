/**
 * Schedule Grid component.
 * Visualizes the weekly schedule of selected subjects.
 */
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

const getSubjectColor = (subjectName: string) => {
    let hash = 0;
    for (let i = 0; i < subjectName.length; i++) {
        hash = subjectName.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Expanded palette of 20+ distinguishable institutional/academic colors
    const colors = [
        '#00447C', // Unicauca Blue
        '#D32F2F', // Unicauca Red
        '#0F172A', // Navy/Slate
        '#0D9488', // Teal
        '#7C3AED', // Violet
        '#C5A059', // Accent Gold
        '#1E293B', // Slate Blue
        '#991B1B', // Maroon
        '#0369A1', // Sky Blue
        '#166534', // Forest Green
        '#7E22CE', // Purple
        '#B45309', // Amber/Ochre
        '#BE123C', // Rose
        '#334155', // Cool Grey
        '#15803D', // Emerald
        '#1D4ED8', // Royal Blue
        '#A21CAF', // Fuchsia
        '#C2410C', // Burnt Orange
        '#0E7490', // Cyan
        '#4338CA', // Indigo
    ];

    const index = Math.abs(hash) % colors.length;
    return colors[index];
};

// Helper to convert "HH:mm:ss" to minutes from 7:00 AM
const timeToMinutes = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    return (h - START_HOUR) * 60 + m;
};

/**
 * Renders a weekly schedule grid with subject blocks.
 * @param schedule - The list of subject groups to display
 */
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

    const hourHeight = 3.2; // rem - Reduced from 4.5 for better visibility at 100% zoom

    return (
        <div className="bg-white rounded-[2rem] shadow-xl border border-slate-200/60 overflow-x-auto custom-scrollbar">
            <div className="min-w-[900px]">
                {/* Header Days */}
                <div className="grid grid-cols-7 border-b border-slate-100 sticky top-0 bg-white/90 backdrop-blur-md z-10">
                    <div className="p-3 text-center text-[10px] font-black text-slate-400 border-r border-slate-50 uppercase tracking-[0.2em]">
                        Hora
                    </div>
                    {DAYS.map((day) => (
                        <div key={day} className="p-3 text-center">
                            <span className="text-[10px] sm:text-xs font-black text-slate-800 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
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
                                className="border-b border-slate-50/50 flex items-start justify-end pr-3"
                                style={{ height: `${hourHeight}rem`, paddingTop: '0.25rem' }}
                            >
                                <span className="text-[10px] font-bold text-slate-400 tabular-nums">
                                    {hour}:00
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Columns for Days */}
                    <div className="flex-1 grid grid-cols-6 relative">
                        {/* Vertical Grid Lines */}
                        {DAYS.map((_, i) => (
                            <div key={i} className="absolute top-0 bottom-0 border-r border-slate-100/60" style={{ left: `${(i + 1) * (100 / 6)}%` }} />
                        ))}

                        {/* Horizontal Grid Lines */}
                        {HOURS.map((_, i) => (
                            <div
                                key={i}
                                className="absolute left-0 right-0 border-b border-slate-100/60"
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
                                            className="absolute left-[2px] right-[2px] rounded-lg p-2 text-white shadow-md transition-all hover:scale-[1.02] hover:z-20 group cursor-pointer border border-white/20 hover:shadow-xl"
                                            style={{
                                                top: `${(block.top / 100) * hourHeight}rem`,
                                                height: `${(block.height / 100) * hourHeight - 0.1}rem`,
                                                backgroundColor: block.color,
                                            }}
                                        >
                                            <div className="flex flex-col h-full overflow-hidden leading-none">
                                                <div className="text-[10px] font-black mb-0.5 line-clamp-2 uppercase tracking-tight shrink-0">
                                                    {block.subject.subjectName}
                                                </div>

                                                <div className="flex flex-col gap-0.5 min-h-0">
                                                    <div className="text-[9px] font-bold opacity-90 flex items-center gap-1 shrink-0">
                                                        <span className="w-1 h-1 bg-white/70 rounded-full shrink-0" />
                                                        G{block.subject.groupCode}
                                                    </div>

                                                    {block.subject.professors && (
                                                        <div className="text-[8.5px] font-medium opacity-90 leading-tight line-clamp-[4] break-words">
                                                            {block.subject.professors}
                                                        </div>
                                                    )}
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
