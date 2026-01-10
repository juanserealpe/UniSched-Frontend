import React, { useState } from 'react';
import { Trash2, Pencil } from 'lucide-react';
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

export const SubjectOfferingCard: React.FC<SubjectOfferingCardProps> = ({
    subjectName,
    subjectId,
    groups,
    isCustom = false,
    onEdit,
}) => {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const { toggleSubject, removeCustomSubject, customSubjects } = useSubjects();

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

    return (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500 h-full flex flex-col group">
            <div className="p-6 sm:p-8 flex-1">
                <div className="flex items-start justify-between mb-8 gap-4">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
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
                            <div className="px-2 py-0.5 bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-wider rounded-md border border-slate-100 italic">
                                ID: {subjectId}
                            </div>
                        </div>
                        <h3 className="text-lg sm:text-xl font-extrabold text-slate-800 leading-tight group-hover:text-unicauca-blue transition-colors truncate">
                            {subjectName}
                        </h3>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        {isCustom && (
                            <button
                                onClick={handleEdit}
                                className="p-3 text-slate-500 hover:text-unicauca-blue hover:bg-blue-50 rounded-2xl transition-all active:scale-90 shadow-sm border border-slate-100 hover:border-blue-100"
                                title="Editar materia"
                            >
                                <Pencil size={18} />
                            </button>
                        )}
                        <button
                            onClick={handleDelete}
                            className="p-3 text-slate-500 hover:text-unicauca-red hover:bg-red-50 rounded-2xl transition-all active:scale-90 shadow-sm border border-slate-100 hover:border-red-100"
                            title="Eliminar materia"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                </div>

                <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2 text-left">
                    <div className="flex items-center gap-2 px-1">
                        <div className="w-1 h-4 bg-unicauca-red rounded-full" />
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Grupos Disponibles</h4>
                        <span className="ml-auto text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
                            {groups.length} Opciones
                        </span>
                    </div>

                    <div className="space-y-4">
                        {groups.map((group) => (
                            <div key={group.groupCode} className="bg-slate-50/50 rounded-2xl border border-slate-100 p-4 hover:bg-white hover:shadow-md transition-all duration-300 border-l-4 border-l-transparent hover:border-l-unicauca-blue">
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="px-3 py-1 bg-unicauca-blue text-white text-xs font-black rounded-lg shadow-sm">
                                        Grupo {group.groupCode}
                                    </span>
                                    {group.professors && (
                                        <div className="text-xs font-bold text-slate-600 truncate">
                                            {group.professors}
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    {group.schedules.map((schedule, idx) => (
                                        <div key={idx} className="flex items-center gap-3 text-xs text-slate-500 bg-white/50 p-2 rounded-xl">
                                            <div className="w-8 flex justify-center opacity-60">
                                                <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                                            </div>
                                            <span className="font-bold w-20 text-slate-600">{schedule.dayOfWeek}</span>
                                            <span className="font-medium">{schedule.startTime} - {schedule.endTime}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
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