import type { Subject } from '../types';

export const studyPlan: Subject[] = [
    // SEMESTRE 1
    {
        id: 1,
        name: "Cálculo I",
        semester: 1,
        unlocks: [8, 9, 11],
    },
    {
        id: 2,
        name: "Lectura y Escritura",
        semester: 1,
        unlocks: [],
    },
    {
        id: 3,
        name: "Electiva FISH I",
        semester: 1,
        unlocks: [],
    },
    {
        id: 4,
        name: "Introducción a la Ing. de Sistemas",
        semester: 1,
        unlocks: [],
    },
    {
        id: 5,
        name: "Introducción a la Informática",
        semester: 1,
        unlocks: [12],
        mandatoryWith: 6,
    },
    {
        id: 6,
        name: "Lab. Introducción a la Informática",
        semester: 1,
        unlocks: [],
        mandatoryWith: 5,
    },

    // SEMESTRE 2
    {
        id: 7,
        name: "Electiva FISH II",
        semester: 2,
        unlocks: [],
    },
    {
        id: 8,
        name: "Cálculo II",
        semester: 2,
        unlocks: [14, 15, 16],
        prerequisite: 1,
    },
    {
        id: 9,
        name: "Mecánica",
        semester: 2,
        unlocks: [],
        prerequisite: 1,
        mandatoryWith: 10,
    },
    {
        id: 10,
        name: "Laboratorio Mecánica",
        semester: 2,
        unlocks: [],
        mandatoryWith: 9,
    },
    {
        id: 11,
        name: "Álgebra Lineal",
        semester: 2,
        unlocks: [],
        prerequisite: 1,
    },
    {
        id: 12,
        name: "Programación Orientada a Objetos",
        semester: 2,
        unlocks: [18],
        prerequisite: 5,
        mandatoryWith: 13,
    },
    {
        id: 13,
        name: "Laboratorio POO",
        semester: 2,
        unlocks: [],
        mandatoryWith: 12,
    },

    // SEMESTRE 3
    {
        id: 14,
        name: "Cálculo III",
        semester: 3,
        unlocks: [20, 21, 27],
        prerequisite: 8,
    },
    {
        id: 18,
        name: "Estructuras de Datos I",
        semester: 3,
        unlocks: [24, 22],
        prerequisite: 12,
        mandatoryWith: 19,
    },
    {
        id: 19,
        name: "Lab. Estructuras de Datos I",
        semester: 3,
        unlocks: [],
        mandatoryWith: 18,
    },
];
