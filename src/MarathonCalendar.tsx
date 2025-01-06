import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { MessageCircle, X } from 'lucide-react';
import { WORKOUTS, WEEKS, LONG_RUN_NUTRITION, TEMPO_MP_DAY_NUTRITION, EASY_DAY_NUTRITION, REST_DAY_NUTRITION } from './MarathonCalendarConstants';
import { generateClient } from 'aws-amplify/api';
import { useAuthenticator } from '@aws-amplify/ui-react';
import type { Schema } from "../amplify/data/resource";
import { getCurrentUser } from 'aws-amplify/auth';

const ADMIN_ID = "fake_admin_id"
// const ADMIN_ID = "e9a9a90e-10b1-70ad-2fde-5e87d1fc72cf"

const client = generateClient<Schema>();

export const MarathonCalendar = () => {
    const [completedWorkouts, setCompletedWorkouts] = useState(new Set());
    const [cheers, setCheers] = useState({});
    const [newCheer, setNewCheer] = useState('');
    const { user, signOut } = useAuthenticator();
    const [isAdmin, setIsAdmin] = useState(false);

    console.log('user', user)
    console.log('isAdmin', isAdmin)

    useEffect(() => {
        getUserData();
    }, []);

    useEffect(() => {
        fetchWorkoutData();
    }, [isAdmin]);

    // TODO: Fix the auth!!!
    const getUserData = async () => {
        const { username, userId, signInDetails } = await getCurrentUser();
        console.log("username", username);
        console.log("user id", userId);
        console.log("sign-in details", signInDetails);
        setIsAdmin(userId === ADMIN_ID)
    }

    // Function to fetch both completions and cheers
    const fetchWorkoutData = async () => {
        try {
            // Fetch completed workouts
            const completionsData = await client.models.WorkoutCompletion.list();
            const completedSet = new Set(
                completionsData.data
                    .filter(completion => completion.isCompleted)
                    .map(completion => `${completion.weekNum}-${completion.day}`)
            );
            setCompletedWorkouts(completedSet);
        
            // Fetch cheers
            if (!isAdmin) return;
            const cheersData = await client.models.Cheer.list();
            const cheersMap = {};
            cheersData.data.forEach(cheer => {
                const key = `${cheer.weekNum}-${cheer.day}`;
                if (!cheersMap[key]) cheersMap[key] = [];
                cheersMap[key].push({
                    id: cheer.id,
                    message: cheer.message,
                    timestamp: cheer.timestamp,
                });
            });
            setCheers(cheersMap);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    // Update your toggleWorkoutCompletion function:
    const toggleWorkoutCompletion = async (weekNum, day, e) => {
        if (!isAdmin) return;
        if (e.target.closest('.cheer-popover')) return;
        
        const workoutKey = `${weekNum}-${day}`;
        const isCompleted: boolean = !completedWorkouts.has(workoutKey);
        
        try {
            // First, try to find an existing completion record
            const existingCompletions = await client.models.WorkoutCompletion.list({
                filter: {
                    weekNum: { eq: weekNum },
                    day: { eq: day }
                }
            });
    
            if (existingCompletions.data && existingCompletions.data.length > 0) {
                // If record exists, update it
                const existingCompletion = existingCompletions.data[0];
                await client.models.WorkoutCompletion.update({
                    id: existingCompletion.id,
                    // @ts-ignore
                    isCompleted: isCompleted,
                });
            } else {
                // If no record exists, create a new one
                await client.models.WorkoutCompletion.create({
                    weekNum,
                    day,
                    // @ts-ignore
                    isCompleted,
                });
            }
        
            setCompletedWorkouts(prev => {
                const newCompleted = new Set(prev);
                if (isCompleted) {
                    newCompleted.add(workoutKey);
                } else {
                    newCompleted.delete(workoutKey);
                }
                return newCompleted;
            });
        } catch (error) {
            console.error('Error toggling workout completion:', error);
        }
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

    const addCheer = async (weekNum, day) => {
        if (!isAdmin) return;
        if (!newCheer.trim()) return;
    
        try {
            const cheer = await client.models.Cheer.create({
                weekNum,
                day,
                // @ts-ignore
                message: newCheer.trim(),
                // @ts-ignore
                timestamp: new Date().toISOString(),
            });
    
            const workoutKey = `${weekNum}-${day}`;
            
            setCheers(prev => ({
                ...prev,
                [workoutKey]: [
                    ...(prev[workoutKey] || []),
                    {
                        id: cheer.data.id,
                        message: cheer.data.message,
                        timestamp: cheer.data.timestamp,
                    },
                ],
            }));
            setNewCheer('');
        } catch (error) {
            console.error('Error adding cheer:', error);
        }
    };

    const deleteCheer = async (workoutKey: string, cheerId: string) => {
        if (!isAdmin) return;
        try {
            await client.models.Cheer.delete({
                id: cheerId
            });
    
            setCheers(prev => ({
                ...prev,
                [workoutKey]: prev[workoutKey].filter(cheer => cheer.id !== cheerId),
            }));
        } catch (error) {
            console.error('Error deleting cheer:', error);
            throw new Error('Failed to delete cheer');
        }
    };

    return (
        <div className="min-h-screen">
            <div className="mx-auto px-4 py-4 flex flex-col">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={signOut}
                    className="absolute top-4 right-4 flex items-center gap-2"
                >
                    Sign out
                </Button>

                <div className="mb-6 text-center">
                    <h1 className="text-2xl font-bold mb-2">Will's Marathon Training Plan</h1>
                    <p className="text-gray-600">Goal: 3:25 Marathon (7:49 min/mile pace)</p>
                    <p className="text-gray-600">Jan 6 - March 16, 2025</p>
                </div>

                <Tabs defaultValue="schedule" className="w-full flex flex-col items-center">
                    <TabsList className="mb-4">
                        <TabsTrigger value="schedule">Training Schedule</TabsTrigger>
                        <TabsTrigger value="guidelines">Training Guidelines</TabsTrigger>
                    </TabsList>

                    <div className="w-full">
                        <TabsContent value="schedule" className="mt-0">
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
                                                        { isAdmin && (<Popover>
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
                                                        </Popover> )}
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

                        <TabsContent value="guidelines" className="mt-0">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mx-auto">
                                <Card className="p-4">
                                    <h3 className="font-bold mb-2">Pace Guidelines</h3>
                                    <ul className="text-sm space-y-1">
                                        <li>Easy/Recovery: 8:45-9:15/mile</li>
                                        <li>Long Run Base: 8:30-9:00/mile</li>
                                        <li>Marathon Pace (MP): 7:49/mile</li>
                                        <li>Tempo Pace: 7:20-7:30/mile</li>
                                        <li>5K Pace: 7:05-7:15/mile</li>
                                    </ul>
                                </Card>

                                <Card className="p-4">
                                    <h3 className="font-bold mb-2">Hydration Guidelines</h3>
                                    <ul className="text-sm space-y-1">
                                        <li>Daily baseline: 80-100 oz water</li>
                                        <li>Add 16-20 oz per hour of running</li>
                                        <li>Electrolytes for runs over 90 minutes</li>
                                        <li>Monitor urine color (pale yellow ideal)</li>
                                    </ul>
                                </Card>

                                <Card className="p-4">
                                    <h3 className="font-bold mb-2">Color Code Key</h3>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <p><span className="inline-block w-3 h-3 bg-red-100 mr-2"></span>Speed/Tempo</p>
                                        <p><span className="inline-block w-3 h-3 bg-yellow-100 mr-2"></span>Marathon Pace</p>
                                        <p><span className="inline-block w-3 h-3 bg-blue-100 mr-2"></span>Long Run</p>
                                        <p><span className="inline-block w-3 h-3 bg-green-100 mr-2"></span>Easy/Recovery</p>
                                        <p><span className="inline-block w-3 h-3 bg-gray-100 mr-2"></span>Rest/Cross-train</p>
                                    </div>
                                </Card>

                                <Card className="p-4">
                                    <h3 className="font-bold mb-2">Weekly Focus</h3>
                                    <div className="text-sm space-y-2">
                                        <p><strong>Week 1-4:</strong> Establish meal timing, practice pre-run fueling</p>
                                        <p><strong>Week 5-7:</strong> Increase carbs for harder workouts, perfect race-day routine</p>
                                        <p><strong>Week 8-9:</strong> Maintain high carbs, reduce fiber before long runs</p>
                                    </div>
                                </Card>
                            </div>
                        </TabsContent>
                    </div>
                </Tabs>
            </div>
        </div>
    );

    // return (
    //     <div className="p-4 max-w-6xl mx-auto">
    //         <Button
    //             variant="outline"
    //             size="sm"
    //             onClick={signOut}
    //             className="absolute top-4 right-4 flex items-center gap-2"
    //         >
    //             Sign out
    //         </Button>
    //         <div className="mb-6 text-center">
    //             <h1 className="text-2xl font-bold mb-2">Will's Marathon Training Plan</h1>
    //             <p className="text-gray-600">Goal: 3:25 Marathon (7:49 min/mile pace)</p>
    //             <p className="text-gray-600">Jan 6 - March 16, 2025</p>
    //         </div>

    //         <Tabs defaultValue="schedule" className="w-full">
    //             <TabsList className="mb-4 inline-flex mx-auto">
    //                 <TabsTrigger value="schedule">Training Schedule</TabsTrigger>
    //                 <TabsTrigger value="guidelines">Training Guidelines</TabsTrigger>
    //             </TabsList>

    //             <TabsContent value="schedule">
    //                 <div className="grid grid-cols-1 gap-4">
    //                     {WEEKS.map((week) => (
    //                         <Card key={week.weekNum} className="p-4 shadow-md">
    //                             <h2 className="font-bold mb-2">
    //                                 Week {week.weekNum} ({week.start} - {week.end})
    //                             </h2>
    //                             <div className="grid grid-cols-7 gap-2">
    //                                 {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => {
    //                                     const workout = getWorkoutForDay(week.weekNum, day);
    //                                     const nutrition = getNutritionGuidelines(workout);
    //                                     const isCompleted = completedWorkouts.has(`${week.weekNum}-${day}`);
    //                                     const isToday = isCurrentDay(week, day);
    //                                     const workoutKey = `${week.weekNum}-${day}`;
    //                                     const cheerCount = cheers[workoutKey]?.length || 0;
                                        
    //                                     return (
    //                                         <div
    //                                             key={day}
    //                                             onClick={(e) => toggleWorkoutCompletion(week.weekNum, day, e)}
    //                                             className={`p-3 rounded-lg ${getWorkoutColor(workout)} min-h-24 
    //                                                 relative overflow-hidden
    //                                                 transition-all duration-200 ease-in-out
    //                                                 border
    //                                                 ${isToday ? 
    //                                                     'border-blue-500 ring-2 ring-blue-500 ring-opacity-50' : 
    //                                                     'border-gray-200 hover:border-gray-300'
    //                                                 }
    //                                                 ${isCompleted ? 
    //                                                     'opacity-60 transform scale-98 translate-y-0.5 shadow-inner' : 
    //                                                     'opacity-100 transform scale-100 translate-y-0 shadow-md hover:shadow-lg'
    //                                                 }`}
    //                                         >
    //                                             <div className="flex justify-between items-start mb-1">
    //                                                 <div className="flex items-center gap-1">
    //                                                     <p className={`font-semibold ${isToday ? 'text-blue-600' : ''}`}>
    //                                                         {day}
    //                                                         {isToday && <span className="ml-1 text-xs">(Today)</span>}
    //                                                     </p>
    //                                                     {isCompleted && (
    //                                                         <span className="text-green-600 text-sm font-bold">✓</span>
    //                                                     )}
    //                                                 </div>
    //                                                 <div className="flex items-center gap-2">
    //                                                     <Popover>
    //                                                         <PopoverTrigger asChild>
    //                                                             <Button 
    //                                                                 variant="ghost" 
    //                                                                 size="sm" 
    //                                                                 className="h-6 w-6 p-0 bg-white border border-black relative cheer-popover"
    //                                                                 onClick={(e) => e.stopPropagation()}
    //                                                             >
    //                                                                 <MessageCircle className="h-4 w-4" />
    //                                                                 {cheerCount > 0 && (
    //                                                                     <span className="absolute -top-1 -right-1 bg-blue-500 text-white rounded-full text-xs w-4 h-4 flex items-center justify-center">
    //                                                                         {cheerCount}
    //                                                                     </span>
    //                                                                 )}
    //                                                             </Button>
    //                                                         </PopoverTrigger>
    //                                                         <PopoverContent className="w-64 p-2 pg-white cheer-popover">
    //                                                             <div className="space-y-2">
    //                                                                 <div className="max-h-32 overflow-y-auto space-y-1">
    //                                                                     {cheers[workoutKey]?.map((cheer, idx) => (
    //                                                                         <div key={idx} className="text-sm bg-gray-50 p-2 rounded flex justify-between items-center group">
    //                                                                             {cheer.message}
    //                                                                             <Button
    //                                                                                 variant="ghost"
    //                                                                                 size="sm"
    //                                                                                 className="h-4 w-4 p-0 text-red-500 hover:text-red-700 bg-transparent invisible group-hover:visible"
    //                                                                                 onClick={(e) => {
    //                                                                                     e.stopPropagation();
    //                                                                                     deleteCheer(workoutKey, cheer.id);
    //                                                                                 }}
    //                                                                             >
    //                                                                                 <X className="h-3 w-3" />
    //                                                                             </Button>
    //                                                                         </div>
    //                                                                     ))}
    //                                                                 </div>
    //                                                                 <div className="flex gap-2">
    //                                                                     <input
    //                                                                         type="text"
    //                                                                         placeholder="Add a cheer!"
    //                                                                         className="flex-1 px-2 py-1 text-sm border rounded bg-white text-black"
    //                                                                         value={newCheer}
    //                                                                         onChange={(e) => setNewCheer(e.target.value)}
    //                                                                         onKeyPress={(e) => {
    //                                                                             if (e.key === 'Enter') {
    //                                                                                 e.stopPropagation();
    //                                                                                 addCheer(week.weekNum, day);
    //                                                                             }
    //                                                                         }}
    //                                                                         onClick={(e) => e.stopPropagation()}
    //                                                                     />
    //                                                                     <Button 
    //                                                                         size="sm"
    //                                                                         className="bg-white text-black hover:bg-gray-100"
    //                                                                         onClick={(e) => {
    //                                                                             e.stopPropagation();
    //                                                                             addCheer(week.weekNum, day);
    //                                                                         }}
    //                                                                     >
    //                                                                         Send
    //                                                                     </Button>
    //                                                                 </div>
    //                                                             </div>
    //                                                         </PopoverContent>
    //                                                     </Popover>
    //                                                 </div>
    //                                             </div>
    //                                             <p className="text-sm mb-2 font-medium">{workout}</p>
    //                                             <div className="text-xs space-y-1 border-t border-gray-200/60 pt-1">
    //                                                 <p className="font-medium">{nutrition.title}</p>
    //                                                 {nutrition.preMeal && (
    //                                                     <p className="text-gray-600">{nutrition.preMeal}</p>
    //                                                 )}
    //                                                 {nutrition.preWorkout && (
    //                                                     <p className="text-gray-600">{nutrition.preWorkout}</p>
    //                                                 )}
    //                                             </div>
    //                                         </div>
    //                                     );
    //                                 })}
    //                             </div>
    //                         </Card>
    //                     ))}
    //                 </div>
    //             </TabsContent>

    //             <TabsContent value="guidelines">
    //                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    //                     <Card className="p-4">
    //                         <h3 className="font-bold mb-2">Pace Guidelines</h3>
    //                         <ul className="text-sm space-y-1">
    //                             <li>Easy/Recovery: 8:45-9:15/mile</li>
    //                             <li>Long Run Base: 8:30-9:00/mile</li>
    //                             <li>Marathon Pace (MP): 7:49/mile</li>
    //                             <li>Tempo Pace: 7:20-7:30/mile</li>
    //                             <li>5K Pace: 7:05-7:15/mile</li>
    //                         </ul>
    //                     </Card>

    //                     <Card className="p-4">
    //                         <h3 className="font-bold mb-2">Hydration Guidelines</h3>
    //                         <ul className="text-sm space-y-1">
    //                             <li>Daily baseline: 80-100 oz water</li>
    //                             <li>Add 16-20 oz per hour of running</li>
    //                             <li>Electrolytes for runs over 90 minutes</li>
    //                             <li>Monitor urine color (pale yellow ideal)</li>
    //                         </ul>
    //                     </Card>

    //                     <Card className="p-4">
    //                         <h3 className="font-bold mb-2">Color Code Key</h3>
    //                         <div className="grid grid-cols-2 gap-2 text-sm">
    //                             <p><span className="inline-block w-3 h-3 bg-red-100 mr-2"></span>Speed/Tempo</p>
    //                             <p><span className="inline-block w-3 h-3 bg-yellow-100 mr-2"></span>Marathon Pace</p>
    //                             <p><span className="inline-block w-3 h-3 bg-blue-100 mr-2"></span>Long Run</p>
    //                             <p><span className="inline-block w-3 h-3 bg-green-100 mr-2"></span>Easy/Recovery</p>
    //                             <p><span className="inline-block w-3 h-3 bg-gray-100 mr-2"></span>Rest/Cross-train</p>
    //                         </div>
    //                     </Card>

    //                     <Card className="p-4">
    //                         <h3 className="font-bold mb-2">Weekly Focus</h3>
    //                         <div className="text-sm space-y-2">
    //                             <p><strong>Week 1-4:</strong> Establish meal timing, practice pre-run fueling</p>
    //                             <p><strong>Week 5-7:</strong> Increase carbs for harder workouts, perfect race-day routine</p>
    //                             <p><strong>Week 8-9:</strong> Maintain high carbs, reduce fiber before long runs</p>
    //                         </div>
    //                     </Card>
    //                 </div>
    //             </TabsContent>
    //         </Tabs>
    //     </div>
    // );
};