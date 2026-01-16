/**
 * Modal component for adding or editing custom subjects.
 * Allows users to define custom subject details including multiple groups and schedules.
 */
import React, { useState } from 'react';
import { Modal } from './Modal';
import type { Schedule } from '../types';
import { Plus, X, Clock, Users, Trash2 } from 'lucide-react';
import { useSubjects } from '../context/SubjectContext';

interface AddCustomSubjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialData?: { name: string; groups: CustomGroup[] } | null;
}

interface CustomGroup {
    groupCode: string;
    professors: string;
    schedules: Schedule[];
}

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'] as const;

/**
 * Component for managing custom subject creation and editing.
 * @param isOpen - Controls the visibility of the modal
 * @param onClose - Handler to close the modal
 * @param initialData - Optional data for editing an existing subject
 */
export const AddCustomSubjectModal: React.FC<AddCustomSubjectModalProps> = ({ isOpen, onClose, initialData }) => {
    const [name, setName] = useState('');
    const [groups, setGroups] = useState<CustomGroup[]>([]);

    // State for the current group being edited
    const [currentGroupCode, setCurrentGroupCode] = useState('');
    const [currentProfessors, setCurrentProfessors] = useState('');
    const [currentDay, setCurrentDay] = useState<Schedule['dayOfWeek']>('MONDAY');
    const [startTime, setStartTime] = useState('14:00');
    const [endTime, setEndTime] = useState('16:00');
    const [currentSchedules, setCurrentSchedules] = useState<Schedule[]>([]);
    const [isEditingGroup, setIsEditingGroup] = useState(false);
    const [editingGroupIndex, setEditingGroupIndex] = useState<number | null>(null);

    const { updateCustomSubject, addCustomSubject } = useSubjects();

    React.useEffect(() => {
        if (isOpen && initialData) {
            setName(initialData.name);
            setGroups(initialData.groups);
        } else if (isOpen && !initialData) {
            resetForm();
        }
    }, [isOpen, initialData]);

    const [errors, setErrors] = useState<string[]>([]);

    const resetForm = () => {
        setName('');
        setGroups([]);
        setCurrentGroupCode('');
        setCurrentProfessors('');
        setCurrentSchedules([]);
        setIsEditingGroup(false);
        setEditingGroupIndex(null);
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

        // Check if group code is duplicate
        const isCodeDuplicate = groups.some((g, idx) =>
            g.groupCode.toLowerCase() === currentGroupCode.trim().toLowerCase() && idx !== editingGroupIndex
        );
        if (isCodeDuplicate) newErrors.push(`El grupo "${currentGroupCode.trim()}" ya existe en esta materia`);

        if (newErrors.length > 0) {
            setErrors(newErrors);
            return;
        }

        const newGroup: CustomGroup = {
            groupCode: currentGroupCode.trim(),
            professors: currentProfessors.trim() || '',
            schedules: [...currentSchedules]
        };

        if (editingGroupIndex !== null) {
            setGroups(prev => prev.map((g, i) => i === editingGroupIndex ? newGroup : g));
        } else {
            setGroups(prev => [...prev, newGroup]);
        }

        // Reset group form
        setCurrentGroupCode('');
        setCurrentProfessors('');
        setCurrentSchedules([]);
        setIsEditingGroup(false);
        setEditingGroupIndex(null);
        setErrors([]);
    };

    const editGroup = (index: number) => {
        const group = groups[index];
        setCurrentGroupCode(group.groupCode);
        setCurrentProfessors(group.professors);
        setCurrentSchedules(group.schedules);
        setEditingGroupIndex(index);
        setIsEditingGroup(true);
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

        if (initialData) {
            // Edit mode
            updateCustomSubject(initialData.name, name.trim(), groups);
        } else {
            // New mode
            // Create custom subject with all its groups
            groups.forEach((group) => {
                const customSubject = {
                    id: `custom-${crypto.randomUUID()}`,
                    subjectId: -1,
                    subjectName: name.trim(),
                    groupCode: group.groupCode,
                    professors: group.professors || 'Sin especificar',
                    schedules: group.schedules,
                    isCustom: true
                };
                addCustomSubject(customSubject);
            });
        }

        handleClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={initialData ? "Editar Materia Personalizada" : "Agregar Materia Personalizada"}
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
                        className="px-4 py-2 text-sm font-medium text-white bg-unicauca-blue hover:bg-unicauca-blue-light rounded-lg transition-colors shadow-sm"
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
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                        Nombre de la Materia *
                    </label>
                    <input
                        type="text"
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-400 outline-none text-sm transition-all font-bold placeholder:font-normal"
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
                            <div key={group.groupCode} className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="px-2 py-1 bg-unicauca-blue text-white text-xs font-bold rounded">
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
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => editGroup(idx)}
                                            className="p-1 text-slate-400 hover:text-blue-500 transition-colors"
                                            title="Editar grupo"
                                        >
                                            <Clock size={16} />
                                        </button>
                                        <button
                                            onClick={() => removeGroup(idx)}
                                            className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                                            title="Eliminar grupo"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Add Group Section */}
                {!isEditingGroup ? (
                    <button
                        onClick={() => setIsEditingGroup(true)}
                        className="w-full flex items-center justify-center gap-2 py-4 bg-white border-2 border-dashed border-slate-200 rounded-2xl text-sm font-bold text-slate-500 hover:bg-blue-50 hover:border-blue-300 hover:text-unicauca-blue transition-all group"
                    >
                        <Plus size={20} className="group-hover:rotate-90 transition-transform" />
                        Agregar Grupo
                    </button>
                ) : (
                    <div className="bg-slate-50/50 p-5 rounded-2xl border border-blue-100 shadow-inner space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-bold text-slate-700 tracking-tight">
                                {editingGroupIndex !== null ? 'Modificar Grupo' : 'Detalles del Nuevo Grupo'}
                            </h4>
                            <button
                                onClick={() => {
                                    setIsEditingGroup(false);
                                    setCurrentGroupCode('');
                                    setCurrentProfessors('');
                                    setCurrentSchedules([]);
                                    setErrors([]);
                                }}
                                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-white rounded-lg transition-all"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Group Code */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                                    Código del Grupo *
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-400 outline-none text-sm transition-all font-bold placeholder:font-normal"
                                    value={currentGroupCode}
                                    onChange={e => setCurrentGroupCode(e.target.value)}
                                    placeholder="Ej: A, B1"
                                    maxLength={5}
                                />
                            </div>

                            {/* Professors (Optional) */}
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                                    Profesor(es)
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-400 outline-none text-sm transition-all"
                                    value={currentProfessors}
                                    onChange={e => setCurrentProfessors(e.target.value)}
                                    placeholder="Ej: John Smith"
                                />
                            </div>
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
                            className="w-full py-2 bg-unicauca-blue text-white font-medium rounded-lg hover:bg-unicauca-blue-light transition-colors text-sm"
                        >
                            {editingGroupIndex !== null ? 'Actualizar Grupo' : 'Guardar Grupo'}
                        </button>
                    </div>
                )}
            </div>
        </Modal>
    );
};