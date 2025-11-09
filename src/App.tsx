import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './components/HomePage';
import { MyPlantsPage } from './components/MyPlantsPage';
import { PlantDetailPage } from './components/PlantDetailPage';
import { CameraPage } from './components/CameraPage';
import { PlantPalAgent } from './components/PlantPalAgent';
import { AddPlantModal } from './components/AddPlantModal';
import { DesignShowcase } from './components/DesignShowcase';
import { ApiKeyBanner } from './components/ApiKeyBanner';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner@2.0.3';
import { Plant } from './types/plant';
import { getAllPlants, savePlants, createPlant, deletePlant } from './services/plants';
import { PlantProvider } from './contexts/PlantContext';
import { ErrorBoundary } from './components/ErrorBoundary';

type View = 'showcase' | 'home' | 'myPlants' | 'plantDetail' | 'camera';

const SELECTED_PLANT_INDEX_KEY = 'plantpals_selectedPlantIndex';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('showcase');
  const [selectedPlantId, setSelectedPlantId] = useState<string | null>(null);
  const [isAgentOpen, setIsAgentOpen] = useState(false);
  const [isAddPlantModalOpen, setIsAddPlantModalOpen] = useState(false);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [selectedPlantIndex, setSelectedPlantIndex] = useState<number>(0);
  const [showApiKeyBanner, setShowApiKeyBanner] = useState(false);

  // Validate API key on mount
  useEffect(() => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      setShowApiKeyBanner(true);
    }
  }, []);

  // Load plants and selected index from persistence on mount
  useEffect(() => {
    const loadedPlants = getAllPlants();
    // Migrate old plants: convert spriteFrames to spriteUrl
    const migratedPlants = loadedPlants.map((plant: any) => ({
      id: plant.id,
      name: plant.name,
      species: plant.species,
      xp: plant.xp || 0,
      state: plant.state || 'neutral',
      createdAt: plant.createdAt,
      // Migration: if plant has spriteFrames array, use first frame as spriteUrl
      spriteUrl: plant.spriteUrl || (plant.spriteFrames && plant.spriteFrames[0]) || '',
    }));
    setPlants(migratedPlants);

    // Load selected plant index
    const savedIndex = localStorage.getItem(SELECTED_PLANT_INDEX_KEY);
    if (savedIndex !== null && migratedPlants.length > 0) {
      const index = parseInt(savedIndex, 10);
      if (index >= 0 && index < migratedPlants.length) {
        setSelectedPlantIndex(index);
      }
    }
  }, []);

  // Save plants and selected index to persistence whenever they change
  useEffect(() => {
    if (plants.length > 0 || localStorage.getItem('plantpals_plants')) {
      savePlants(plants);
    }
    if (plants.length > 0 && selectedPlantIndex >= 0 && selectedPlantIndex < plants.length) {
      localStorage.setItem(SELECTED_PLANT_INDEX_KEY, selectedPlantIndex.toString());
    } else if (plants.length === 0) {
      localStorage.removeItem(SELECTED_PLANT_INDEX_KEY);
    }
  }, [plants, selectedPlantIndex]);

  const handleAddPlant = (newPlant: {
    name: string;
    species: string;
    spriteUrl: string;
  }) => {
    const plant = createPlant({
      name: newPlant.name,
      species: newPlant.species,
      xp: 0,
      state: 'neutral',
      spriteUrl: newPlant.spriteUrl,
    });

    const newPlants = [...plants, plant];
    setPlants(newPlants);
    
    // Select the new plant
    setSelectedPlantIndex(newPlants.length - 1);

    toast.success(`${newPlant.name} added to your garden! 🌱`, {
      duration: 3000,
    });

    // Stay on home page to see the new avatar
    if (currentView !== 'home') {
      setCurrentView('home');
    }
  };

  const handleDeletePlant = (plantId: string) => {
    const index = plants.findIndex((p) => p.id === plantId);
    if (index === -1) return;

    const plant = plants[index];
    deletePlant(plantId);
    const newPlants = plants.filter((p) => p.id !== plantId);
    setPlants(newPlants);

    // Update selected index
    if (newPlants.length === 0) {
      setSelectedPlantIndex(0);
    } else if (index >= newPlants.length) {
      // If deleted last item, select previous
      setSelectedPlantIndex(newPlants.length - 1);
    } else if (index === selectedPlantIndex) {
      // If deleted selected item, keep same index (which now points to next item)
      setSelectedPlantIndex(Math.min(index, newPlants.length - 1));
    } else if (index < selectedPlantIndex) {
      // If deleted before selected, decrement index
      setSelectedPlantIndex(selectedPlantIndex - 1);
    }

    toast.success(`${plant.name} removed from your garden`, {
      duration: 2000,
    });
  };

  const handleSelectPlant = (direction: 'prev' | 'next') => {
    if (plants.length === 0) return;

    if (direction === 'prev') {
      setSelectedPlantIndex((prev) => (prev === 0 ? plants.length - 1 : prev - 1));
    } else {
      setSelectedPlantIndex((prev) => (prev === plants.length - 1 ? 0 : prev + 1));
    }
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
        return (
          <HomePage
            onAddPlantClick={() => setIsAddPlantModalOpen(true)}
            plants={plants}
            selectedPlantIndex={selectedPlantIndex}
            onSelectPlant={handleSelectPlant}
            plantCount={plants.length}
          />
        );
      case 'myPlants':
        return (
          <MyPlantsPage
            plants={plants}
            onPlantClick={handlePlantClick}
            onDeletePlant={handleDeletePlant}
          />
        );
      case 'plantDetail':
        const selectedPlant = plants.find(p => p.id === selectedPlantId);
        return selectedPlant ? (
          <PlantDetailPage 
            plant={selectedPlant}
            onBack={() => setCurrentView('myPlants')} 
          />
        ) : null;
      case 'camera':
        return <CameraPage onBack={() => setCurrentView('home')} />;
      default:
        return (
          <HomePage
            onAddPlantClick={() => setIsAddPlantModalOpen(true)}
            plants={plants}
            selectedPlantIndex={selectedPlantIndex}
            onSelectPlant={handleSelectPlant}
            plantCount={plants.length}
          />
        );
    }
  };

  return (
    <ErrorBoundary>
      <PlantProvider>
        <div className="min-h-screen flex flex-col bg-[var(--eggshell)] pixel-grid-bg">
          {currentView !== 'showcase' && (
            <Header
              onCameraClick={() => setCurrentView('camera')}
              onMyPlantsClick={() => setCurrentView('myPlants')}
              onAgentClick={() => setIsAgentOpen(true)}
              onAddPlantClick={() => setIsAddPlantModalOpen(true)}
              onShowcaseClick={() => setCurrentView('showcase')}
            />
          )}
          
          <main className={currentView === 'showcase' ? '' : 'flex-1 py-6'}>
            {showApiKeyBanner && currentView !== 'showcase' && (
              <div className="max-w-7xl mx-auto px-4 md:px-6 pt-4">
                <ApiKeyBanner onDismiss={() => setShowApiKeyBanner(false)} />
              </div>
            )}
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
    </PlantProvider>
    </ErrorBoundary>
  );
}
