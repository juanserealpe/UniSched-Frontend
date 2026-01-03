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
        <div className="flex flex-col gap-4 min-w-[280px]">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-2 px-1">
                Semestre {semester}
            </h3>
            <div className="flex flex-col gap-3">
                {semesterSubjects.map(subject => (
                    <SubjectCard key={subject.id} subject={subject} />
                ))}
            </div>
        </div>
    );
};
