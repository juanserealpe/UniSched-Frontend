/**
 * Main application component.
 * Sets up the router and context provider structure.
 */
import { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { SubjectProvider, useSubjects } from './context/SubjectContext';
import { SemesterView } from './components/SemesterView';
import { SelectedSubjectsPanel } from './components/SelectedSubjectsPanel';
import { AddCustomSubjectModal } from './components/AddCustomSubjectModal';
import { AcademicOfferingsPage } from './pages/AcademicOfferingsPage';
import { GeneratedSchedulesPage } from './pages/GeneratedSchedulesPage';
import { Plus, ArrowRight } from 'lucide-react';
import { Header } from './components/Header';
import type { ValidationResponse } from './types';

/**
 * Layout component for the main view (study plan and side panel).
 * Handles the initial validation flow before navigating to offerings.
 */
const MainLayout = () => {
  const navigate = useNavigate();
  const { selectedSubjectsList, setValidationData } = useSubjects();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  const handleContinue = async () => {
    if (selectedSubjectsList.length === 0) {
      alert('Debes seleccionar al menos una materia antes de continuar');
      return;
    }

    setIsValidating(true);

    const officialIds = selectedSubjectsList
      .filter((s: any) => !s.isCustom)
      .map((s) => s.id);

    try {
      const response = await fetch('http://localhost:8080/api/subjects/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subjectIds: officialIds }),
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const data: ValidationResponse = await response.json();

      if (!data.isValid) {
        alert(`Validation Failed:\n${data.errors.join('\n')}`);
        return;
      }

      setValidationData(data);
      navigate('/offerings');
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
      <Header subtitle="Sistema de Selección de Materias" />

      {/* Main Content */}
      <div className="flex-1 max-w-7xl mx-auto w-full p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Study Plan Area (3 cols) */}
        <div
          className="lg:col-span-3 space-y-8 overflow-auto"
          style={{ maxHeight: 'calc(100vh - 4rem - 5rem)' }} // 4rem header + 5rem footer aprox
        >
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2 sticky top-0 bg-white z-10 px-2">
              Plan de Estudios
              <span className="text-sm font-normal text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                Semestres 1-7
              </span>
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
        <div className="lg:col-span-1 lg:sticky lg:top-24">
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

/**
 * Root component of the application.
 * Configures global providers (Router, Subjects) and defines routes.
 */
function App() {
  return (
    <BrowserRouter>
      <SubjectProvider>
        <Routes>
          <Route path="/" element={<MainLayout />} />
          <Route path="/offerings" element={<AcademicOfferingsPage />} />
          <Route path="/schedules" element={<GeneratedSchedulesPage />} />
        </Routes>
      </SubjectProvider>
    </BrowserRouter>
  );
}

export default App;
