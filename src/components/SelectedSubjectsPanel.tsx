import React, { useState } from 'react';
import { useSubjects } from '../context/SubjectContext';
import { Trash2 } from 'lucide-react';
import { Modal } from './Modal';
import type { SubjectGroup, SubjectWithState } from '../types';

export const SelectedSubjectsPanel: React.FC = () => {
    const { selectedSubjectsList, toggleSubject, removeCustomSubject } = useSubjects();
    const [confirmDelete, setConfirmDelete] = useState<{ id: string | number; name: string; isCustom: boolean } | null>(null);

    const handleDeleteClick = (item: any) => {
        setConfirmDelete({
            id: item.id,
            name: item.name || item.subjectName,
            isCustom: !!item.isCustom
        });
    };

    const confirmRemoval = () => {
        if (!confirmDelete) return;

        if (confirmDelete.isCustom) {
            removeCustomSubject(confirmDelete.id);
        } else {
            toggleSubject(confirmDelete.id as number);
        }
        setConfirmDelete(null);
    };

    const totalSubjects = selectedSubjectsList.length;

    return (
        <>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
                <div className="p-4 border-b bg-slate-50">
                    <h2 className="font-semibold text-slate-800">Materias Seleccionadas</h2>
                    <div className="text-xs text-slate-500 mt-1">Total: {totalSubjects} materias</div>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {selectedSubjectsList.length === 0 && (
                        <div className="p-4 text-center text-slate-400 text-sm">
                            No has seleccionado ninguna materia.
                        </div>
                    )}

                    {selectedSubjectsList.map((item: any) => (
                        <div key={item.id} className="group flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200">
                            <div className="min-w-0">
                                <div className="font-medium text-sm truncate text-slate-700">
                                    {item.name || item.subjectName}
                                </div>
                                {item.isCustom && (
                                    <span className="inline-block mt-1 px-1.5 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-bold uppercase rounded">
                                        Custom
                                    </span>
                                )}
                            </div>

                            <button
                                onClick={() => handleDeleteClick(item)}
                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                title="Eliminar materia"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

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
                {!confirmDelete?.isCustom && (
                    <p className="text-slate-500 text-sm mt-2">
                        Esto podría desbloquear materias que dependen de ella.
                    </p>
                )}
            </Modal>
        </>
    );
};
