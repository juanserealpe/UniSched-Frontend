/**
 * Page component for viewing and managing selected subjects.
 * Displays available groups (offerings) and allows schedule generation.
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubjects } from '../context/SubjectContext';
import { SubjectOfferingCard } from '../components/SubjectOfferingCard';
import { GraduationCap, Calendar } from 'lucide-react';
import { Header } from '../components/Header';
import { AddCustomSubjectModal } from '../components/AddCustomSubjectModal';
import type { ApiSubjectGroup, CustomSubjectRequest } from '../types';

/**
 * Main offerings page.
 * Aggregates official and custom subjects, allows group selection/exclusion,
 * and triggers schedule generation.
 */
export const AcademicOfferingsPage: React.FC = () => {
    const navigate = useNavigate();
    const {
        validationData,
        customSubjects,
        setIsLoadingSchedules,
        setGeneratedSchedules,
        setScheduleError,
        isLoadingSchedules,
        selectedSubjectsList,
        selectedIds,
        excludedGroupIds,
        isGroupExcluded
    } = useSubjects();

    const [editingSubject, setEditingSubject] = React.useState<{ name: string; groups: any[] } | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);

    if (!validationData) {
        navigate('/');
        return null;
    }

    // Combine official subjects with their groups and custom subjects
    const allSubjectsWithGroups: Array<{
        subjectId: number | string;
        subjectName: string;
        groups: ApiSubjectGroup[];
        isCustom: boolean;
    }> = [];

    // Add official subjects from validation data (only if they are currently selected)
    Object.entries(validationData.groupsBySubject).forEach(([subjectId, groups]) => {
        const id = parseInt(subjectId, 10);
        if (groups.length > 0 && selectedIds.includes(id)) {
            allSubjectsWithGroups.push({
                subjectId: id,
                subjectName: groups[0].subjectName,
                groups: groups,
                isCustom: false,
            });
        }
    });

    // Add custom subjects
    const customSubjectsMap = new Map<string, ApiSubjectGroup[]>();
    customSubjects.forEach((customSubject) => {
        if (!customSubjectsMap.has(customSubject.subjectName)) {
            customSubjectsMap.set(customSubject.subjectName, []);
        }
        customSubjectsMap.get(customSubject.subjectName)!.push({
            id: customSubject.id as any,
            subjectId: customSubject.subjectId,
            subjectName: customSubject.subjectName,
            groupCode: customSubject.groupCode,
            professors: customSubject.professors,
            schedules: customSubject.schedules
        });
    });

    customSubjectsMap.forEach((groups, subjectName) => {
        allSubjectsWithGroups.push({
            subjectId: groups[0].id,
            subjectName: subjectName,
            groups: groups,
            isCustom: true,
        });
    });

    const handleGenerateSchedules = async () => {
        setIsLoadingSchedules(true);
        setScheduleError(null);

        const officialIds = selectedSubjectsList
            .filter((s: any) => !s.isCustom && typeof s.id === 'number')
            .map((s) => s.id);

        const formatTime = (time: string) => {
            if (time.split(':').length === 3) return time;
            if (time.split(':').length === 2) return `${time}:00`;
            return time;
        };

        // --- VALIDATION START ---
        // Check official subjects
        const officialViolation = allSubjectsWithGroups
            .filter(s => !s.isCustom)
            .find(s => {
                const excludedCount = s.groups.filter(g => isGroupExcluded(g.id, false)).length;
                return s.groups.length - excludedCount === 0;
            });

        // Check custom subjects
        const customViolation = allSubjectsWithGroups
            .filter(s => s.isCustom)
            .find(s => {
                const excludedCount = s.groups.filter(g => isGroupExcluded(g.id, true, s.subjectName, g.groupCode)).length;
                return s.groups.length - excludedCount === 0;
            });

        if (officialViolation || customViolation) {
            const violationName = officialViolation ? officialViolation.subjectName : customViolation?.subjectName;
            alert(`⚠️ Debes seleccionar al menos un grupo para la materia "${violationName}".`);
            setIsLoadingSchedules(false);
            return;
        }
        // --- VALIDATION END ---

        const customSubjectsGroupedByName = new Map<string, typeof customSubjects>();
        customSubjects.forEach(cs => {
            if (!customSubjectsGroupedByName.has(cs.subjectName)) {
                customSubjectsGroupedByName.set(cs.subjectName, []);
            }
            customSubjectsGroupedByName.get(cs.subjectName)!.push(cs);
        });

        const customSubjectsPayload: CustomSubjectRequest[] = Array.from(
            customSubjectsGroupedByName.entries()
        ).map(([name, groups]) => {
            // FILTER OUT EXCLUDED CUSTOM GROUPS
            const activeGroups = groups.filter(g => !isGroupExcluded(g.id, true, name, g.groupCode));

            return {
                name: name,
                groups: activeGroups.map(g => ({
                    groupCode: g.groupCode,
                    professors: g.professors || null,
                    schedules: g.schedules.map(sch => ({
                        dayOfWeek: sch.dayOfWeek,
                        startTime: formatTime(sch.startTime),
                        endTime: formatTime(sch.endTime)
                    }))
                }))
            };
        }).filter(subject => subject.groups.length > 0); // Should be handled by validation above, but safe guard

        const payload = {
            subjectIds: officialIds.length > 0 ? officialIds : [],
            excludedGroupIds: Array.from(excludedGroupIds), // Send official excluded IDs
            customSubjects: customSubjectsPayload.length > 0 ? customSubjectsPayload : null
        };

        try {
            const response = await fetch('http://localhost:8080/api/subjects/generate-schedules', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.errors?.[0] || errorData.message || 'Error al generar horarios');
            }

            const data = await response.json();
            setGeneratedSchedules(data);
            navigate('/schedules');
        } catch (error: any) {
            setScheduleError(error.message || 'Error de conexión con el servidor');
            alert(`Error: ${error.message || 'No se pudieron generar los horarios. Intenta de nuevo.'}`);
        } finally {
            setIsLoadingSchedules(false);
        }
    };

    const handleEditCustomSubject = (subjectName: string, groups: ApiSubjectGroup[]) => {
        setEditingSubject({
            name: subjectName,
            groups: groups.map(g => ({
                groupCode: g.groupCode,
                professors: g.professors,
                schedules: g.schedules
            }))
        });
        setIsEditModalOpen(true);
    };

    return (
        <div className="min-h-screen bg-[#F1F5F9] flex flex-col font-sans text-slate-900 pb-24">
            <Header
                subtitle="Oferta Académica • Selección de Grupos"
                showBackButton
                onBackButtonClick={() => navigate('/')}
            />

            <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                <div className="mb-10 text-center sm:text-left">
                    <div className="flex items-center gap-3 mb-3 justify-center sm:justify-start">
                        <div className="h-8 w-1.5 rounded-full bg-unicauca-red shadow-sm" />
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                            Personaliza tu Horario
                        </h2>
                    </div>
                    <p className="text-slate-500 text-sm sm:text-base font-medium max-w-2xl">
                        A continuación se muestran las materias que has seleccionado. Explora los grupos disponibles y ajusta tu selección antes de generar tu horario final.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                    {allSubjectsWithGroups.length === 0 ? (
                        <div className="col-span-full py-20 px-6 rounded-3xl bg-white/50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center">
                            <GraduationCap className="text-slate-300 mb-4" size={56} strokeWidth={1} />
                            <h3 className="text-xl font-bold text-slate-500 mb-2">No hay materias seleccionadas</h3>
                            <p className="text-slate-400 max-w-sm">
                                Vuelve al plan de estudios para seleccionar las materias que deseas cursar este semestre.
                            </p>
                        </div>
                    ) : (
                        allSubjectsWithGroups.map(subject => (
                            <div key={subject.subjectId} className="h-full">
                                <SubjectOfferingCard
                                    subjectName={subject.subjectName}
                                    subjectId={subject.subjectId}
                                    groups={subject.groups}
                                    isCustom={subject.isCustom}
                                    onEdit={subject.isCustom ? () => handleEditCustomSubject(subject.subjectName, subject.groups) : undefined}
                                />
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

            {/* Footer / Floating Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-slate-200 py-6 px-4 shadow-[0_-10px_30px_-5px_rgba(0,0,0,0.05)] z-40">
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                    <div className="hidden sm:flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-0.5">Estado de Selección</span>
                        <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-sm shadow-green-200" />
                            <span className="text-sm font-bold text-slate-700">{allSubjectsWithGroups.length} Materias Listas</span>
                        </div>
                    </div>
                    <button
                        onClick={handleGenerateSchedules}
                        disabled={isLoadingSchedules || allSubjectsWithGroups.length === 0}
                        className="w-full sm:w-auto px-10 py-4 bg-unicauca-red hover:bg-unicauca-red-dark disabled:bg-slate-300 text-white font-extrabold rounded-2xl transition-all duration-300 shadow-lg shadow-unicauca-red/10 hover:shadow-unicauca-red/20 active:scale-95 flex items-center justify-center gap-3 group uppercase tracking-wider text-sm"
                    >
                        {isLoadingSchedules ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Generando...
                            </>
                        ) : (
                            <>
                                <span>Generar Horarios Alternativos</span>
                                <Calendar size={20} className="group-hover:rotate-12 transition-transform" />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};