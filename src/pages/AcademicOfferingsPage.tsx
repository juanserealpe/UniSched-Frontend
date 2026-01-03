import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubjects } from '../context/SubjectContext';
import { SubjectOfferingCard } from '../components/SubjectOfferingCard';
import { ArrowLeft, GraduationCap, Users } from 'lucide-react';
import type { ApiSubjectGroup } from '../types';

export const AcademicOfferingsPage: React.FC = () => {
    const navigate = useNavigate();
    const { validationData, customSubjects } = useSubjects();

    if (!validationData) {
        // If no validation data, redirect back to selection
        navigate('/');
        return null;
    }

    // Combine official subjects with their groups and custom subjects
    const allSubjectsWithGroups: Array<{
        subjectId: number;
        subjectName: string;
        groups: ApiSubjectGroup[];
        isCustom: boolean;
    }> = [];

    // Add official subjects from validation data
    Object.entries(validationData.groupsBySubject).forEach(([subjectId, groups]) => {
        if (groups.length > 0) {
            allSubjectsWithGroups.push({
                subjectId: parseInt(subjectId, 10),
                subjectName: groups[0].subjectName,
                groups: groups,
                isCustom: false,
            });
        }
    });

    // Add custom subjects (they won't have groups from API)
    customSubjects.forEach((customSubject) => {
        allSubjectsWithGroups.push({
            subjectId: typeof customSubject.id === 'number' ? customSubject.id : customSubject.subjectId,
            subjectName: customSubject.subjectName,
            groups: [],
            isCustom: true,
        });
    });

    // Calculate statistics
    const totalSubjects = allSubjectsWithGroups.length;
    const totalGroups = allSubjectsWithGroups.reduce((sum, subject) => sum + subject.groups.length, 0);

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900">
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
        </div>
    );
};
