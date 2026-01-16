/**
 * Component for displaying subject offerings (groups and schedules).
 * Allows users to view and toggle exclusion of specific groups.
 */
import React, { useState } from 'react';
import { Trash2, Pencil, ChevronDown, Check } from 'lucide-react';
import type { ApiSubjectGroup } from '../types';
import { useSubjects } from '../context/SubjectContext';
import { Modal } from './Modal';

interface SubjectOfferingCardProps {
    subjectName: string;
    subjectId: number | string;
    groups: ApiSubjectGroup[];
    isCustom?: boolean;
    onEdit?: () => void;
}

/**
 * Detailed card for a subject in the offerings view.
 * @param subjectName - Name of the subject
 * @param subjectId - ID of the subject
 * @param groups - List of available groups for this subject
 * @param isCustom - Whether the subject is user-defined
 * @param onEdit - Callback for editing (only for custom subjects)
 */
export const SubjectOfferingCard: React.FC<SubjectOfferingCardProps> = ({
    subjectName,
    subjectId,
    groups,
    isCustom = false,
    onEdit,
}) => {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const { toggleSubject, removeCustomSubject, customSubjects, toggleGroupExclusion, isGroupExcluded } = useSubjects();

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowDeleteConfirm(true);
    };

    const handleEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        onEdit?.();
    };

    const confirmRemoval = () => {
        if (isCustom) {
            const groupsToRemove = customSubjects.filter(cs => cs.subjectName === subjectName);
            groupsToRemove.forEach(g => removeCustomSubject(g.id));
        } else {
            toggleSubject(subjectId as number);
        }
        setShowDeleteConfirm(false);
    };

    // Calculate stats
    const totalGroups = groups.length;
    const excludedCount = groups.filter(g =>
        isGroupExcluded(g.id, isCustom, subjectName, g.groupCode)
    ).length;
    const availableCount = totalGroups - excludedCount;
    const isAtRisk = availableCount === 0;

    const handleToggleGroup = (group: ApiSubjectGroup, e?: React.MouseEvent) => {
        e?.stopPropagation();
        toggleGroupExclusion(group.id, isCustom, subjectName, group.groupCode);
    };

    return (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500 h-full flex flex-col group">
            {/* Main Header Area */}
            <div className="p-5 flex flex-col gap-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        {/* Tags */}
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                            {isCustom ? (
                                <div className="px-2 py-0.5 bg-purple-50 text-purple-600 text-[10px] font-bold uppercase tracking-wider rounded-md border border-purple-100 flex items-center gap-1">
                                    <div className="w-1 h-1 bg-purple-400 rounded-full" />
                                    Personalizada
                                </div>
                            ) : (
                                <div className="px-2 py-0.5 bg-blue-50 text-unicauca-blue text-[10px] font-bold uppercase tracking-wider rounded-md border border-blue-100 flex items-center gap-1">
                                    <div className="w-1 h-1 bg-blue-400 rounded-full" />
                                    Oficial
                                </div>
                            )}
                            <div className="px-2 py-0.5 bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-wider rounded-md border border-slate-100 font-mono">
                                ID: {subjectId}
                            </div>
                            <div className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md border flex items-center gap-1 ${isAtRisk
                                ? 'bg-red-50 text-red-600 border-red-100'
                                : 'bg-green-50 text-green-600 border-green-100'
                                }`}>
                                {availableCount} / {totalGroups} Grupos
                            </div>
                        </div>

                        <h3 className="text-lg font-extrabold text-slate-800 leading-tight group-hover:text-unicauca-blue transition-colors">
                            {subjectName}
                        </h3>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                        {isCustom && (
                            <button
                                onClick={handleEdit}
                                className="p-2 text-slate-400 hover:text-unicauca-blue hover:bg-blue-50 rounded-xl transition-all active:scale-90"
                                title="Editar materia"
                            >
                                <Pencil size={16} />
                            </button>
                        )}
                        <button
                            onClick={handleDelete}
                            className="p-2 text-slate-400 hover:text-unicauca-red hover:bg-red-50 rounded-xl transition-all active:scale-90"
                            title="Eliminar materia"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>

                {/* Collapsible Trigger */}
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-full flex items-center justify-between p-3 bg-slate-50/50 hover:bg-slate-50 border border-slate-100 rounded-xl transition-all group/btn"
                >
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider group-hover/btn:text-slate-700">
                        {isExpanded ? 'Ocultar Grupos' : 'Gestionar Grupos'}
                    </span>
                    <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''} text-slate-400`}>
                        <ChevronDown size={18} />
                    </div>
                </button>
            </div>

            {/* Collapsible Content */}
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="p-5 pt-0 border-t border-slate-100 bg-slate-50/30">
                    <div className="mt-4 space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                        {groups.map((group) => {
                            const isExcluded = isGroupExcluded(group.id, isCustom, subjectName, group.groupCode);
                            const isIncluded = !isExcluded;

                            return (
                                <div
                                    key={group.groupCode}
                                    onClick={() => handleToggleGroup(group)}
                                    className={`
                                        group/item relative flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-200
                                        ${isIncluded
                                            ? 'bg-white border-unicauca-blue/30 shadow-sm'
                                            : 'bg-slate-50 border-slate-200 opacity-75'
                                        }
                                    `}
                                >
                                    {/* Custom Checkbox */}
                                    <div className={`
                                        mt-0.5 shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200
                                        ${isIncluded
                                            ? 'bg-unicauca-blue border-unicauca-blue text-white'
                                            : 'bg-transparent border-slate-300 text-transparent group-hover/item:border-slate-400'
                                        }
                                    `}>
                                        <Check size={12} strokeWidth={4} />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className={`text-sm font-bold ${isIncluded ? 'text-slate-800' : 'text-slate-500'}`}>
                                                Grupo {group.groupCode}
                                            </span>
                                        </div>
                                        {group.professors && (
                                            <div className={`text-xs mb-2 ${isIncluded ? 'text-slate-600' : 'text-slate-400'}`}>
                                                {group.professors}
                                            </div>
                                        )}
                                        <div className="space-y-1">
                                            {group.schedules.map((schedule, idx) => (
                                                <div key={idx} className={`text-[10px] font-mono flex items-center gap-2 ${isIncluded ? 'text-slate-500' : 'text-slate-400'}`}>
                                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                                                    <span>{schedule.dayOfWeek} {schedule.startTime}-{schedule.endTime}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <Modal
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                title="¿Eliminar Materia?"
                footer={
                    <>
                        <button
                            onClick={() => setShowDeleteConfirm(false)}
                            className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={confirmRemoval}
                            className="px-5 py-2.5 text-sm font-bold text-white bg-unicauca-red hover:bg-unicauca-red-dark rounded-xl transition-all shadow-lg shadow-unicauca-red/10 active:scale-95"
                        >
                            Confirmar
                        </button>
                    </>
                }
            >
                <div className="text-center py-4">
                    <p className="text-slate-600 mb-2 font-medium">
                        ¿Estás seguro de que deseas eliminar <span className="font-extrabold text-slate-900 leading-tight">"{subjectName}"</span>?
                    </p>
                    <p className="text-xs text-slate-400 leading-relaxed italic">
                        Esta materia dejará de ser parte de las opciones para generar tu horario.
                    </p>
                </div>
            </Modal>
        </div>
    );
};