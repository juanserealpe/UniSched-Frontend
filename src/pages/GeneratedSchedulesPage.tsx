import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubjects } from '../context/SubjectContext';
import { ScheduleGrid } from '../components/ScheduleGrid';
import { ArrowLeft, ChevronLeft, ChevronRight, Calendar, Info, Clock } from 'lucide-react';

export const GeneratedSchedulesPage: React.FC = () => {
    const navigate = useNavigate();
    const { generatedSchedules, customSubjects } = useSubjects();
    const [currentIndex, setCurrentIndex] = useState(0);

    if (generatedSchedules.length === 0) {
        return (
            <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 text-center max-w-md">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Calendar className="text-blue-600" size={32} />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800 mb-2">No se encontraron horarios</h2>
                    <p className="text-slate-500 mb-6">
                        No pudimos encontrar combinaciones de horarios sin conflictos para las materias seleccionadas.
                    </p>
                    <button
                        onClick={() => navigate('/offerings')}
                        className="w-full py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors"
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
        <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900">
            {/* Header */}
            <header className="bg-slate-900 text-white p-4 shadow-md sticky top-0 z-20">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/offerings')}
                            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                            title="Volver a Oferta"
                        >
                            <ArrowLeft size={24} />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight">Horarios Generados</h1>
                            <div className="text-xs text-slate-400">Página de Resultados</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex flex-col items-end">
                            <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">Total Encontrados</span>
                            <span className="text-lg font-mono text-blue-400 font-bold">{totalSchedules}</span>
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
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 max-w-7xl mx-auto w-full p-4 lg:p-6 space-y-6">

                {/* Stats and Info Bar */}
                <div className="flex flex-col md:flex-row gap-4 items-stretch overflow-auto pb-2">
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 flex items-center gap-4 flex-1 min-w-[200px]">
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                            <Clock size={20} />
                        </div>
                        <div>
                            <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Carga de Horario</div>
                            <div className="font-bold text-slate-800">
                                {currentSchedule.length} Materias Oficiales
                            </div>
                        </div>
                    </div>

                    {customSubjects.length > 0 && (
                        <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 flex items-center gap-4 flex-1 min-w-[200px]">
                            <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
                                <Info size={20} />
                            </div>
                            <div className="text-xs">
                                <div className="font-bold text-amber-800 mb-0.5">Materias Custom ({customSubjects.length})</div>
                                <div className="text-amber-700">Incluidas en la validación de conflictos por el servidor.</div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Grid */}
                <div className="relative">
                    <ScheduleGrid schedule={currentSchedule} />
                </div>

                {/* Actions Footer Mobile */}
                <div className="md:hidden fixed bottom-4 left-4 right-4 flex justify-between gap-4">
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
