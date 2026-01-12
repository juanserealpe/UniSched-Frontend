import type { Subject, SubjectWithState } from '../types';

export function calculateSubjectStates(studyPlan: Subject[], selectedIds: number[]): SubjectWithState[] {
    // Helpers for recursion
    const getAllDescendants = (subjectId: number, visited = new Set<number>()): number[] => {
        if (visited.has(subjectId)) return [];
        visited.add(subjectId);

        const subject = studyPlan.find(s => s.id === subjectId);
        if (!subject) return [];

        let descendants = [...subject.unlocks];
        subject.unlocks.forEach(childId => {
            descendants = [...descendants, ...getAllDescendants(childId, visited)];
        });
        return descendants;
    };

    const getAllAncestors = (subjectId: number, visited = new Set<number>()): number[] => {
        if (visited.has(subjectId)) return [];
        visited.add(subjectId);

        const subject = studyPlan.find(s => s.id === subjectId);
        if (!subject || !subject.prerequisite) return [];

        let ancestors = [subject.prerequisite];
        ancestors = [...ancestors, ...getAllAncestors(subject.prerequisite, visited)];
        return ancestors;
    };

    // Pre-calculate all blocked IDs based on current selection
    const blockedIds = new Set<number>();

    selectedIds.forEach(selectedId => {
        const subject = studyPlan.find(s => s.id === selectedId);
        if (!subject) return;

        // Effective IDs only includes the selected subject now.
        // We no longer block descendants/ancestors of the partner automatically.
        // UPDATE: User requested that selecting a Lab DOES block the Theory's parents/children.
        // So we MUST include the mandatoryWith partner here.
        const effectiveIds = [selectedId];
        if (subject.mandatoryWith) {
            effectiveIds.push(subject.mandatoryWith);
        }

        effectiveIds.forEach(id => {
            // Block all descendants (children, grandchildren, etc.)
            const descendants = getAllDescendants(id);
            descendants.forEach(dId => blockedIds.add(dId));

            // Block all ancestors (parents, grandparents, etc.)
            const ancestors = getAllAncestors(id);
            ancestors.forEach(aId => blockedIds.add(aId));
        });
    });

    // START FIX: Propagate blocking to mandatory partners
    // If a subject is blocked (e.g. it is a descendant of a selected subject),
    // its mandatory partner (e.g. Lab) should also be blocked.
    // We iterate over the initial blockedIds to find partners to block.
    // Use a temp array to avoid modifying the Set while iterating if the engine doesn't support it,
    // though Set iteration is usually safe for additions in newer JS, a separate loop is clearer.
    const initialBlockedIds = Array.from(blockedIds);
    initialBlockedIds.forEach(blockedId => {
        const subject = studyPlan.find(s => s.id === blockedId);
        if (subject && subject.mandatoryWith) {
            blockedIds.add(subject.mandatoryWith);
        }
    });
    // END FIX

    return studyPlan.map(subject => {
        let result: SubjectWithState;

        // 1. Si está seleccionada
        if (selectedIds.includes(subject.id)) {
            result = { ...subject, status: 'selected' };
        }
        // 2. Si está en la lista de bloqueadosrecursivos
        else if (blockedIds.has(subject.id)) {
            result = {
                ...subject,
                status: 'blocked',
                blockReason: 'Conflicto con materia seleccionada (dependencia directa o indirecta)'
            };
        }
        // Disponible
        else {
            result = { ...subject, status: 'available' };
        }

        // Add warnings for mandatory pairs
        if (subject.mandatoryWith) {
            const partner = studyPlan.find(s => s.id === subject.mandatoryWith);
            const isSelfSelected = selectedIds.includes(subject.id);
            const isPartnerSelected = selectedIds.includes(subject.mandatoryWith);

            if (isSelfSelected && !isPartnerSelected) {
                result.warning = `Falta materia complementaria (${partner?.name})`;
            } else if (!isSelfSelected && isPartnerSelected && result.status === 'available') {
                result.warning = `Se recomienda cursar con ${partner?.name}`;
            }
        }

        return result;
    });
}
