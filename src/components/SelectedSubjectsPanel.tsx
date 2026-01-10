import React, { useState, useMemo } from 'react';
import { useSubjects } from '../context/SubjectContext';
import { Trash2, Pencil, BookOpenCheck } from 'lucide-react';
import { AddCustomSubjectModal } from './AddCustomSubjectModal';
import { Modal } from './Modal';

export const SelectedSubjectsPanel: React.FC = () => {
    const { selectedSubjectsList, toggleSubject, removeCustomSubject, clearAllSubjects, customSubjects } = useSubjects();
    const [confirmDelete, setConfirmDelete] = useState<{ id: string | number; name: string; isCustom: boolean; groupCount?: number } | null>(null);
    const [isClearAllModalOpen, setIsClearAllModalOpen] = useState(false);
    const [editingSubject, setEditingSubject] = useState<{ name: string; groups: any[] } | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // Group custom subjects by name
    const groupedSubjects = useMemo(() => {
        const official = selectedSubjectsList.filter((s: any) => !s.isCustom);

        // Group custom subjects by name
        const customGrouped = new Map<string, typeof customSubjects>();
        customSubjects.forEach(cs => {
            if (!customGrouped.has(cs.subjectName)) {
                customGrouped.set(cs.subjectName, []);
            }
            customGrouped.get(cs.subjectName)!.push(cs);
        });

        const customAsEntries = Array.from(customGrouped.entries()).map(([name, groups]) => ({
            id: groups[0].id,
            name: name,
            isCustom: true,
            groupCount: groups.length
        }));

        return [...official, ...customAsEntries];
    }, [selectedSubjectsList, customSubjects]);

    const handleEditClick = (item: any) => {
        // Find all groups for this custom subject
        const groups = customSubjects
            .filter(cs => cs.subjectName === (item.name || item.subjectName))
            .map(g => ({
                groupCode: g.groupCode,
                professors: g.professors,
                schedules: g.schedules
            }));

        setEditingSubject({
            name: item.name || item.subjectName,
            groups: groups
        });
        setIsEditModalOpen(true);
    };

    const handleDeleteClick = (item: any) => {
        setConfirmDelete({
            id: item.id,
            name: item.name || item.subjectName,
            isCustom: !!item.isCustom,
            groupCount: item.groupCount
        });
    };

    const confirmRemoval = () => {
        if (!confirmDelete) return;

        if (confirmDelete.isCustom) {
            // Remove all groups of this custom subject by name
            const groupsToRemove = customSubjects.filter(cs => cs.subjectName === confirmDelete.name);
            groupsToRemove.forEach(g => removeCustomSubject(g.id));
        } else {
            toggleSubject(confirmDelete.id as number);
        }
        setConfirmDelete(null);
    };

    const handleClearAll = () => {
        clearAllSubjects();
        setIsClearAllModalOpen(false);
    };

    const totalSubjects = groupedSubjects.length;

    return (
        <>
            <div
                className="glass-card rounded-2xl shadow-xl flex flex-col overflow-hidden border-slate-200/50"
                style={{ maxHeight: 'calc(100vh - 12rem)' }}
            >
                <div className="p-5 border-b border-slate-100 bg-white/50 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-6 bg-[#C5A059] rounded-full" />
                            <h2 className="font-bold text-slate-800 tracking-tight">Materias Seleccionadas</h2>
                        </div>
                        {totalSubjects > 0 && (
                            <button
                                onClick={() => setIsClearAllModalOpen(true)}
                                className="text-[10px] font-bold text-red-600 hover:text-white hover:bg-red-500 px-2.5 py-1.5 rounded-lg transition-all duration-200 uppercase tracking-wider border border-red-100 hover:border-red-500 active:scale-95"
                            >
                                Limpiar
                            </button>
                        )}
                    </div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                        <span className="px-2 py-0.5 bg-slate-100 rounded-md">
                            {totalSubjects} {totalSubjects === 1 ? 'materia' : 'materias'}
                        </span>
                        <span className="w-1 h-1 bg-slate-300 rounded-full" />
                        <span className="text-unicauca-blue/70 italic">Plan de Estudios Ing. Sistemas</span>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-2.5 bg-slate-50/30">
                    {groupedSubjects.length === 0 ? (
                        <div className="h-40 flex flex-col items-center justify-center text-center p-6 space-y-3 opacity-60">
                            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                                <BookOpenCheck size={24} strokeWidth={1.5} />
                            </div>
                            <p className="text-sm text-slate-500 font-medium leading-relaxed">
                                Selecciona materias del plan de estudios para comenzar
                            </p>
                        </div>
                    ) : (
                        groupedSubjects.map((item: any) => (
                            <div key={item.id} className="group flex items-center justify-between p-4 rounded-xl bg-white hover:bg-blue-50/50 transition-all duration-300 border border-slate-100 hover:border-blue-200 shadow-sm hover:shadow-md">
                                <div className="min-w-0 flex-1">
                                    <div className="font-bold text-sm truncate text-slate-800 group-hover:text-unicauca-blue transition-colors">
                                        {item.name || item.subjectName}
                                    </div>
                                    <div className="flex items-center gap-2 mt-1.5">
                                        {item.isCustom ? (
                                            <span className="inline-block px-2 py-0.5 bg-purple-50 text-purple-600 text-[9px] font-bold uppercase tracking-wider rounded-md border border-purple-100">
                                                Personalizada
                                            </span>
                                        ) : (
                                            <span className="inline-block px-2 py-0.5 bg-blue-50 text-unicauca-blue text-[9px] font-bold uppercase tracking-wider rounded-md border border-blue-100">
                                                Oficial
                                            </span>
                                        )}
                                        {item.groupCount && item.groupCount > 1 && (
                                            <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-600 text-[9px] font-bold rounded-md border border-slate-200">
                                                {item.groupCount} Grupos
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-1.5 ml-2 opacity-0 group-hover:opacity-100 transition-all duration-200 scale-90 group-hover:scale-100">
                                    {item.isCustom && (
                                        <button
                                            onClick={() => handleEditClick(item)}
                                            className="p-2 text-slate-500 hover:text-unicauca-blue hover:bg-white rounded-lg transition-all shadow-sm active:scale-90"
                                            title="Editar materia"
                                        >
                                            <Pencil size={14} />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDeleteClick(item)}
                                        className="p-2 text-slate-500 hover:text-unicauca-red hover:bg-white rounded-lg transition-all shadow-sm active:scale-90"
                                        title="Eliminar materia"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <AddCustomSubjectModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setEditingSubject(null);
                }}
                initialData={editingSubject}
            />

            <Modal
                isOpen={!!confirmDelete}
                onClose={() => setConfirmDelete(null)}
                title="¿Eliminar Materia?"
                footer={
                    <>
                        <button
                            onClick={() => setConfirmDelete(null)}
                            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={confirmRemoval}
                            className="px-4 py-2 text-sm font-medium text-white bg-unicauca-red hover:bg-unicauca-red-dark rounded-lg transition-colors shadow-sm"
                        >
                            Confirmar
                        </button>
                    </>
                }
            >
                <div className="text-center py-4">
                    <p className="text-slate-600 mb-2 font-medium">
                        ¿Estás seguro de que deseas eliminar <span className="font-extrabold text-slate-900 leading-tight">"{confirmDelete?.name}"</span>?
                    </p>
                </div>
                {confirmDelete?.isCustom && confirmDelete.groupCount && confirmDelete.groupCount > 1 && (
                    <p className="text-slate-500 text-sm mt-2">
                        Se eliminarán los {confirmDelete.groupCount} grupos de esta materia.
                    </p>
                )}
                {!confirmDelete?.isCustom && (
                    <p className="text-slate-500 text-sm mt-2">
                        Esto podría desbloquear materias que dependen de ella.
                    </p>
                )}
            </Modal>

            <Modal
                isOpen={isClearAllModalOpen}
                onClose={() => setIsClearAllModalOpen(false)}
                title="¿Eliminar Todas las Materias?"
                footer={
                    <>
                        <button
                            onClick={() => setIsClearAllModalOpen(false)}
                            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleClearAll}
                            className="px-4 py-2 text-sm font-medium text-white bg-unicauca-red hover:bg-unicauca-red-dark rounded-lg transition-colors shadow-sm"
                        >
                            Eliminar Todo
                        </button>
                    </>
                }
            >
                <p className="text-slate-600">
                    ¿Estás seguro de que deseas eliminar todas las materias seleccionadas? Esta acción no se puede deshacer.
                </p>
            </Modal>
        </>
    );
};