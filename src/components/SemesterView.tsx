import React from 'react';
import { useSubjects } from '../context/SubjectContext';
import { SubjectCard } from './SubjectCard';

interface SemesterViewProps {
    semester: number;
}

export const SemesterView: React.FC<SemesterViewProps> = ({ semester }) => {
    const { subjects } = useSubjects();

    const semesterSubjects = subjects.filter(s => s.semester === semester);

    // Sorting? By ID usually keeps the order defined in studyPlan data which is loosely logical

    return (
        <div className="flex flex-col gap-5 min-w-[300px] pb-8">
            <div className="flex items-center gap-3 px-1 mb-1">
                <div className="h-6 w-1 rounded bg-[#C5A059]" />
                <h3 className="text-sm font-bold uppercase tracking-[0.15em] text-slate-500">
                    Semestre {semester}
                </h3>
            </div>
            <div className="flex flex-col gap-4">
                {semesterSubjects.map(subject => (
                    <SubjectCard key={subject.id} subject={subject} />
                ))}
            </div>
        </div>
    );
};
