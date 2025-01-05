import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { useAuthenticator } from '@aws-amplify/ui-react';
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { MessageCircle, X } from 'lucide-react'

const client = generateClient<Schema>();

function App() {
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);
  const [completedWorkouts, setCompletedWorkouts] = useState(new Set());
  const [cheers, setCheers] = useState({});
  const [newCheer, setNewCheer] = useState('');

  const { user, signOut } = useAuthenticator();
    
  function deleteTodo(id: string) {
    client.models.Todo.delete({ id })
  }

  useEffect(() => {
    client.models.Todo.observeQuery().subscribe({
      next: (data) => setTodos([...data.items]),
    });
    fetchWorkoutData();
  }, []);

  const fetchWorkoutData = async () => {
    try {
      // Fetch completed workouts
      const completionsData = await client.models.WorkoutCompletion.list();
      const completedSet = new Set(
        completionsData.data.map(completion => `${completion.weekNum}-${completion.day}`)
      );
      setCompletedWorkouts(completedSet);
  
      // Fetch cheers
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

  function createTodo() {
    client.models.Todo.create({ content: window.prompt("Todo content") });
  }

  return (
    <main>
      <h1>{user?.signInDetails?.loginId}'s todos</h1>
      <Card>test!</Card>
      <button onClick={createTodo}>+ new</button>
      <ul>
        {todos.map((todo) => (
          <li onClick={() => deleteTodo(todo.id)} key={todo.id}>{todo.content}</li>
        ))}
      </ul>
      <div>
        🥳 App successfully hosted. Try creating a new todo.
        <br />
        <a href="https://docs.amplify.aws/react/start/quickstart/#make-frontend-updates">
          Review next step of this tutorial.
        </a>
      </div>
      <button onClick={signOut}>Sign out</button>
    </main>
  );
}

export default App;
