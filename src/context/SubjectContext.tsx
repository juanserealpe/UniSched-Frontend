import React, { createContext, useContext, useMemo, useState, useCallback } from 'react';
import type { SubjectGroup, SubjectWithState, ValidationResponse, GeneratedSchedule } from '../types';
import { studyPlan } from '../data/studyPlan';
import { calculateSubjectStates } from '../utils/validation';

interface SubjectContextType {
    subjects: SubjectWithState[];
    selectedIds: number[];
    customSubjects: SubjectGroup[];
    toggleSubject: (id: number) => void;
    addCustomSubject: (subject: SubjectGroup) => void;
    updateCustomSubject: (oldName: string, newName: string, groups: { groupCode: string, professors: string, schedules: any[] }[]) => void;
    removeCustomSubject: (id: string | number) => void; // custom IDs are strings uuid, official are numbers
    clearAllSubjects: () => void;
    // Helper to get full subject objects
    selectedSubjectsList: (SubjectWithState | SubjectGroup)[];
    // Validation data from API
    validationData: ValidationResponse | null;
    setValidationData: (data: ValidationResponse | null) => void;
    // Generated schedules
    generatedSchedules: GeneratedSchedule[];
    setGeneratedSchedules: (schedules: GeneratedSchedule[]) => void;
    isLoadingSchedules: boolean;
    setIsLoadingSchedules: (loading: boolean) => void;
    scheduleError: string | null;
    setScheduleError: (error: string | null) => void;
}

const SubjectContext = createContext<SubjectContextType | undefined>(undefined);

export function SubjectProvider({ children }: { children: React.ReactNode }) {
    const [selectedIds, setSelectedIds] = useState<number[]>(() => {
        const saved = localStorage.getItem('selectedIds');
        return saved ? JSON.parse(saved) : [];
    });
    const [customSubjects, setCustomSubjects] = useState<SubjectGroup[]>(() => {
        const saved = localStorage.getItem('customSubjects');
        return saved ? JSON.parse(saved) : [];
    });
    const [validationData, setValidationData] = useState<ValidationResponse | null>(() => {
        const saved = localStorage.getItem('validationData');
        return saved ? JSON.parse(saved) : null;
    });
    const [generatedSchedules, setGeneratedSchedules] = useState<GeneratedSchedule[]>([]);
    const [isLoadingSchedules, setIsLoadingSchedules] = useState(false);
    const [scheduleError, setScheduleError] = useState<string | null>(null);

    // Persist to localStorage
    React.useEffect(() => {
        localStorage.setItem('selectedIds', JSON.stringify(selectedIds));
    }, [selectedIds]);

    React.useEffect(() => {
        localStorage.setItem('customSubjects', JSON.stringify(customSubjects));
    }, [customSubjects]);

    React.useEffect(() => {
        if (validationData) {
            localStorage.setItem('validationData', JSON.stringify(validationData));
        } else {
            localStorage.removeItem('validationData');
        }
    }, [validationData]);

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

    const updateCustomSubject = useCallback((oldName: string, newName: string, groups: { groupCode: string, professors: string, schedules: any[] }[]) => {
        setCustomSubjects(prev => {
            const preservedOtherSubjects = prev.filter(s => s.subjectName !== oldName);
            const newGroups = groups.map(group => ({
                id: `custom-${crypto.randomUUID()}`,
                subjectId: -1,
                subjectName: newName,
                groupCode: group.groupCode,
                professors: group.professors || 'Sin especificar',
                schedules: group.schedules,
                isCustom: true
            }));
            return [...preservedOtherSubjects, ...newGroups];
        });
    }, []);

    const removeCustomSubject = useCallback((id: string | number) => {
        setCustomSubjects(prev => prev.filter(s => s.id !== id));
    }, []);

    const clearAllSubjects = useCallback(() => {
        setSelectedIds([]);
        setCustomSubjects([]);
        setValidationData(null);
        setGeneratedSchedules([]);
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
        updateCustomSubject,
        removeCustomSubject,
        clearAllSubjects,
        selectedSubjectsList,
        validationData,
        setValidationData,
        generatedSchedules,
        setGeneratedSchedules,
        isLoadingSchedules,
        setIsLoadingSchedules,
        scheduleError,
        setScheduleError,
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
