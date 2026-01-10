import React, { useState } from 'react';
import { Modal } from './Modal';
import type { Schedule } from '../types';
import { Plus, X, Clock, Users, Trash2 } from 'lucide-react';
import { useSubjects } from '../context/SubjectContext';

interface AddCustomSubjectModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface CustomGroup {
    groupCode: string;
    professors: string;
    schedules: Schedule[];
}

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'] as const;

export const AddCustomSubjectModal: React.FC<AddCustomSubjectModalProps> = ({ isOpen, onClose }) => {
    const { addCustomSubject } = useSubjects();

    const [name, setName] = useState('');
    const [groups, setGroups] = useState<CustomGroup[]>([]);

    // Estado para el grupo actual que se está editando
    const [currentGroupCode, setCurrentGroupCode] = useState('');
    const [currentProfessors, setCurrentProfessors] = useState('');
    const [currentDay, setCurrentDay] = useState<Schedule['dayOfWeek']>('MONDAY');
    const [startTime, setStartTime] = useState('14:00');
    const [endTime, setEndTime] = useState('16:00');
    const [currentSchedules, setCurrentSchedules] = useState<Schedule[]>([]);
    const [isEditingGroup, setIsEditingGroup] = useState(false);

    const [errors, setErrors] = useState<string[]>([]);

    const resetForm = () => {
        setName('');
        setGroups([]);
        setCurrentGroupCode('');
        setCurrentProfessors('');
        setCurrentSchedules([]);
        setIsEditingGroup(false);
        setErrors([]);
        setStartTime('14:00');
        setEndTime('16:00');
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const addScheduleToCurrentGroup = () => {
        if (startTime >= endTime) {
            setErrors(['La hora de fin debe ser posterior a la de inicio']);
            return;
        }

        const isDuplicate = currentSchedules.some(s =>
            s.dayOfWeek === currentDay &&
            ((startTime >= s.startTime && startTime < s.endTime) ||
                (endTime > s.startTime && endTime <= s.endTime) ||
                (startTime <= s.startTime && endTime >= s.endTime))
        );

        if (isDuplicate) {
            setErrors(['El horario se solapa con otro existente en este grupo']);
            return;
        }

        setErrors([]);
        setCurrentSchedules(prev => [...prev, { dayOfWeek: currentDay, startTime, endTime }]);
    };

    const removeScheduleFromCurrentGroup = (index: number) => {
        setCurrentSchedules(prev => prev.filter((_, i) => i !== index));
    };

    const saveCurrentGroup = () => {
        const newErrors = [];
        if (!currentGroupCode.trim()) newErrors.push('El código del grupo es obligatorio');
        if (currentGroupCode.length > 5) newErrors.push('El código del grupo no debe superar 5 caracteres');
        if (currentSchedules.length === 0) newErrors.push('Debes agregar al menos un horario al grupo');

        if (newErrors.length > 0) {
            setErrors(newErrors);
            return;
        }

        const newGroup: CustomGroup = {
            groupCode: currentGroupCode.trim(),
            professors: currentProfessors.trim() || '',
            schedules: [...currentSchedules]
        };

        setGroups(prev => [...prev, newGroup]);

        // Reset group form
        setCurrentGroupCode('');
        setCurrentProfessors('');
        setCurrentSchedules([]);
        setIsEditingGroup(false);
        setErrors([]);
    };

    const removeGroup = (index: number) => {
        setGroups(prev => prev.filter((_, i) => i !== index));
    };

    const handleConfirm = () => {
        const newErrors = [];
        if (!name.trim()) newErrors.push('El nombre de la materia es obligatorio');
        if (groups.length === 0) newErrors.push('Debes agregar al menos un grupo a la materia');

        if (newErrors.length > 0) {
            setErrors(newErrors);
            return;
        }

        // Crear la materia custom con todos sus grupos
        groups.forEach((group, index) => {
            const customSubject = {
                id: `custom-${crypto.randomUUID()}`,
                subjectId: -1,
                subjectName: name,
                groupCode: group.groupCode,
                professors: group.professors || 'Sin especificar',
                schedules: group.schedules,
                isCustom: true
            };
            addCustomSubject(customSubject);
        });

        handleClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Agregar Materia Personalizada"
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
                {errors.length > 0 && (
                    <div className="space-y-2">
                        {errors.map((err, idx) => (
                            <div key={idx} className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100">
                                {err}
                            </div>
                        ))}
                    </div>
                )}

                {/* Subject Name */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        Nombre de la Materia *
                    </label>
                    <input
                        type="text"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Ej: Inglés I"
                        maxLength={100}
                    />
                </div>

                {/* Groups List */}
                {groups.length > 0 && (
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Grupos agregados ({groups.length})
                        </label>
                        {groups.map((group, idx) => (
                            <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="px-2 py-1 bg-blue-600 text-white text-xs font-bold rounded">
                                                {group.groupCode}
                                            </span>
                                            {group.professors && (
                                                <div className="flex items-center gap-1 text-xs text-slate-600">
                                                    <Users size={12} />
                                                    <span>{group.professors}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-xs text-slate-600 space-y-1">
                                            {group.schedules.map((sch, sIdx) => (
                                                <div key={sIdx} className="flex items-center gap-2">
                                                    <Clock size={12} className="text-slate-400" />
                                                    <span>{sch.dayOfWeek} {sch.startTime} - {sch.endTime}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => removeGroup(idx)}
                                        className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Add Group Section */}
                {!isEditingGroup ? (
                    <button
                        onClick={() => setIsEditingGroup(true)}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-slate-100 border-2 border-dashed border-slate-300 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-200 hover:border-slate-400 transition-colors"
                    >
                        <Plus size={20} />
                        Agregar Grupo
                    </button>
                ) : (
                    <div className="bg-slate-50 p-4 rounded-xl border-2 border-blue-200 space-y-3">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-semibold text-slate-700">Nuevo Grupo</h4>
                            <button
                                onClick={() => {
                                    setIsEditingGroup(false);
                                    setCurrentGroupCode('');
                                    setCurrentProfessors('');
                                    setCurrentSchedules([]);
                                    setErrors([]);
                                }}
                                className="text-slate-400 hover:text-slate-600"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Group Code */}
                        <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">
                                Código del Grupo * (máx. 5 caracteres)
                            </label>
                            <input
                                type="text"
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                value={currentGroupCode}
                                onChange={e => setCurrentGroupCode(e.target.value)}
                                placeholder="Ej: A, B1, LAB"
                                maxLength={5}
                            />
                        </div>

                        {/* Professors (Optional) */}
                        <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">
                                Profesor(es) (Opcional)
                            </label>
                            <input
                                type="text"
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                value={currentProfessors}
                                onChange={e => setCurrentProfessors(e.target.value)}
                                placeholder="Ej: John Smith"
                            />
                        </div>

                        {/* Schedule Builder */}
                        <div className="bg-white p-3 rounded-lg border border-slate-200">
                            <label className="block text-xs font-medium text-slate-700 mb-2">
                                Horarios del Grupo *
                            </label>

                            <div className="grid grid-cols-2 gap-2 mb-2">
                                <select
                                    className="col-span-2 px-2 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={currentDay}
                                    onChange={e => setCurrentDay(e.target.value as any)}
                                >
                                    {DAYS.map(day => (
                                        <option key={day} value={day}>{day}</option>
                                    ))}
                                </select>

                                <input
                                    type="time"
                                    className="px-2 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={startTime}
                                    onChange={e => setStartTime(e.target.value)}
                                />

                                <input
                                    type="time"
                                    className="px-2 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={endTime}
                                    onChange={e => setEndTime(e.target.value)}
                                />
                            </div>

                            <button
                                onClick={addScheduleToCurrentGroup}
                                className="w-full flex items-center justify-center gap-1 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                            >
                                <Plus size={14} />
                                Agregar Horario
                            </button>
                        </div>

                        {/* Current Schedules */}
                        {currentSchedules.length > 0 && (
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-600">
                                    Horarios del grupo ({currentSchedules.length})
                                </label>
                                {currentSchedules.map((schedule, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-2 bg-white border border-slate-200 rounded-lg text-xs">
                                        <div className="flex items-center gap-2 text-slate-700">
                                            <Clock size={12} className="text-slate-400" />
                                            <span className="font-medium">{schedule.dayOfWeek}</span>
                                            <span>{schedule.startTime} - {schedule.endTime}</span>
                                        </div>
                                        <button
                                            onClick={() => removeScheduleFromCurrentGroup(idx)}
                                            className="text-slate-400 hover:text-red-500 transition-colors"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Save Group Button */}
                        <button
                            onClick={saveCurrentGroup}
                            className="w-full py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                            Guardar Grupo
                        </button>
                    </div>
                )}
            </div>
        </Modal>
    );
};