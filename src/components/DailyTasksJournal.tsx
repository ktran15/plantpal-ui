import { useState } from 'react';
import { PixelCard } from './PixelCard';
import { PixelCheckbox } from './PixelCheckbox';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Task {
  id: string;
  text: string;
  completed: boolean;
  plantName?: string;
}

export function DailyTasksJournal() {
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', text: 'Water Monstera', completed: false, plantName: 'Monstera' },
    { id: '2', text: 'Check soil moisture - Cactus', completed: false, plantName: 'Cactus' },
    { id: '3', text: 'Rotate Snake Plant', completed: true, plantName: 'Snake Plant' }
  ]);

  const today = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: '2-digit' 
  });

  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;

  const toggleTask = (id: string) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  return (
    <PixelCard variant="light" className="h-[400px] flex flex-col relative">
      {/* Journal header with page turn effect */}
      <div className="border-b-2 border-[var(--bark)] p-4 bg-[var(--sand-2)] flex items-center justify-between">
        <button className="text-[var(--soil)] hover:text-[var(--sprout)] transition-colors">
          <ChevronLeft className="w-4 h-4" strokeWidth={3} />
        </button>
        <h2 className="text-[14px] text-[var(--soil)] uppercase">{today}</h2>
        <button className="text-[var(--soil)] hover:text-[var(--sprout)] transition-colors">
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
        
        {tasks.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-[10px] text-[var(--khaki)] uppercase text-center">
              No tasks yet<br />
              Add a plant to get started!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <div key={task.id} className="flex items-start gap-3">
                <PixelCheckbox
                  checked={task.completed}
                  onChange={() => toggleTask(task.id)}
                />
                <span className={`text-[10px] flex-1 pt-[2px] ${task.completed ? 'line-through text-[var(--khaki)]' : 'text-[var(--soil)]'}`}>
                  {task.text}
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
