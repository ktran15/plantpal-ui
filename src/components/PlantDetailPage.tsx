import { useState } from 'react';
import { ArrowLeft, Camera, Droplet, Sun, Wind } from 'lucide-react';
import { PixelButton } from './PixelButton';
import { PixelCard } from './PixelCard';
import { PlantSprite } from './PlantSprite';
import { PixelCheckbox } from './PixelCheckbox';

interface PlantDetailPageProps {
  plantId: string;
  onBack: () => void;
}

export function PlantDetailPage({ plantId, onBack }: PlantDetailPageProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'stats' | 'photos'>('overview');
  
  // Mock data - will come from backend
  const plant = {
    name: 'Monstera',
    species: 'Monstera deliciosa',
    xp: 75,
    state: 'happy' as const,
    tasks: [
      { id: '1', text: 'Water plant', completed: false },
      { id: '2', text: 'Check soil moisture', completed: true },
      { id: '3', text: 'Clean leaves', completed: false }
    ],
    stats: {
      wateringFrequency: 'Every 7 days',
      lastWatered: '3 days ago',
      sunlight: 'Bright indirect',
      humidity: 'Medium-High'
    }
  };

  const tabs = [
    { id: 'overview', label: 'OVERVIEW' },
    { id: 'tasks', label: 'TASKS' },
    { id: 'stats', label: 'STATS' },
    { id: 'photos', label: 'PHOTOS' }
  ];

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      {/* Back button */}
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-[var(--soil)] hover:text-[var(--sprout)] transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" strokeWidth={3} />
        <span className="text-[10px] uppercase">Back to plants</span>
      </button>

      {/* Plant Header */}
      <PixelCard className="p-6 mb-4">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <PlantSprite state={plant.state} size="lg" xp={plant.xp} />
          
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-[20px] text-[var(--soil)] uppercase mb-2">{plant.name}</h1>
            <p className="text-[12px] text-[var(--khaki)] mb-4">{plant.species}</p>
            
            <div className="flex gap-2 justify-center md:justify-start">
              <PixelButton variant="accent" size="sm">
                <Camera className="w-4 h-4 mr-2" strokeWidth={2.5} />
                ADD PHOTO
              </PixelButton>
              <PixelButton variant="danger" size="sm">
                REMOVE
              </PixelButton>
            </div>
          </div>
        </div>
      </PixelCard>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 text-[10px] uppercase pixel-border transition-colors ${
              activeTab === tab.id
                ? 'bg-[var(--sprout)] text-white'
                : 'bg-[var(--wheat)] text-[var(--soil)] hover:bg-[var(--khaki)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <PixelCard className="p-6 min-h-[300px]">
        {activeTab === 'overview' && (
          <div>
            <h2 className="text-[14px] text-[var(--soil)] uppercase mb-4">Care Overview</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Droplet className="w-5 h-5 text-[var(--sprout)] flex-shrink-0" strokeWidth={2.5} />
                <div>
                  <p className="text-[10px] text-[var(--bark)] uppercase mb-1">Watering</p>
                  <p className="text-[10px] text-[var(--soil)]">{plant.stats.wateringFrequency}</p>
                  <p className="text-[8px] text-[var(--khaki)]">Last watered: {plant.stats.lastWatered}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Sun className="w-5 h-5 text-[var(--sprout)] flex-shrink-0" strokeWidth={2.5} />
                <div>
                  <p className="text-[10px] text-[var(--bark)] uppercase mb-1">Sunlight</p>
                  <p className="text-[10px] text-[var(--soil)]">{plant.stats.sunlight}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Wind className="w-5 h-5 text-[var(--sprout)] flex-shrink-0" strokeWidth={2.5} />
                <div>
                  <p className="text-[10px] text-[var(--bark)] uppercase mb-1">Humidity</p>
                  <p className="text-[10px] text-[var(--soil)]">{plant.stats.humidity}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div>
            <h2 className="text-[14px] text-[var(--soil)] uppercase mb-4">Care Tasks</h2>
            <div className="space-y-3">
              {plant.tasks.map((task) => (
                <div key={task.id} className="flex items-start gap-3">
                  <PixelCheckbox
                    checked={task.completed}
                    onChange={() => {}}
                  />
                  <span className={`text-[10px] flex-1 pt-[2px] ${task.completed ? 'line-through text-[var(--khaki)]' : 'text-[var(--soil)]'}`}>
                    {task.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'stats' && (
          <div>
            <h2 className="text-[14px] text-[var(--soil)] uppercase mb-4">Plant Stats</h2>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] text-[var(--bark)] uppercase mb-2">Growth Level</p>
                <div className="h-4 pixel-border bg-[var(--sand)] overflow-hidden">
                  <div className="h-full bg-[var(--sprout)]" style={{ width: `${plant.xp}%` }} />
                </div>
                <p className="text-[8px] text-[var(--khaki)] mt-1">XP: {plant.xp}/100</p>
              </div>
              
              <div>
                <p className="text-[10px] text-[var(--bark)] uppercase mb-1">Days in care</p>
                <p className="text-[12px] text-[var(--soil)]">42 days</p>
              </div>
              
              <div>
                <p className="text-[10px] text-[var(--bark)] uppercase mb-1">Health status</p>
                <p className="text-[12px] text-[var(--sprout)]">THRIVING</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'photos' && (
          <div>
            <h2 className="text-[14px] text-[var(--soil)] uppercase mb-4">Photo Gallery</h2>
            <div className="text-center py-12">
              <span className="text-[60px] opacity-30">📸</span>
              <p className="text-[10px] text-[var(--khaki)] uppercase mt-4">
                No photos yet<br />
                Add photos to track growth!
              </p>
            </div>
          </div>
        )}
      </PixelCard>
    </div>
  );
}
