export function calculateSubjectStates(studyPlan, selectedIds) {
    // Helpers for recursion
    const getAllDescendants = (subjectId, visited = new Set()) => {
        if (visited.has(subjectId))
            return [];
        visited.add(subjectId);
        const subject = studyPlan.find(s => s.id === subjectId);
        if (!subject)
            return [];
        let descendants = [...subject.unlocks];
        subject.unlocks.forEach(childId => {
            descendants = [...descendants, ...getAllDescendants(childId, visited)];
        });
        return descendants;
    };
    const getAllAncestors = (subjectId, visited = new Set()) => {
        if (visited.has(subjectId))
            return [];
        visited.add(subjectId);
        const subject = studyPlan.find(s => s.id === subjectId);
        if (!subject || !subject.prerequisite)
            return [];
        let ancestors = [subject.prerequisite];
        ancestors = [...ancestors, ...getAllAncestors(subject.prerequisite, visited)];
        return ancestors;
    };
    // Pre-calculate all blocked IDs based on current selection
    const blockedIds = new Set();
    selectedIds.forEach(selectedId => {
        const subject = studyPlan.find(s => s.id === selectedId);
        if (!subject)
            return;
        // Effective IDs include the selected subject AND its mandatory partner (if any)
        // e.g. Selected Lab (6) -> blocks as if Theory (5) was also selected
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
    return studyPlan.map(subject => {
        // 1. Si está seleccionada
        if (selectedIds.includes(subject.id)) {
            return { ...subject, status: 'selected' };
        }
        // 2. Si está en la lista de bloqueadosrecursivos
        if (blockedIds.has(subject.id)) {
            return {
                ...subject,
                status: 'blocked',
                blockReason: 'Conflicto con materia seleccionada (dependencia directa o indirecta)'
            };
        }
        // 2.1. Propagation: If my partner is blocked, I am blocked.
        if (subject.mandatoryWith && blockedIds.has(subject.mandatoryWith)) {
            return {
                ...subject,
                status: 'blocked',
                blockReason: 'La materia complementaria (teoría/lab) tiene un conflicto'
            };
        }
        // 3. Si tiene materia obligatoria y la otra está seleccionada
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
