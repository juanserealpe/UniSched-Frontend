import type { Subject } from '../types';

export const studyPlan: Subject[] = [

    // =========================
    // S1
    // =========================
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

    // =========================
    // S2
    // =========================
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

    // =========================
    // S3
    // =========================
    {
        id: 14,
        name: "Cálculo III",
        semester: 3,
        unlocks: [20, 21, 27],
        prerequisite: 8,
    },
    {
        id: 15,
        name: "Electromagnetismo",
        semester: 3,
        unlocks: [],
        prerequisite: 8,
    },
    {
        id: 16,
        name: "Lab. Electromagnetismo",
        semester: 3,
        unlocks: [],
        prerequisite: 8,
    },
    {
        id: 17,
        name: "Electiva FISH III",
        semester: 3,
        unlocks: [],
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

    // =========================
    // S4
    // =========================
    {
        id: 20,
        name: "Ecuaciones Diferenciales",
        semester: 4,
        unlocks: [26, 33, 40],
        prerequisite: 14,
    },
    {
        id: 21,
        name: "Vibraciones y Ondas",
        semester: 4,
        unlocks: [],
        prerequisite: 14,
    },
    {
        id: 22,
        name: "Estructuras de Datos II",
        semester: 4,
        unlocks: [29, 27, 31],
        prerequisite: 18,
        mandatoryWith: 23,
    },
    {
        id: 23,
        name: "Lab. Estructuras de Datos II",
        semester: 4,
        unlocks: [],
        mandatoryWith: 22,
    },
    {
        id: 24,
        name: "Bases de Datos I",
        semester: 4,
        unlocks: [31],
        prerequisite: 18,
        mandatoryWith: 25,
    },
    {
        id: 25,
        name: "Lab. Bases de Datos I",
        semester: 4,
        unlocks: [],
        mandatoryWith: 24,
    },

    // =========================
    // S5
    // =========================
    {
        id: 26,
        name: "Análisis Numérico",
        semester: 5,
        unlocks: [],
        prerequisite: 20,
    },
    {
        id: 27,
        name: "Teoría de la Computación",
        semester: 5,
        unlocks: [34],
        prerequisite: 22,
    },
    {
        id: 28,
        name: "Lab. Ingeniería de Software I",
        semester: 5,
        unlocks: [],
        mandatoryWith: 29,
    },
    {
        id: 29,
        name: "Ingeniería de Software I",
        semester: 5,
        unlocks: [36],
        prerequisite: 22,
        mandatoryWith: 28,
    },
    {
        id: 30,
        name: "Arquitectura Computacional",
        semester: 5,
        unlocks: [38],
    },
    {
        id: 31,
        name: "Bases de Datos II",
        semester: 5,
        unlocks: [],
        prerequisite: 24,
        mandatoryWith: 32,
    },
    {
        id: 32,
        name: "Lab. Bases de Datos II",
        semester: 5,
        unlocks: [],
        mandatoryWith: 31,
    },

    // =========================
    // S6
    // =========================
    {
        id: 33,
        name: "Estadística y Probabilidad",
        semester: 6,
        unlocks: [],
        prerequisite: 20,
    },
    {
        id: 34,
        name: "Estructuras de Lenguajes",
        semester: 6,
        unlocks: [42, 43],
        prerequisite: 27,
        mandatoryWith: 35,
    },
    {
        id: 35,
        name: "Lab. Estructuras de Lenguajes",
        semester: 6,
        unlocks: [],
        mandatoryWith: 34,
    },
    {
        id: 36,
        name: "Ingeniería de Software II",
        semester: 6,
        unlocks: [],
        prerequisite: 29,
        mandatoryWith: 37,
    },
    {
        id: 37,
        name: "Lab. Ingeniería de Software II",
        semester: 6,
        unlocks: [],
        mandatoryWith: 36,
    },
    {
        id: 38,
        name: "Sistemas Operativos",
        semester: 6,
        unlocks: [],
        prerequisite: 30,
        mandatoryWith: 39,
    },
    {
        id: 39,
        name: "Lab. Sistemas Operativos",
        semester: 6,
        unlocks: [],
        mandatoryWith: 38,
    },

    // =========================
    // S7
    // =========================
    {
        id: 40,
        name: "Teoría y Dinámica de Sistemas",
        semester: 7,
        unlocks: [],
        prerequisite: 20,
    },
    {
        id: 41,
        name: "Metodología de la Investigación",
        semester: 7,
        unlocks: [],
    },
    {
        id: 42,
        name: "Inteligencia Artificial",
        semester: 7,
        unlocks: [],
        prerequisite: 34,
    },
    {
        id: 43,
        name: "Sistemas Distribuidos",
        semester: 7,
        unlocks: [],
        prerequisite: 34,
    },
    {
        id:44,
        name: "Lab. Sistemas Distribuidos",
        semester: 7,
        unlocks: [],
        mandatoryWith: 43,
    },
    {
        id: 45,
        name: "Ingeniería de Software III",
        semester: 7,
        unlocks: [],
        prerequisite: 29,
        mandatoryWith: 37,
    },
    {
        id: 46,
        name: "Lab. Ingeniería de Software III",
        semester: 7,
        unlocks: [],
        mandatoryWith: 45,
    },
];
