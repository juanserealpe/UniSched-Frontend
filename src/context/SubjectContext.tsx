import React, { createContext, useContext, useMemo, useState, useCallback } from 'react';
import type { SubjectGroup, SubjectWithState, ValidationResponse } from '../types';
import { studyPlan } from '../data/studyPlan';
import { calculateSubjectStates } from '../utils/validation';

interface SubjectContextType {
    subjects: SubjectWithState[];
    selectedIds: number[];
    customSubjects: SubjectGroup[];
    toggleSubject: (id: number) => void;
    addCustomSubject: (subject: SubjectGroup) => void;
    removeCustomSubject: (id: string | number) => void; // custom IDs are strings uuid, official are numbers
    // Helper to get full subject objects
    selectedSubjectsList: (SubjectWithState | SubjectGroup)[];
    // Validation data from API
    validationData: ValidationResponse | null;
    setValidationData: (data: ValidationResponse | null) => void;
}

const SubjectContext = createContext<SubjectContextType | undefined>(undefined);

export function SubjectProvider({ children }: { children: React.ReactNode }) {
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [customSubjects, setCustomSubjects] = useState<SubjectGroup[]>([]);
    const [validationData, setValidationData] = useState<ValidationResponse | null>(null);

    // Calculate states for officially defined subjects
    const subjectsWithState = useMemo(() => {
        return calculateSubjectStates(studyPlan, selectedIds);
    }, [selectedIds]);

    const toggleSubject = useCallback((id: number) => {
        setSelectedIds(prev => {
            if (prev.includes(id)) {
                // Deselect
                // Logic: Just remove it.
                // Prompt says: "3. Si está SELECCIONADA → Deseleccionarla (con confirmación si afecta otras)"
                // For now, simple toggle. We can handle confirmation in UI or here. 
                // Staying simple for now as requested by architecture (UI handles confirmation usually).
                return prev.filter(sId => sId !== id);
            } else {
                // Select
                // Logic: "4. Si tiene obligatoria → Auto-seleccionar la pareja o mostrar warning"
                // Prompt Check: "6. Sistema muestra warning... 7. Usuario selecciona el lab"
                // This implies NO auto-select, but manual selection.
                // So just add it.
                return [...prev, id];
            }
        });
    }, []);

    const addCustomSubject = useCallback((subject: SubjectGroup) => {
        setCustomSubjects(prev => [...prev, subject]);
    }, []);

    const removeCustomSubject = useCallback((id: string | number) => {
        setCustomSubjects(prev => prev.filter(s => s.id !== id));
    }, []);

    // Combined list for the side panel
    const selectedSubjectsList = useMemo(() => {
        const official = subjectsWithState.filter(s => selectedIds.includes(s.id));
        return [...official, ...customSubjects];
    }, [subjectsWithState, selectedIds, customSubjects]);

    const value = {
        subjects: subjectsWithState,
        selectedIds,
        customSubjects,
        toggleSubject,
        addCustomSubject,
        removeCustomSubject,
        selectedSubjectsList,
        validationData,
        setValidationData,
    };

    return (
        <SubjectContext.Provider value={value}>
            {children}
        </SubjectContext.Provider>
    );
}

export function useSubjects() {
    const context = useContext(SubjectContext);
    if (context === undefined) {
        throw new Error('useSubjects must be used within a SubjectProvider');
    }
    return context;
}
