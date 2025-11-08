import { useState } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './components/HomePage';
import { MyPlantsPage } from './components/MyPlantsPage';
import { PlantDetailPage } from './components/PlantDetailPage';
import { CameraPage } from './components/CameraPage';
import { PlantPalAgent } from './components/PlantPalAgent';
import { AddPlantModal } from './components/AddPlantModal';
import { DesignShowcase } from './components/DesignShowcase';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner@2.0.3';

type View = 'showcase' | 'home' | 'myPlants' | 'plantDetail' | 'camera';

interface Plant {
  id: string;
  name: string;
  species: string;
  xp: number;
  state: 'happy' | 'neutral' | 'sad' | 'sick' | 'evolving';
}

export default function App() {
  const [currentView, setCurrentView] = useState<View>('showcase');
  const [selectedPlantId, setSelectedPlantId] = useState<string | null>(null);
  const [isAgentOpen, setIsAgentOpen] = useState(false);
  const [isAddPlantModalOpen, setIsAddPlantModalOpen] = useState(false);
  const [plants, setPlants] = useState<Plant[]>([
    {
      id: '1',
      name: 'Monstera',
      species: 'Monstera deliciosa',
      xp: 75,
      state: 'happy'
    },
    {
      id: '2',
      name: 'Snake Plant',
      species: 'Sansevieria trifasciata',
      xp: 60,
      state: 'neutral'
    },
    {
      id: '3',
      name: 'Cactus',
      species: 'Opuntia microdasys',
      xp: 40,
      state: 'happy'
    }
  ]);

  const handleAddPlant = (newPlant: { name: string; species: string }) => {
    const plant: Plant = {
      id: Date.now().toString(),
      name: newPlant.name,
      species: newPlant.species,
      xp: 0,
      state: 'neutral'
    };
    
    setPlants([...plants, plant]);
    toast.success(`${newPlant.name} added to your garden! 🌱`, {
      duration: 3000,
      action: {
        label: 'View',
        onClick: () => setCurrentView('myPlants')
      }
    });
    
    // Navigate to My Plants after adding
    setTimeout(() => {
      setCurrentView('myPlants');
    }, 1500);
  };

  const handlePlantClick = (plantId: string) => {
    setSelectedPlantId(plantId);
    setCurrentView('plantDetail');
  };

  const renderView = () => {
    switch (currentView) {
      case 'showcase':
        return <DesignShowcase onStart={() => setCurrentView('home')} />;
      case 'home':
        return <HomePage onAddPlantClick={() => setIsAddPlantModalOpen(true)} plantCount={plants.length} />;
      case 'myPlants':
        return <MyPlantsPage plants={plants} onPlantClick={handlePlantClick} />;
      case 'plantDetail':
        return selectedPlantId ? (
          <PlantDetailPage 
            plantId={selectedPlantId} 
            onBack={() => setCurrentView('myPlants')} 
          />
        ) : null;
      case 'camera':
        return <CameraPage onBack={() => setCurrentView('home')} />;
      default:
        return <HomePage onAddPlantClick={() => setIsAddPlantModalOpen(true)} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--eggshell)] pixel-grid-bg">
      {currentView !== 'showcase' && (
        <Header
          onCameraClick={() => setCurrentView('camera')}
          onMyPlantsClick={() => setCurrentView('myPlants')}
          onAgentClick={() => setIsAgentOpen(true)}
          onShowcaseClick={() => setCurrentView('showcase')}
        />
      )}
      
      <main className={currentView === 'showcase' ? '' : 'flex-1 py-6'}>
        {renderView()}
      </main>
      
      {currentView !== 'showcase' && <Footer />}
      
      <PlantPalAgent 
        isOpen={isAgentOpen} 
        onClose={() => setIsAgentOpen(false)} 
      />
      
      <AddPlantModal
        isOpen={isAddPlantModalOpen}
        onClose={() => setIsAddPlantModalOpen(false)}
        onAdd={handleAddPlant}
      />
      
      <Toaster 
        position="top-center"
        toastOptions={{
          style: {
            fontFamily: 'Press Start 2P, monospace',
            fontSize: '10px',
            textTransform: 'uppercase',
            border: '2px solid var(--bark)',
            boxShadow: '3px 3px 0 0 rgba(106, 60, 51, 0.3)',
          },
        }}
      />
    </div>
  );
}
