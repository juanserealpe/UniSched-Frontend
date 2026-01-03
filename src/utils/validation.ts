import type { Subject, SubjectWithState } from '../types';

export function calculateSubjectStates(studyPlan: Subject[], selectedIds: number[]): SubjectWithState[] {
    const getSubjectName = (id: number) => studyPlan.find(s => s.id === id)?.name || 'Unknown';

    return studyPlan.map(subject => {
        // 1. Si está seleccionada
        if (selectedIds.includes(subject.id)) {
            return { ...subject, status: 'selected' };
        }

        // 2. Si su prerequisito no está seleccionado y NO hay manera de saber si se aprobó (Assumption: App assumes fresh start or selection satisfies dependecy???)
        // The prompt code:
        if (subject.prerequisite && !selectedIds.includes(subject.prerequisite)) {
            return {
                ...subject,
                status: 'blocked',
                blockReason: `Debes aprobar ${getSubjectName(subject.prerequisite)} primero`
            };
        }

        // 3. Si alguna materia que desbloquea está seleccionada → bloqueada (Child Selected -> Block Parent)
        const childSelected = subject.unlocks.some(id => selectedIds.includes(id));
        if (childSelected) {
            return {
                ...subject,
                status: 'blocked',
                blockReason: 'No puedes tomar prerequisito e hijo juntos'
            };
        }

        // 4. Si su prerequisito está seleccionado → bloqueada también (Parent Selected -> Block Child)
        const parentSelected = studyPlan.some(s =>
            s.unlocks.includes(subject.id) && selectedIds.includes(s.id)
        );
        if (parentSelected) {
            return {
                ...subject,
                status: 'blocked',
                blockReason: 'Ya seleccionaste su prerequisito'
            };
        }

        // 5. Si tiene materia obligatoria y la otra está seleccionada
        if (subject.mandatoryWith && selectedIds.includes(subject.mandatoryWith)) {
            return {
                ...subject,
                status: 'mandatory-pending',
                blockReason: 'Debes seleccionar ambas materias juntas'
            };
        }

        // Disponible
        return { ...subject, status: 'available' };
    });
}
