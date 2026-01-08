import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubjects } from '../context/SubjectContext';
import { SubjectOfferingCard } from '../components/SubjectOfferingCard';
import { ArrowLeft, GraduationCap, Users, Calendar } from 'lucide-react';
import type { ApiSubjectGroup } from '../types';

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
        selectedIds
    } = useSubjects();

    if (!validationData) {
        // If no validation data, redirect back to selection
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
    customSubjects.forEach((customSubject) => {
        allSubjectsWithGroups.push({
            subjectId: customSubject.id,
            subjectName: customSubject.subjectName,
            groups: [{
                id: customSubject.id as any,
                subjectId: customSubject.subjectId,
                subjectName: customSubject.subjectName,
                groupCode: customSubject.groupCode || 'GRUPO',
                professors: customSubject.professors || 'Personalizado',
                schedules: customSubject.schedules
            }],
            isCustom: true,
        });
    });

    // Calculate statistics
    const totalSubjects = allSubjectsWithGroups.length;
    const totalGroups = allSubjectsWithGroups.reduce((sum, subject) => sum + subject.groups.length, 0);

    const handleGenerateSchedules = async () => {
        setIsLoadingSchedules(true);
        setScheduleError(null);

        const officialIds = selectedSubjectsList
            .filter((s: any) => !s.isCustom)
            .map((s) => s.id);

        const formatTime = (time: string) => time.split(':').length === 2 ? `${time}:00` : time;

        const payload = {
            subjectIds: officialIds,
            customSubjects: customSubjects.map(cs => ({
                name: cs.subjectName,
                groupCode: cs.groupCode || '',
                schedules: cs.schedules.map(sch => ({
                    dayOfWeek: sch.dayOfWeek,
                    startTime: formatTime(sch.startTime),
                    endTime: formatTime(sch.endTime)
                }))
            }))
        };

        try {
            const response = await fetch('http://localhost:8080/api/subjects/generate-schedules', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Error al generar horarios');
            }

            const data = await response.json();
            setGeneratedSchedules(data);
            navigate('/schedules');
        } catch (error: any) {
            console.error('Generation Error:', error);
            setScheduleError(error.message || 'Error de conexión con el servidor');
            alert(error.message || 'No se pudieron generar los horarios. Intenta de nuevo.');
        } finally {
            setIsLoadingSchedules(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900 pb-24">
            {/* Header */}
            <header className="bg-slate-900 text-white p-4 shadow-md sticky top-0 z-20">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/')}
                            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                            title="Volver a selección"
                        >
                            <ArrowLeft size={24} />
                        </button>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-lg">
                                U
                            </div>
                            <h1 className="text-xl font-bold tracking-tight">UNISCHED</h1>
                        </div>
                    </div>
                    <div className="text-sm text-slate-400">Oferta Académica</div>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 max-w-7xl mx-auto w-full p-4 lg:p-6">
                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <GraduationCap className="text-blue-600" size={24} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-slate-800">{totalSubjects}</div>
                                <div className="text-sm text-slate-500">Materias Seleccionadas</div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-green-100 rounded-lg">
                                <Users className="text-green-600" size={24} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-slate-800">{totalGroups}</div>
                                <div className="text-sm text-slate-500">Grupos Disponibles</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Subject Cards */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-slate-800 mb-4">
                        Explorar Oferta Académica
                    </h2>
                    {allSubjectsWithGroups.length === 0 ? (
                        <div className="bg-white rounded-xl p-12 text-center border border-slate-200">
                            <p className="text-slate-500">No hay materias seleccionadas.</p>
                        </div>
                    ) : (
                        allSubjectsWithGroups.map((subject) => (
                            <SubjectOfferingCard
                                key={`${subject.isCustom ? 'custom' : 'official'}-${subject.subjectId}`}
                                subjectName={subject.subjectName}
                                subjectId={subject.subjectId}
                                groups={subject.groups}
                                isCustom={subject.isCustom}
                            />
                        ))
                    )}
                </div>
            </div>

            {/* Footer / Floating Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-30">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 text-slate-700 font-medium rounded-xl hover:bg-slate-200 transition-colors"
                    >
                        <ArrowLeft size={20} />
                        Volver
                    </button>

                    <button
                        onClick={handleGenerateSchedules}
                        disabled={isLoadingSchedules || totalSubjects === 0}
                        className="flex items-center gap-2 px-8 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg hover:shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoadingSchedules ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Generando...
                            </>
                        ) : (
                            <>
                                <Calendar size={20} />
                                Generar Horarios
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
