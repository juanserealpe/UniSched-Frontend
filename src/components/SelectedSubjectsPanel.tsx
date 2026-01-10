import React, { useState, useMemo } from 'react';
import { useSubjects } from '../context/SubjectContext';
import { Trash2, Pencil } from 'lucide-react';
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
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
                <div className="p-4 border-b bg-slate-50 flex items-center justify-between">
                    <div>
                        <h2 className="font-semibold text-slate-800">Materias Seleccionadas</h2>
                        <div className="text-xs text-slate-500 mt-1">Total: {totalSubjects} materias</div>
                    </div>
                    {totalSubjects > 0 && (
                        <button
                            onClick={() => setIsClearAllModalOpen(true)}
                            className="text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2 py-1.5 rounded-lg transition-colors"
                        >
                            Eliminar Todo
                        </button>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {groupedSubjects.length === 0 && (
                        <div className="p-4 text-center text-slate-400 text-sm">
                            No has seleccionado ninguna materia.
                        </div>
                    )}

                    {groupedSubjects.map((item: any) => (
                        <div key={item.id} className="group flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200">
                            <div className="min-w-0 flex-1">
                                <div className="font-medium text-sm truncate text-slate-700">
                                    {item.name || item.subjectName}
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                    {item.isCustom && (
                                        <span className="inline-block px-1.5 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-bold uppercase rounded">
                                            Custom
                                        </span>
                                    )}
                                    {item.groupCount && item.groupCount > 1 && (
                                        <span className="inline-block px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded">
                                            {item.groupCount} grupos
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                {item.isCustom && (
                                    <button
                                        onClick={() => handleEditClick(item)}
                                        className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="Editar materia"
                                    >
                                        <Pencil size={16} />
                                    </button>
                                )}
                                <button
                                    onClick={() => handleDeleteClick(item)}
                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Eliminar materia"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
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
                            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-sm"
                        >
                            Confirmar
                        </button>
                    </>
                }
            >
                <p className="text-slate-600">
                    ¿Estás seguro de que deseas eliminar <strong>{confirmDelete?.name}</strong>?
                </p>
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
                            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-sm"
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