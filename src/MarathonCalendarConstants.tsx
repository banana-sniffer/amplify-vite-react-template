export const WEEKS = [
    { start: '1/6', end: '1/12', weekNum: 1 },
    { start: '1/13', end: '1/19', weekNum: 2 },
    { start: '1/20', end: '1/26', weekNum: 3 },
    { start: '1/27', end: '2/2', weekNum: 4 },
    { start: '2/3', end: '2/9', weekNum: 5 },
    { start: '2/10', end: '2/16', weekNum: 6 },
    { start: '2/17', end: '2/23', weekNum: 7 },
    { start: '2/24', end: '3/1', weekNum: 8 },
    { start: '3/2', end: '3/8', weekNum: 9 },
    { start: '3/9', end: '3/15', weekNum: 10 }
];

export const WORKOUTS = {
    1: {
        Mon: '5 miles easy',
        Tue: '6 miles with 4x800m at 5K pace',
        Wed: '5 miles easy + strength',
        Thu: '6 miles with 2 miles at MP',
        Fri: 'Rest or cross-train',
        Sat: '12 miles long run',
        Sun: '4 miles recovery'
    },
    2: {
        Mon: '5 miles easy',
        Tue: '7 miles with 5x800m at 5K pace',
        Wed: '6 miles easy + strength',
        Thu: '7 miles with 3 miles at MP',
        Fri: 'Rest or cross-train',
        Sat: '14 miles long run',
        Sun: '4 miles recovery'
    },
    3: {
        Mon: '6 miles easy',
        Tue: '8 miles with 6x800m at 5K pace',
        Wed: '6 miles easy + strength',
        Thu: '8 miles with 4 miles at MP',
        Fri: 'Rest or cross-train',
        Sat: '16 miles long run',
        Sun: '5 miles recovery'
    },
    4: {
        Mon: '5 miles easy',
        Tue: '6 miles with 4x800m at 5K pace',
        Wed: '5 miles easy + strength',
        Thu: '6 miles with 2 miles at MP',
        Fri: 'Rest or cross-train',
        Sat: '12 miles long run',
        Sun: '4 miles recovery'
    },
    5: {
        Mon: '6 miles easy',
        Tue: '8 miles with 2x2 miles at tempo pace',
        Wed: '7 miles easy + strength',
        Thu: '8 miles with 5 miles at MP',
        Fri: 'Rest or cross-train',
        Sat: '18 miles long run',
        Sun: '5 miles recovery'
    },
    6: {
        Mon: '6 miles easy',
        Tue: '9 miles with 3x2 miles at tempo pace',
        Wed: '7 miles easy + strength',
        Thu: '9 miles with 6 miles at MP',
        Fri: 'Rest or cross-train',
        Sat: '20 miles (8 easy, 4 MP, 4 easy, 2 MP, 2 easy)',
        Sun: '5 miles recovery'
    },
    7: {
        Mon: '6 miles easy',
        Tue: '9 miles with 4x2 miles at tempo pace',
        Wed: '7 miles easy + strength',
        Thu: '10 miles with 7 miles at MP',
        Fri: 'Rest or cross-train',
        Sat: '20 miles (6 easy, 8 alt 2MP/2base, 6 easy)',
        Sun: '5 miles recovery'
    },
    8: {
        Mon: '5 miles easy',
        Tue: '8 miles with 2x2 miles at tempo pace',
        Wed: '6 miles easy + strength',
        Thu: '8 miles with 4 miles at MP',
        Fri: 'Rest or cross-train',
        Sat: '16 miles long run',
        Sun: '4 miles recovery'
    },
    9: {
        Mon: '5 miles easy',
        Tue: '7 miles with 3x1 mile at MP',
        Wed: '5 miles easy + light strength',
        Thu: '6 miles with 2 miles at MP',
        Fri: 'Rest',
        Sat: '12 miles long run',
        Sun: '4 miles recovery'
    },
    10: {
        Mon: '4 miles easy',
        Tue: '5 miles with 2x1 mile at MP',
        Wed: '4 miles easy',
        Thu: '3 miles easy with 4x100m strides',
        Fri: 'Rest',
        Sat: '2 miles easy',
        Sun: 'RACE DAY!'
    }
};

export const LONG_RUN_NUTRITION = {
    title: "Long Run Nutrition",
    preMeal: "Night before: High-carb dinner (120-150g carbs)",
    preWorkout: "2-3 hours before: 80-100g carbs, 15-20g protein",
    during: "30-60g carbs per hour after first hour",
    post: "Immediate: 3:1 carb to protein ratio (60g:20g)",
    calories: "2,800-3,200 calories",
    macros: "Carbs: 60-65%, Protein: 20%, Fat: 15-20%"
};

export const TEMPO_MP_DAY_NUTRITION = {
    title: "Tempo/MP Day Nutrition",
    preMeal: "",
    preWorkout: "2 hours before: 60-80g carbs, 15g protein",
    during: "Hydration: 16-20 oz water per hour",
    post: "Within 30 mins: 40g carbs, 15g protein",
    calories: "2,800-3,200 calories",
    macros: "Carbs: 55-60%, Protein: 20-25%, Fat: 20-25%"
};

export const EASY_DAY_NUTRITION = {
    title: "Easy Day Nutrition",
    preMeal: "",
    preWorkout: "Regular meal timing",
    during: "Regular hydration",
    post: "Maintain regular meal schedule",
    calories: "2,500-2,800 calories",
    macros: "Carbs: 50%, Protein: 25-30%, Fat: 20-25%"
};

export const REST_DAY_NUTRITION = {
    title: "Rest Day Nutrition",
    preMeal: "",
    preWorkout: "Focus on whole foods",
    during: "Regular hydration",
    post: "Maintain protein intake",
    calories: "2,500-2,800 calories",
    macros: "Carbs: 50%, Protein: 25-30%, Fat: 20-25%"
};