import React, { useState } from 'react';
import { ChevronDown, ChevronUp, BookOpen, Trash2 } from 'lucide-react';
import type { ApiSubjectGroup } from '../types';
import { GroupDetailsView } from './GroupDetailsView';
import { useSubjects } from '../context/SubjectContext';
import { Modal } from './Modal';

interface SubjectOfferingCardProps {
    subjectName: string;
    subjectId: number | string;
    groups: ApiSubjectGroup[];
    isCustom?: boolean;
}

export const SubjectOfferingCard: React.FC<SubjectOfferingCardProps> = ({
    subjectName,
    subjectId,
    groups,
    isCustom = false,
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const { toggleSubject, removeCustomSubject } = useSubjects();

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent card toggle
        if (isCustom) {
            removeCustomSubject(subjectId);
        } else {
            setShowDeleteConfirm(true);
        }
    };

    const confirmRemoval = () => {
        toggleSubject(subjectId as number);
        setShowDeleteConfirm(false);
    };

    return (
        <>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-all hover:shadow-md">
                {/* Header - Clickable */}
                <div className="flex items-center">
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="flex-1 p-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <BookOpen className="text-blue-600" size={20} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-800">{subjectName}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    {isCustom && (
                                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-bold uppercase rounded">
                                            Custom
                                        </span>
                                    )}
                                    <span className="text-sm text-slate-500">
                                        {groups.length} {groups.length === 1 ? 'grupo' : 'grupos'} disponible{groups.length !== 1 ? 's' : ''}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="text-slate-400">
                            {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                        </div>
                    </button>

                    <button
                        onClick={handleDelete}
                        className="p-4 mr-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                        title="Eliminar materia"
                    >
                        <Trash2 size={20} />
                    </button>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                    <div className="border-t border-slate-200 p-4 bg-slate-50">
                        {groups.length === 0 ? (
                            <div className="text-center py-8 text-slate-500">
                                <p className="text-sm">No hay grupos disponibles para esta materia.</p>
                                {isCustom && (
                                    <p className="text-xs mt-2 text-slate-400">
                                        Las materias personalizadas no tienen grupos asignados.
                                    </p>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {groups.map((group) => (
                                    <GroupDetailsView
                                        key={group.id}
                                        groupCode={group.groupCode}
                                        professors={group.professors}
                                        schedules={group.schedules}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <Modal
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                title="¿Eliminar Materia?"
                footer={
                    <>
                        <button
                            onClick={() => setShowDeleteConfirm(false)}
                            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={confirmRemoval}
                            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-sm"
                        >
                            Confirmar
                        </button>
                    </>
                }
            >
                <p className="text-slate-600">
                    ¿Estás seguro de que deseas eliminar <strong>{subjectName}</strong> de tu selección?
                </p>
                <p className="text-slate-500 text-sm mt-2">
                    Esto podría desbloquear materias que dependen de ella.
                </p>
            </Modal>
        </>
    );
};
