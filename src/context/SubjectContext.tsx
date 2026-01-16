/**
 * Context for managing subject selection and schedule generation state.
 * Handles state validation, local storage persistence, and custom subject management.
 */
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
    // Group Exclusion
    excludedGroupIds: Set<number>;
    excludedCustomGroups: Map<string, Set<string>>;
    toggleGroupExclusion: (groupId: number | string, isCustom: boolean, subjectName?: string, groupCode?: string) => void;
    isGroupExcluded: (groupId: number | string, isCustom: boolean, subjectName?: string, groupCode?: string) => boolean;
}

const SubjectContext = createContext<SubjectContextType | undefined>(undefined);

/**
 * Provider component that wraps the application and supplies subject context.
 * @param children - Child components
 */
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

    // Exclusion State
    const [excludedGroupIds, setExcludedGroupIds] = useState<Set<number>>(new Set());
    const [excludedCustomGroups, setExcludedCustomGroups] = useState<Map<string, Set<string>>>(new Map());

    const toggleGroupExclusion = useCallback((groupId: number | string, isCustom: boolean, subjectName?: string, groupCode?: string) => {
        if (isCustom) {
            if (!subjectName || !groupCode) return;
            setExcludedCustomGroups(prev => {
                const newMap = new Map(prev);
                const currentSet = newMap.get(subjectName) || new Set();
                const newSet = new Set(currentSet);

                if (newSet.has(groupCode)) {
                    newSet.delete(groupCode);
                } else {
                    newSet.add(groupCode);
                }

                if (newSet.size === 0) {
                    newMap.delete(subjectName);
                } else {
                    newMap.set(subjectName, newSet);
                }
                return newMap;
            });
        } else {
            // Official subject
            const id = groupId as number;
            setExcludedGroupIds(prev => {
                const newSet = new Set(prev);
                if (newSet.has(id)) {
                    newSet.delete(id);
                } else {
                    newSet.add(id);
                }
                return newSet;
            });
        }
    }, []);

    const isGroupExcluded = useCallback((groupId: number | string, isCustom: boolean, subjectName?: string, groupCode?: string): boolean => {
        if (isCustom) {
            if (!subjectName || !groupCode) return false;
            return excludedCustomGroups.get(subjectName)?.has(groupCode) || false;
        } else {
            return excludedGroupIds.has(groupId as number);
        }
    }, [excludedGroupIds, excludedCustomGroups]);

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
                // Deselect: Remove from list
                return prev.filter(sId => sId !== id);
            } else {
                // Select: Add to list
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
        setExcludedGroupIds(new Set());
        setExcludedCustomGroups(new Map());
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
        excludedGroupIds,
        excludedCustomGroups,
        toggleGroupExclusion,
        isGroupExcluded,
    };

    return (
        <SubjectContext.Provider value={value}>
            {children}
        </SubjectContext.Provider>
    );
}

/**
 * Custom hook to consume the SubjectContext.
 * @throws Error if used outside of SubjectProvider
 */
export function useSubjects() {
    const context = useContext(SubjectContext);
    if (context === undefined) {
        throw new Error('useSubjects must be used within a SubjectProvider');
    }
    return context;
}
