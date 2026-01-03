import React from 'react';
import type { Schedule } from '../types';
import { Clock, User } from 'lucide-react';

interface GroupDetailsViewProps {
    groupCode: string;
    professors: string;
    schedules: Schedule[];
}

const DAY_LABELS: Record<string, string> = {
    MONDAY: 'Lunes',
    TUESDAY: 'Martes',
    WEDNESDAY: 'Miércoles',
    THURSDAY: 'Jueves',
    FRIDAY: 'Viernes',
    SATURDAY: 'Sábado',
};

export const GroupDetailsView: React.FC<GroupDetailsViewProps> = ({
    groupCode,
    professors,
    schedules,
}) => {
    // Group schedules by day
    const schedulesByDay = schedules.reduce((acc, schedule) => {
        if (!acc[schedule.dayOfWeek]) {
            acc[schedule.dayOfWeek] = [];
        }
        acc[schedule.dayOfWeek].push(schedule);
        return acc;
    }, {} as Record<string, Schedule[]>);

    const formatTime = (time: string) => {
        // Convert "08:00:00" to "8:00 AM"
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours, 10);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        return `${displayHour}:${minutes} ${ampm}`;
    };

    return (
        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
            {/* Group Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="px-3 py-1 bg-blue-600 text-white font-bold rounded-lg text-sm">
                        {groupCode}
                    </div>
                </div>
                <div className="flex items-center gap-2 text-slate-600 text-sm">
                    <User size={16} />
                    <span>{professors}</span>
                </div>
            </div>

            {/* Schedule */}
            <div className="space-y-2">
                <div className="flex items-center gap-2 text-slate-700 text-sm font-medium">
                    <Clock size={16} />
                    <span>Horario</span>
                </div>
                <div className="grid grid-cols-1 gap-2">
                    {Object.entries(schedulesByDay).map(([day, daySchedules]) => (
                        <div
                            key={day}
                            className="flex items-center gap-3 text-sm bg-white p-2 rounded border border-slate-200"
                        >
                            <span className="font-medium text-slate-700 min-w-[80px]">
                                {DAY_LABELS[day] || day}
                            </span>
                            <div className="flex flex-wrap gap-2">
                                {daySchedules.map((schedule, idx) => (
                                    <span key={idx} className="text-slate-600">
                                        {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
