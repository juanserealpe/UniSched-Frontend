import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubjects } from '../context/SubjectContext';
import { ScheduleGrid } from '../components/ScheduleGrid';
import { ChevronLeft, ChevronRight, Calendar, Info, Clock, BookOpen, User, Users } from 'lucide-react';
import { Header } from '../components/Header';

export const GeneratedSchedulesPage: React.FC = () => {
    const navigate = useNavigate();
    const { generatedSchedules, customSubjects } = useSubjects();
    const [currentIndex, setCurrentIndex] = useState(0);

    if (generatedSchedules.length === 0) {
        return (
            <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 text-center max-w-md">
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-100">
                        <Calendar className="text-unicauca-blue" size={32} />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800 mb-2">No se encontraron horarios</h2>
                    <p className="text-slate-500 mb-6">
                        No pudimos encontrar combinaciones de horarios sin conflictos para las materias seleccionadas.
                    </p>
                    <button
                        onClick={() => navigate('/offerings')}
                        className="w-full py-3 bg-unicauca-blue text-white font-bold rounded-xl hover:bg-unicauca-blue-light transition-all shadow-lg shadow-unicauca-blue/10 active:scale-95"
                    >
                        Volver a Oferta Académica
                    </button>
                </div>
            </div>
        );
    }

    const currentSchedule = generatedSchedules[currentIndex];
    const totalSchedules = generatedSchedules.length;

    const handleNext = () => {
        if (currentIndex < totalSchedules - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900 overflow-hidden">
            {/* Header */}
            <Header
                subtitle="Página de Resultados"
                showBackButton
                onBackButtonClick={() => navigate('/offerings')}
                rightElement={
                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex flex-col items-end">
                            <span className="text-[10px] text-blue-200/60 uppercase tracking-wider font-bold">Total Encontrados</span>
                            <span className="text-lg font-mono text-white font-bold">{totalSchedules}</span>
                        </div>
                        <div className="w-px h-8 bg-slate-700 mx-2 hidden md:block"></div>
                        <div className="flex items-center gap-2 bg-slate-800 p-1 rounded-xl border border-slate-700">
                            <button
                                onClick={handlePrev}
                                disabled={currentIndex === 0}
                                className="p-2 hover:bg-slate-700 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <div className="px-3 py-1 bg-slate-900 rounded-lg text-sm font-mono font-bold min-w-[100px] text-center">
                                {currentIndex + 1} / {totalSchedules}
                            </div>
                            <button
                                onClick={handleNext}
                                disabled={currentIndex === totalSchedules - 1}
                                className="p-2 hover:bg-slate-700 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                }
            />

            {/* Main Content */}
            <div className="flex-1 max-w-[1600px] mx-auto w-full p-4 lg:p-6 overflow-hidden flex flex-col">

                {/* Responsive Grid Layout */}
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_350px] xl:grid-cols-[1fr_400px] gap-6 overflow-hidden">

                    {/* LEFT: Schedule Grid */}
                    <div className="flex flex-col gap-4 overflow-hidden h-full">
                        {/* Stats Bar */}
                        <div className="flex flex-row gap-4 items-stretch shrink-0">
                            <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-200 flex items-center gap-3 flex-1">
                                <div className="p-2 bg-blue-50 rounded-lg text-unicauca-blue shrink-0">
                                    <Clock size={16} />
                                </div>
                                <div className="min-w-0">
                                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider truncate">Carga Académica</div>
                                    <div className="text-sm font-bold text-slate-800 truncate">
                                        {currentSchedule.length} Materias
                                    </div>
                                </div>
                            </div>

                            {customSubjects.length > 0 && (
                                <div className="bg-amber-50 rounded-xl p-3 border border-amber-200 flex items-center gap-3 flex-1">
                                    <div className="p-2 bg-amber-100 rounded-lg text-amber-600 shrink-0">
                                        <Info size={16} />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-xs font-bold text-amber-800 mb-0.5 truncate">Personalizadas ({customSubjects.length})</div>
                                        <div className="text-[10px] text-amber-700 truncate">Incluidas en validación</div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="relative flex-1 overflow-auto rounded-2xl border border-slate-200 bg-white/50 shadow-sm">
                            <ScheduleGrid schedule={currentSchedule} />
                        </div>
                    </div>

                    {/* RIGHT: Details Sidebar */}
                    <div className="hidden lg:flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-full">
                        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                            <h3 className="font-extrabold text-slate-800 flex items-center gap-2">
                                <BookOpen size={18} className="text-unicauca-blue" />
                                Detalle de Materias
                            </h3>
                            <p className="text-xs text-slate-500 mt-1">
                                Configuración seleccionada para esta opción de horario.
                            </p>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
                            {currentSchedule.map((subject, idx) => (
                                <div key={`${subject.subjectName}-${idx}`} className="p-3 rounded-xl border border-slate-100 bg-slate-50/30 hover:bg-white hover:shadow-md transition-all group">
                                    <div className="mb-2">
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Materia</div>
                                        <div className="font-bold text-slate-800 text-sm leading-tight group-hover:text-unicauca-blue transition-colors">
                                            {subject.subjectName}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 mt-3">
                                        <div className="bg-white p-2 rounded-lg border border-slate-100">
                                            <div className="flex items-center gap-1.5 mb-1">
                                                <Users size={12} className="text-unicauca-red" />
                                                <span className="text-[10px] font-bold text-slate-500 uppercase">Grupo</span>
                                            </div>
                                            <div className="font-mono font-bold text-slate-700 text-xs">
                                                {subject.groupCode}
                                            </div>
                                        </div>

                                        <div className="bg-white p-2 rounded-lg border border-slate-100">
                                            <div className="flex items-center gap-1.5 mb-1">
                                                <User size={12} className="text-unicauca-blue" />
                                                <span className="text-[10px] font-bold text-slate-500 uppercase">Docente</span>
                                            </div>
                                            <div className="text-xs text-slate-600 font-medium truncate" title={subject.professors || 'Sin asignar'}>
                                                {subject.professors || 'Sin asignar'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

                {/* Actions Footer Mobile */}
                <div className="md:hidden mt-4 flex justify-between gap-4 shrink-0">
                    <button
                        onClick={handlePrev}
                        disabled={currentIndex === 0}
                        className="flex-1 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-2xl shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        <ChevronLeft size={20} /> Anterior
                    </button>
                    <button
                        onClick={handleNext}
                        disabled={currentIndex === totalSchedules - 1}
                        className="flex-1 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-2xl shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        Siguiente <ChevronRight size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};
