import React, { useState } from 'react';
import { Modal } from './Modal';
import type { Schedule, SubjectGroup } from '../types';
import { Plus, X, Clock } from 'lucide-react';
import { useSubjects } from '../context/SubjectContext';

interface AddCustomSubjectModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'] as const;

export const AddCustomSubjectModal: React.FC<AddCustomSubjectModalProps> = ({ isOpen, onClose }) => {
    const { addCustomSubject } = useSubjects();

    const [name, setName] = useState('');
    const [groupCode, setGroupCode] = useState('');

    // Schedule form state
    const [currentDay, setCurrentDay] = useState<Schedule['dayOfWeek']>('MONDAY');
    const [startTime, setStartTime] = useState('14:00');
    const [endTime, setEndTime] = useState('16:00');

    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [errors, setErrors] = useState<string[]>([]);

    const resetForm = () => {
        setName('');
        setGroupCode('');
        setSchedules([]);
        setErrors([]);
        setStartTime('14:00');
        setEndTime('16:00');
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const addSchedule = () => {
        // Validate time
        if (startTime >= endTime) {
            setErrors(prev => [...prev, 'La hora de fin debe ser posterior a la de inicio']);
            return;
        }

        // Check duplicates
        const isDuplicate = schedules.some(s =>
            s.dayOfWeek === currentDay &&
            ((startTime >= s.startTime && startTime < s.endTime) ||
                (endTime > s.startTime && endTime <= s.endTime) ||
                (startTime <= s.startTime && endTime >= s.endTime))
        );

        if (isDuplicate) {
            setErrors(prev => [...prev, 'El horario se solapa con otro existente']);
            return;
        }

        setErrors([]);
        setSchedules(prev => [...prev, { dayOfWeek: currentDay, startTime, endTime }]);
    };

    const removeSchedule = (index: number) => {
        setSchedules(prev => prev.filter((_, i) => i !== index));
    };

    const handleConfirm = () => {
        const newErrors = [];
        if (!name.trim()) newErrors.push('El nombre es obligatorio');
        if (schedules.length === 0) newErrors.push('Debes agregar al menos un horario');

        if (newErrors.length > 0) {
            setErrors(newErrors);
            return;
        }

        const newSubject: SubjectGroup = {
            id: `custom-${crypto.randomUUID()}`,
            subjectId: -1, // No ID for custom
            subjectName: name,
            groupCode: groupCode || 'CUSTOM',
            professors: 'Profesor Personalizado',
            schedules,
            isCustom: true
        };

        addCustomSubject(newSubject);
        handleClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Agregar Materia Custom"
            footer={
                <>
                    <button
                        onClick={handleClose}
                        className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
                    >
                        Confirmar
                    </button>
                </>
            }
        >
            <div className="space-y-4">
                {errors.map((err, idx) => (
                    <div key={idx} className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100">
                        {err}
                    </div>
                ))}

                {/* Name */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nombre de la Materia *</label>
                    <input
                        type="text"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Ej: Electiva Deportes"
                        maxLength={100}
                    />
                </div>

                {/* Group Code */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Código de Grupo (Opcional)</label>
                    <input
                        type="text"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        value={groupCode}
                        onChange={e => setGroupCode(e.target.value)}
                        placeholder="Ej: A1"
                    />
                </div>

                {/* Schedule Builder */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <label className="block text-sm font-medium text-slate-700 mb-3 block">Horario *</label>

                    <div className="grid grid-cols-2 gap-3 mb-3">
                        <select
                            className="col-span-2 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            value={currentDay}
                            onChange={e => setCurrentDay(e.target.value as any)}
                        >
                            {DAYS.map(day => (
                                <option key={day} value={day}>{day}</option>
                            ))}
                        </select>

                        <input
                            type="time"
                            className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            value={startTime}
                            onChange={e => setStartTime(e.target.value)}
                        />

                        <input
                            type="time"
                            className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            value={endTime}
                            onChange={e => setEndTime(e.target.value)}
                        />
                    </div>

                    <button
                        onClick={addSchedule}
                        className="w-full flex items-center justify-center gap-2 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                        <Plus size={16} />
                        Agregar Horario
                    </button>
                </div>

                {/* Added Schedules List */}
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Horarios agregados</label>
                    {schedules.length === 0 && (
                        <div className="text-sm text-slate-400 italic">No hay horarios agregados</div>
                    )}
                    {schedules.map((schedule, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                            <div className="flex items-center gap-3 text-sm text-slate-700">
                                <Clock size={16} className="text-slate-400" />
                                <span>
                                    <span className="font-semibold">{schedule.dayOfWeek}</span> {schedule.startTime} - {schedule.endTime}
                                </span>
                            </div>
                            <button
                                onClick={() => removeSchedule(idx)}
                                className="text-slate-400 hover:text-red-500 transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </Modal>
    );
};
