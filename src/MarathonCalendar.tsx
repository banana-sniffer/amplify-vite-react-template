import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { MessageCircle, X } from 'lucide-react';
import { WORKOUTS, WEEKS, LONG_RUN_NUTRITION, TEMPO_MP_DAY_NUTRITION, EASY_DAY_NUTRITION, REST_DAY_NUTRITION } from './MarathonCalendarConstants';
import { v4 as uuidv4 } from 'uuid';

const MarathonCalendar = () => {
    const [completedWorkouts, setCompletedWorkouts] = useState(new Set());
    const [cheers, setCheers] = useState({});
    const [newCheer, setNewCheer] = useState('');

    const toggleWorkoutCompletion = (weekNum, day, e) => {
        // Prevent toggling when clicking within the cheer popover
        if (e.target.closest('.cheer-popover')) {
            return;
        }
        
        const workoutKey = `${weekNum}-${day}`;
        setCompletedWorkouts(prev => {
            const newCompleted = new Set(prev);
            if (newCompleted.has(workoutKey)) {
                newCompleted.delete(workoutKey);
            } else {
                newCompleted.add(workoutKey);
            }
            return newCompleted;
        });
    };

    // Rest of the helper functions remain the same...
    const isCurrentDay = (weekData, dayName) => {
        const today = new Date();
        const startDate = new Date(today.getFullYear(), 0, 6); // Jan 6, 2025
        const weekStartDate = new Date(startDate);
        weekStartDate.setDate(startDate.getDate() + (weekData.weekNum - 1) * 7);
        
        const dayIndex = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].indexOf(dayName);
        const cardDate = new Date(weekStartDate);
        cardDate.setDate(weekStartDate.getDate() + dayIndex);
        
        return today.toDateString() === cardDate.toDateString();
    };

    const getWorkoutColor = (workout) => {
        if (workout.includes('tempo') || workout.includes('5K pace')) return 'bg-red-100';
        if (workout.includes('MP')) return 'bg-yellow-100';
        if (workout.includes('long run') || workout.includes('RACE DAY')) return 'bg-blue-100';
        if (workout.includes('easy')) return 'bg-green-100';
        if (workout.includes('Rest')) return 'bg-gray-100';
        return 'bg-white';
    };

    const getWorkoutForDay = (weekNum, day) => {
        return WORKOUTS[weekNum]?.[day] || '';
    };

    const getNutritionGuidelines = (workout) => {
        if (workout.includes('long run') || workout.includes('RACE DAY')) {
            return LONG_RUN_NUTRITION
        }
        if (workout.includes('tempo') || workout.includes('MP')) {
            return TEMPO_MP_DAY_NUTRITION
        }
        if (workout.includes('easy')) {
            return EASY_DAY_NUTRITION
        }
        return REST_DAY_NUTRITION
    };

    const addCheer = (weekNum, day) => {
        if (!newCheer.trim()) return;
    
        const workoutKey = `${weekNum}-${day}`;
        setCheers(prev => ({
            ...prev,
            [workoutKey]: [
                ...(prev[workoutKey] || []),
                {
                    id: uuidv4(),
                    message: newCheer.trim(),
                    timestamp: new Date().toISOString(),
                },
            ],
        }));
        setNewCheer('');
    };

    const deleteCheer = (workoutKey, cheerId) => {
        setCheers(prev => ({
            ...prev,
            [workoutKey]: prev[workoutKey].filter(cheer => cheer.id !== cheerId),
        }));
    };

    return (
        <div className="p-4 max-w-6xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold mb-2">Will's Marathon Training Plan</h1>
                <p className="text-gray-600">Goal: 3:25 Marathon (7:49 min/mile pace)</p>
                <p className="text-gray-600">Jan 6 - March 16, 2025</p>
            </div>

            <Tabs defaultValue="schedule" className="w-full">
                <TabsList className="mb-4">
                    <TabsTrigger value="schedule">Training Schedule</TabsTrigger>
                    <TabsTrigger value="guidelines">Training Guidelines</TabsTrigger>
                </TabsList>

                <TabsContent value="schedule">
                    <div className="grid grid-cols-1 gap-4">
                        {WEEKS.map((week) => (
                            <Card key={week.weekNum} className="p-4 shadow-md">
                                <h2 className="font-bold mb-2">
                                    Week {week.weekNum} ({week.start} - {week.end})
                                </h2>
                                <div className="grid grid-cols-7 gap-2">
                                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => {
                                        const workout = getWorkoutForDay(week.weekNum, day);
                                        const nutrition = getNutritionGuidelines(workout);
                                        const isCompleted = completedWorkouts.has(`${week.weekNum}-${day}`);
                                        const isToday = isCurrentDay(week, day);
                                        const workoutKey = `${week.weekNum}-${day}`;
                                        const cheerCount = cheers[workoutKey]?.length || 0;
                                        
                                        return (
                                            <div
                                                key={day}
                                                onClick={(e) => toggleWorkoutCompletion(week.weekNum, day, e)}
                                                className={`p-3 rounded-lg ${getWorkoutColor(workout)} min-h-24 
                                                    relative overflow-hidden
                                                    transition-all duration-200 ease-in-out
                                                    border
                                                    ${isToday ? 
                                                        'border-blue-500 ring-2 ring-blue-500 ring-opacity-50' : 
                                                        'border-gray-200 hover:border-gray-300'
                                                    }
                                                    ${isCompleted ? 
                                                        'opacity-60 transform scale-98 translate-y-0.5 shadow-inner' : 
                                                        'opacity-100 transform scale-100 translate-y-0 shadow-md hover:shadow-lg'
                                                    }`}
                                            >
                                                <div className="flex justify-between items-start mb-1">
                                                    <div className="flex items-center gap-1">
                                                        <p className={`font-semibold ${isToday ? 'text-blue-600' : ''}`}>
                                                            {day}
                                                            {isToday && <span className="ml-1 text-xs">(Today)</span>}
                                                        </p>
                                                        {isCompleted && (
                                                            <span className="text-green-600 text-sm font-bold">✓</span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Popover>
                                                            <PopoverTrigger asChild>
                                                                <Button 
                                                                    variant="ghost" 
                                                                    size="sm" 
                                                                    className="h-6 w-6 p-0 bg-white border border-black relative cheer-popover"
                                                                    onClick={(e) => e.stopPropagation()}
                                                                >
                                                                    <MessageCircle className="h-4 w-4" />
                                                                    {cheerCount > 0 && (
                                                                        <span className="absolute -top-1 -right-1 bg-blue-500 text-white rounded-full text-xs w-4 h-4 flex items-center justify-center">
                                                                            {cheerCount}
                                                                        </span>
                                                                    )}
                                                                </Button>
                                                            </PopoverTrigger>
                                                            <PopoverContent className="w-64 p-2 pg-white cheer-popover">
                                                                <div className="space-y-2">
                                                                    <div className="max-h-32 overflow-y-auto space-y-1">
                                                                        {cheers[workoutKey]?.map((cheer, idx) => (
                                                                            <div key={idx} className="text-sm bg-gray-50 p-2 rounded flex justify-between items-center group">
                                                                                {cheer.message}
                                                                                <Button
                                                                                    variant="ghost"
                                                                                    size="sm"
                                                                                    className="h-4 w-4 p-0 text-red-500 hover:text-red-700 bg-transparent invisible group-hover:visible"
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        deleteCheer(workoutKey, cheer.id);
                                                                                    }}
                                                                                >
                                                                                    <X className="h-3 w-3" />
                                                                                </Button>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                    <div className="flex gap-2">
                                                                        <input
                                                                            type="text"
                                                                            placeholder="Add a cheer!"
                                                                            className="flex-1 px-2 py-1 text-sm border rounded bg-white text-black"
                                                                            value={newCheer}
                                                                            onChange={(e) => setNewCheer(e.target.value)}
                                                                            onKeyPress={(e) => {
                                                                                if (e.key === 'Enter') {
                                                                                    e.stopPropagation();
                                                                                    addCheer(week.weekNum, day);
                                                                                }
                                                                            }}
                                                                            onClick={(e) => e.stopPropagation()}
                                                                        />
                                                                        <Button 
                                                                            size="sm"
                                                                            className="bg-white text-black hover:bg-gray-100"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                addCheer(week.weekNum, day);
                                                                            }}
                                                                        >
                                                                            Send
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            </PopoverContent>
                                                        </Popover>
                                                    </div>
                                                </div>
                                                <p className="text-sm mb-2 font-medium">{workout}</p>
                                                <div className="text-xs space-y-1 border-t border-gray-200/60 pt-1">
                                                    <p className="font-medium">{nutrition.title}</p>
                                                    {nutrition.preMeal && (
                                                        <p className="text-gray-600">{nutrition.preMeal}</p>
                                                    )}
                                                    {nutrition.preWorkout && (
                                                        <p className="text-gray-600">{nutrition.preWorkout}</p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </Card>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default MarathonCalendar;