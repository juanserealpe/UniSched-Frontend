export type SubjectStatus = 'available' | 'blocked' | 'selected';

export interface Subject {
    id: number;
    name: string;
    semester: number;
    unlocks: number[];
    prerequisite?: number;
    mandatoryWith?: number;
}

export interface SubjectWithState extends Subject {
    status: SubjectStatus;
    blockReason?: string;
    warning?: string;
}

export interface Schedule {
    dayOfWeek: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY';
    startTime: string;
    endTime: string;
}

export interface SubjectGroup {
    id: string | number;
    subjectId: number;
    subjectName: string;
    groupCode: string;
    professors: string;
    schedules: Schedule[];
    isCustom: boolean;
}

// API Request types
export interface CustomGroupRequest {
    groupCode: string;
    professors: string | null;
    schedules: Schedule[];
}

export interface CustomSubjectRequest {
    name: string;
    groups: CustomGroupRequest[];
}

// API Response types
export interface ValidationResponse {
    isValid: boolean;
    errors: string[];
    groupsBySubject: Record<string, ApiSubjectGroup[]>;
}

export interface ApiSubjectGroup {
    id: number;
    subjectId: number;
    subjectName: string;
    groupCode: string;
    professors: string;
    schedules: Schedule[];
}

export type GeneratedSchedule = ApiSubjectGroup[];