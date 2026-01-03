import { calculateSubjectStates } from './validation';
// Mock Study Plan
const mockStudyPlan = [
    // Theory-Lab Pair
    { id: 5, name: 'Intro Info', semester: 1, unlocks: [12], mandatoryWith: 6 },
    { id: 6, name: 'Lab Intro Info', semester: 1, unlocks: [], mandatoryWith: 5 },
    // Child of Intro Info
    { id: 12, name: 'POO', semester: 2, unlocks: [], prerequisite: 5 },
];
function runTests() {
    console.log('Running Partner Propagation Validation Tests...\n');
    // Test 10: Partner Propagation
    // Select "POO" (12).
    // Logic:
    // 1. POO selected.
    // 2. Ancestors of POO blocked -> "Intro Info" (5) is blocked.
    // 3. "Intro Info" (5) is blocked.
    // 4. "Lab Intro Info" (6) is mandatory partner of (5).
    // 5. Is "Lab Intro Info" (6) blocked?
    console.log('Test 10: Partner Propagation (Select POO -> Block Intro Info -> Block Lab Intro Info)');
    let states = calculateSubjectStates(mockStudyPlan, [12]);
    const introInfo = states.find(s => s.id === 5);
    const labIntroInfo = states.find(s => s.id === 6);
    // Verify Intro Info is blocked (Direct Ancestor)
    if (introInfo?.status === 'blocked') {
        console.log('✅ PASS: Intro Info is blocked (Ancestor).');
    }
    else {
        console.error(`❌ FAIL: Intro Info is ${introInfo?.status}`);
    }
    // Verify Lab Intro Info is blocked (Propagation)
    if (labIntroInfo?.status === 'blocked') {
        console.log('✅ PASS: Lab Intro Info is blocked (Partner Propagation).');
    }
    else {
        console.error(`❌ FAIL: Lab Intro Info is ${labIntroInfo?.status}`);
    }
}
runTests();
