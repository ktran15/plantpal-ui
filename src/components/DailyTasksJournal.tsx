import { useState, useEffect } from 'react';
import { PixelCard } from './PixelCard';
import { PixelCheckbox } from './PixelCheckbox';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { usePlantContext } from '../contexts/PlantContext';
import { updatePlantStatus } from '../services/plantAgentService';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db, auth } from '../lib/firebase-client';
import { PlantTask } from '../types/plant';
import { toast } from 'sonner';

interface DailyTasksJournalProps {
  selectedPlantId?: string; // Optional: filter tasks by specific plant
}

export function DailyTasksJournal({ selectedPlantId }: DailyTasksJournalProps = {}) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { tasks, subscribeToTasks } = usePlantContext();

  // Subscribe to tasks on mount (only if Firebase is configured)
  useEffect(() => {
    if (!auth || !db) {
      console.warn('Firebase not configured - using local tasks only');
      return;
    }
    
    const user = auth.currentUser;
    if (!user) {
      // No user logged in, but don't crash - just skip subscription
      return;
    }

    // Subscribe to all tasks or plant-specific tasks
    const unsubscribe = selectedPlantId 
      ? subscribeToTasks(selectedPlantId)
      : subscribeToTasks();
    return unsubscribe;
  }, [subscribeToTasks, selectedPlantId]);

  // Filter tasks for selected date and optionally by plant
  const getTasksForDate = (date: Date): PlantTask[] => {
    const dateStr = date.toDateString();
    return tasks.filter(task => {
      if (!task.scheduledDate) return false;
      const taskDate = task.scheduledDate.toDate();
      const matchesDate = taskDate.toDateString() === dateStr;
      const matchesPlant = selectedPlantId ? task.plantId === selectedPlantId : true;
      return matchesDate && matchesPlant;
    });
  };

  const dateTasks = getTasksForDate(selectedDate);
  const completedCount = dateTasks.filter(t => t.completed).length;
  const totalCount = dateTasks.length;

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    setSelectedDate(newDate);
  };

  const toggleTask = async (task: PlantTask) => {
    if (!db || !auth) {
      toast.error('Firebase not configured. Check .env file.');
      return;
    }
    
    const user = auth.currentUser;
    if (!user) {
      toast.error('Please sign in to complete tasks');
      return;
    }

    try {
      const newCompleted = !task.completed;
      
      // Update task in Firestore
      const taskRef = doc(db, 'tasks', task.id);
      await updateDoc(taskRef, {
        completed: newCompleted,
        completedAt: newCompleted ? Timestamp.now() : null,
      });

      // Update plant happiness via API
      if (newCompleted) {
        await updatePlantStatus(user.uid, task.plantId, task.type, true);
        toast.success(`Task completed! ${task.type === 'watering' ? '💧' : '🌿'}`);
      } else {
        // If unchecking, we could decrease happiness, but for now just update the task
        await updateDoc(taskRef, {
          completed: false,
          completedAt: null,
        });
      }
    } catch (error) {
      console.error('Error toggling task:', error);
      toast.error('Failed to update task');
    }
  };

  const today = selectedDate.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: '2-digit' 
  });

  const isToday = selectedDate.toDateString() === new Date().toDateString();

  return (
    <PixelCard variant="light" className="h-[400px] flex flex-col relative">
      {/* Journal header with page turn effect */}
      <div className="border-b-2 border-[var(--bark)] p-4 bg-[var(--sand-2)] flex items-center justify-between">
        <button 
          onClick={() => navigateDate('prev')}
          className="text-[var(--soil)] hover:text-[var(--sprout)] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" strokeWidth={3} />
        </button>
        <h2 className="text-[14px] text-[var(--soil)] uppercase">
          {today} {isToday && '(TODAY)'}
        </h2>
        <button 
          onClick={() => navigateDate('next')}
          className="text-[var(--soil)] hover:text-[var(--sprout)] transition-colors"
        >
          <ChevronRight className="w-4 h-4" strokeWidth={3} />
        </button>
      </div>

      {/* Journal content */}
      <div className="flex-1 p-4 overflow-y-auto bg-[var(--sand)]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[12px] text-[var(--bark)] uppercase">Daily Tasks</h3>
          {totalCount > 0 && (
            <span className="text-[8px] text-[var(--khaki)]">
              {completedCount}/{totalCount}
            </span>
          )}
        </div>
        
        {dateTasks.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-[10px] text-[var(--khaki)] uppercase text-center">
              No tasks for this date<br />
              {isToday ? 'Tasks will appear here when scheduled!' : 'Select a different date'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {dateTasks.map((task) => (
              <div key={task.id} className="flex items-start gap-3">
                <PixelCheckbox
                  checked={task.completed}
                  onChange={() => toggleTask(task)}
                />
                <span className={`text-[10px] flex-1 pt-[2px] ${task.completed ? 'line-through text-[var(--khaki)]' : 'text-[var(--soil)]'}`}>
                  {task.type === 'watering' ? '💧' : '🌿'} {task.type === 'watering' ? 'Water' : 'Fertilize'} {task.plantName}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Journal binding effect */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--bark)]"></div>
      <div className="absolute left-3 top-0 bottom-0 w-[1px] bg-[var(--khaki)] opacity-50"></div>
    </PixelCard>
  );
}
