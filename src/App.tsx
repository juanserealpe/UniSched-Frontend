import React, { useState } from 'react';
import { SubjectProvider, useSubjects } from './context/SubjectContext';
import { SemesterView } from './components/SemesterView';
import { SelectedSubjectsPanel } from './components/SelectedSubjectsPanel';
import { AddCustomSubjectModal } from './components/AddCustomSubjectModal';
import { Plus, ArrowRight } from 'lucide-react';
import type { SubjectGroup } from './types';

const MainLayout = () => {
  const { selectedSubjectsList, subjects, customSubjects } = useSubjects();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  const handleContinue = async () => {
    setIsValidating(true);

    // 1. Extraer solo IDs de materias oficiales
    const officialIds = selectedSubjectsList
      .filter((s: any) => !s.isCustom)
      .map(s => s.id);

    try {
      // 2. Llamar API
      // Using a relative URL or configured proxy would be best, but hardcoding for demo as per prompt context usually implies localhost
      // Prompt says: "http://localhost:8080/api/subjects/validate"
      const response = await fetch('http://localhost:8080/api/subjects/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subjectIds: officialIds })
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();

      if (!data.isValid) {
        alert(`Validation Failed:\n${data.errors.join('\n')}`);
        return;
      }

      // 4. Success
      alert('Validation Successful! Proceeding to management view...');
      console.log('Official Groups:', data.groupsBySubject);
      console.log('Custom Groups:', customSubjects);

    } catch (error) {
      console.error('API Error:', error);
      alert('Error connecting to validation API. Check console.');
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900">
      {/* Header */}
      <header className="bg-slate-900 text-white p-4 shadow-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-lg">U</div>
            <h1 className="text-xl font-bold tracking-tight">UNISCHED</h1>
          </div>
          <div className="text-sm text-slate-400">Sistema de Selección de Materias</div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 max-w-7xl mx-auto w-full p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-4 gap-6 items-start pb-48">

        {/* Study Plan Area (3 cols) */}
        <div className="lg:col-span-3 space-y-8 overflow-hidden">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2 sticky left-0">
              Plan de Estudios
              <span className="text-sm font-normal text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">Semestres 1-7</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 7 }, (_, i) => i + 1).map((semester) => (
                <div key={semester} className="min-w-0">
                  <SemesterView semester={semester} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar (1 col) */}
        <div className="lg:col-span-1 lg:sticky lg:top-24 h-[calc(100vh-8rem)]">
          <SelectedSubjectsPanel />
        </div>

      </div>

      {/* Footer / Floating Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 text-slate-700 font-medium rounded-xl hover:bg-slate-200 transition-colors"
          >
            <Plus size={20} />
            Agregar Materia
          </button>

          <button
            onClick={handleContinue}
            disabled={isValidating}
            className="flex items-center gap-2 px-8 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg hover:shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isValidating ? 'Validando...' : 'Continuar'}
            {!isValidating && <ArrowRight size={20} />}
          </button>
        </div>
      </div>

      <AddCustomSubjectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

function App() {
  return (
    <SubjectProvider>
      <MainLayout />
    </SubjectProvider>
  );
}

export default App;
