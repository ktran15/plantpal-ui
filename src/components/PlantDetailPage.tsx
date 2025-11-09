import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Camera, Droplet, Sun, Wind, Upload } from 'lucide-react';
import { PixelButton } from './PixelButton';
import { PixelCard } from './PixelCard';
import { PlantSprite } from './PlantSprite';
import { PixelLoader } from './PixelLoader';
import { storage, auth } from '../lib/firebase-client';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getHappinessColor, getHappinessStatusText } from '../utils/happiness';
import { CareRecommendations, Plant } from '../types/plant';
import { toast } from 'sonner';

interface PlantDetailPageProps {
  plant: Plant; // Accept plant data directly
  onBack: () => void;
}

export function PlantDetailPage({ plant, onBack }: PlantDetailPageProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'stats' | 'photos'>('overview');
  const [careRecommendations, setCareRecommendations] = useState<CareRecommendations | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch care recommendations when component mounts
  useEffect(() => {
    if (!careRecommendations) {
      fetchCareRecommendations();
    }
  }, []);

  // Fetch care recommendations
  const fetchCareRecommendations = async () => {
    setLoadingRecommendations(true);
    try {
      // For localStorage plants, use default care recommendations
      const recommendations: CareRecommendations = {
        watering: 'Every 7 days',
        sunlight: 'Bright indirect light',
        humidity: 'Medium to high humidity',
        temperature: '65-80°F (18-27°C)',
        fertilizing: 'Every 14 days during growing season',
      };
      setCareRecommendations(recommendations);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  // Handle photo upload
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!storage || !auth) {
      toast.error('Firebase Storage not configured. Add VITE_FIREBASE_* to .env file');
      return;
    }

    setUploadingPhoto(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        toast.error('Firebase Auth not set up yet. Photo upload coming soon!');
        setUploadingPhoto(false);
        return;
      }

      // Upload to Firebase Storage
      const storageRef = ref(storage, `plants/${plant.id}/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      toast.success('Photo uploaded! 📸');
    } catch (err) {
      console.error('Photo upload error:', err);
      toast.error('Failed to upload photo');
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Calculate days in care (from localStorage plant)
  const getDaysInCare = (): number => {
    if (!plant?.createdAt) return 0;
    const created = new Date(plant.createdAt); // createdAt is a string in localStorage
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  // Format last action (not tracked in localStorage yet)
  const formatLastAction = (): string => {
    return 'Not tracked yet';
  };

  const tabs = [
    { id: 'overview', label: 'OVERVIEW' },
    { id: 'tasks', label: 'TASKS' },
    { id: 'stats', label: 'STATS' },
    { id: 'photos', label: 'PHOTOS' }
  ];

  // Use XP as happiness for localStorage plants
  const happiness = plant.xp ?? 50;
  const happinessColor = getHappinessColor(happiness);
  const happinessStatus = getHappinessStatusText(happiness);
  const daysInCare = getDaysInCare();

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
          <PlantSprite 
            state={happiness >= 75 ? 'happy' : happiness >= 50 ? 'neutral' : happiness >= 25 ? 'sad' : 'sick'} 
            size="lg" 
            xp={happiness} 
          />
          
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-[20px] text-[var(--soil)] uppercase mb-2">{plant.name}</h1>
            <p className="text-[12px] text-[var(--khaki)] mb-4">{plant.species}</p>
            
            <div className="flex gap-2 justify-center md:justify-start">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
              <PixelButton 
                variant="accent" 
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPhoto}
              >
                <Camera className="w-4 h-4 mr-2" strokeWidth={2.5} />
                {uploadingPhoto ? 'UPLOADING...' : 'ADD PHOTO'}
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
            {loadingRecommendations ? (
              <PixelLoader text="LOADING RECOMMENDATIONS..." />
            ) : (
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Droplet className="w-5 h-5 text-[var(--sprout)] flex-shrink-0" strokeWidth={2.5} />
                  <div>
                    <p className="text-[10px] text-[var(--bark)] uppercase mb-1">Watering</p>
                    <p className="text-[10px] text-[var(--soil)]">
                      {careRecommendations?.watering || 'Every 7 days'}
                    </p>
                    <p className="text-[8px] text-[var(--khaki)]">
                      Last watered: {formatLastAction()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Sun className="w-5 h-5 text-[var(--sprout)] flex-shrink-0" strokeWidth={2.5} />
                  <div>
                    <p className="text-[10px] text-[var(--bark)] uppercase mb-1">Sunlight</p>
                    <p className="text-[10px] text-[var(--soil)]">
                      {careRecommendations?.sunlight || 'Bright indirect light'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Wind className="w-5 h-5 text-[var(--sprout)] flex-shrink-0" strokeWidth={2.5} />
                  <div>
                    <p className="text-[10px] text-[var(--bark)] uppercase mb-1">Humidity</p>
                    <p className="text-[10px] text-[var(--soil)]">
                      {careRecommendations?.humidity || 'Medium to high humidity'}
                    </p>
                  </div>
                </div>

                {careRecommendations?.temperature && (
                  <div className="flex items-start gap-3">
                    <Sun className="w-5 h-5 text-[var(--sprout)] flex-shrink-0" strokeWidth={2.5} />
                    <div>
                      <p className="text-[10px] text-[var(--bark)] uppercase mb-1">Temperature</p>
                      <p className="text-[10px] text-[var(--soil)]">{careRecommendations.temperature}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'tasks' && (
          <div>
            <h2 className="text-[14px] text-[var(--soil)] uppercase mb-4">Care Tasks</h2>
            <div className="space-y-3">
              <p className="text-[10px] text-[var(--khaki)] mb-4">
                Tasks are managed in the Daily Tasks calendar on the home page.
              </p>
              <p className="text-[10px] text-[var(--soil)] mb-2">
                🔜 Coming soon: Autonomous AI task scheduling
              </p>
              <ul className="text-[10px] text-[var(--khaki)] space-y-1">
                <li>• Automatic watering reminders</li>
                <li>• Fertilizing schedules</li>
                <li>• Care tracking</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'stats' && (
          <div>
            <h2 className="text-[14px] text-[var(--soil)] uppercase mb-4">Plant Stats</h2>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] text-[var(--bark)] uppercase mb-2">Happiness Level</p>
                <div className="h-4 pixel-border bg-[var(--sand)] overflow-hidden">
                  <div 
                    className="h-full transition-all duration-300" 
                    style={{ 
                      width: `${happiness}%`,
                      backgroundColor: happinessColor
                    }} 
                  />
                </div>
                <p className="text-[8px] text-[var(--khaki)] mt-1">Happiness: {happiness}/100</p>
              </div>
              
              <div>
                <p className="text-[10px] text-[var(--bark)] uppercase mb-1">Days in care</p>
                <p className="text-[12px] text-[var(--soil)]">{daysInCare} days</p>
              </div>
              
              <div>
                <p className="text-[10px] text-[var(--bark)] uppercase mb-1">Health status</p>
                <p 
                  className="text-[12px] uppercase"
                  style={{ color: happinessColor }}
                >
                  {happinessStatus}
                </p>
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
              <PixelButton
                variant="accent"
                size="sm"
                className="mt-4"
                onClick={() => fileInputRef.current?.click()}
                disabled={!storage}
              >
                <Upload className="w-4 h-4 mr-2" strokeWidth={2.5} />
                UPLOAD PHOTO
              </PixelButton>
              {!storage && (
                <p className="text-[8px] text-[var(--khaki)] mt-2">
                  Photo upload requires Firebase configuration
                </p>
              )}
            </div>
          </div>
        )}
      </PixelCard>
    </div>
  );
}
