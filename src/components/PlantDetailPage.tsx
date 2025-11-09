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
import { analyzePlantPhoto, generateSchedule } from '../services/plantAgentService';
import { usePlantContext } from '../contexts/PlantContext';
import { toast } from 'sonner';

interface PlantDetailPageProps {
  plant: Plant; // localStorage plant for fallback
  onBack: () => void;
}

export function PlantDetailPage({ plant: localPlant, onBack }: PlantDetailPageProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'stats' | 'photos'>('overview');
  const [careRecommendations, setCareRecommendations] = useState<CareRecommendations | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Try to fetch Firestore plant data
  const { plant: firestorePlant, tasks, loading, fetchPlant, subscribeToPlant, subscribeToTasks } = usePlantContext();

  // Fetch from Firestore on mount
  useEffect(() => {
    fetchPlant(localPlant.id);
    const unsubscribePlant = subscribeToPlant(localPlant.id);
    const unsubscribeTasks = subscribeToTasks(localPlant.id);

    return () => {
      unsubscribePlant();
      unsubscribeTasks();
    };
  }, [localPlant.id, fetchPlant, subscribeToPlant, subscribeToTasks]);

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
      // For development: allow photo uploads without auth
      const userId = auth?.currentUser?.uid || 'local-user';

      // Upload to Firebase Storage
      const storageRef = ref(storage!, `plants/${userId}/${plant.id}/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      toast.success('Photo uploaded! 📸');
      console.log('Photo uploaded to:', downloadURL);

      // Try to analyze photo with AI (only if plant is in Firestore)
      try {
        const response = await analyzePlantPhoto(userId, localPlant.id, downloadURL);
        if (response.happiness !== undefined) {
          toast.success(`AI Analysis: Happiness ${response.happiness}/100!`, {
            duration: 5000,
          });
          if (response.recommendations) {
            console.log('AI Recommendations:', response.recommendations);
          }
          // Refresh plant data to show new happiness
          fetchPlant(localPlant.id);
        }
      } catch (aiError) {
        console.log('AI analysis error:', aiError);
        toast.error('Photo uploaded but AI analysis failed. Check API server logs.');
      }
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

  // Calculate days in care
  const getDaysInCare = (): number => {
    if (isFirestorePlant && firestorePlant.createdAt) {
      const created = firestorePlant.createdAt.toDate();
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - created.getTime());
      return Math.floor(diffTime / (1000 * 60 * 60 * 24));
    } else if (localPlant.createdAt) {
      const created = new Date(localPlant.createdAt);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - created.getTime());
      return Math.floor(diffTime / (1000 * 60 * 60 * 24));
    }
    return 0;
  };

  // Format last action
  const formatLastAction = (): string => {
    if (isFirestorePlant && firestorePlant.lastWatered) {
      const date = firestorePlant.lastWatered.toDate();
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return '1 day ago';
      return `${diffDays} days ago`;
    }
    return 'Not tracked yet';
  };

  const tabs = [
    { id: 'overview', label: 'OVERVIEW' },
    { id: 'tasks', label: 'TASKS' },
    { id: 'stats', label: 'STATS' },
    { id: 'photos', label: 'PHOTOS' }
  ];

  // Use Firestore plant if available, otherwise fall back to localStorage plant
  const plant = firestorePlant || localPlant;
  const isFirestorePlant = !!firestorePlant;
  
  // Get happiness from Firestore plant or use XP as fallback
  const happiness = isFirestorePlant 
    ? (firestorePlant.happiness ?? 50)
    : (localPlant.xp ?? 50);
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
            <p className="text-[12px] text-[var(--khaki)] mb-2">{plant.species}</p>
            {isFirestorePlant && (
              <p className="text-[8px] text-[var(--sprout)] uppercase">✨ AI-POWERED</p>
            )}
            
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
                      {isFirestorePlant 
                        ? `Every ${firestorePlant.wateringIntervalDays} days`
                        : (careRecommendations?.watering || 'Every 7 days')}
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
              {isFirestorePlant ? (
                <>
                  <p className="text-[10px] text-[var(--khaki)] mb-3">
                    Tasks appear in the Daily Tasks calendar on the home page.
                  </p>
                  
                  {tasks && tasks.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-[10px] text-[var(--bark)] uppercase mb-2">Upcoming Tasks</p>
                      {tasks
                        .filter(task => !task.completed)
                        .slice(0, 5)
                        .map((task) => (
                          <div key={task.id} className="flex items-center gap-2 p-2 bg-[var(--sand)] pixel-border">
                            <span className="text-[10px] text-[var(--soil)]">
                              {task.type === 'watering' ? '💧' : '🌿'} {task.type === 'watering' ? 'Water' : 'Fertilize'} {plant.name}
                            </span>
                            <span className="text-[8px] text-[var(--khaki)] ml-auto">
                              {task.scheduledDate?.toDate().toLocaleDateString()}
                            </span>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="p-4 bg-[var(--sand)] pixel-border">
                      <p className="text-[10px] text-[var(--soil)] mb-2">No tasks scheduled yet</p>
                      <p className="text-[8px] text-[var(--khaki)]">
                        Upload a photo or use the button below to generate a care schedule
                      </p>
                    </div>
                  )}
                  
                  <PixelButton
                    variant="primary"
                    size="sm"
                    onClick={async () => {
                      try {
                        const userId = auth?.currentUser?.uid || 'local-user';
                        toast.success('Generating care schedule...');
                        const response = await generateSchedule(userId, localPlant.id, plant.species);
                        if (response.status === 'updated') {
                          toast.success('Care schedule created! Check Daily Tasks.');
                          fetchPlant(localPlant.id);
                        }
                      } catch (err) {
                        console.error('Schedule generation error:', err);
                        toast.error('Failed to generate schedule. Check API server.');
                      }
                    }}
                  >
                    GENERATE CARE SCHEDULE
                  </PixelButton>
                </>
              ) : (
                <div className="p-4 bg-[var(--sand)] pixel-border">
                  <p className="text-[10px] text-[var(--soil)] mb-2">⚠️ AI features not enabled</p>
                  <p className="text-[8px] text-[var(--khaki)]">
                    Click "MIGRATE TO AI" on the home page to enable autonomous task scheduling
                  </p>
                </div>
              )}
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
            {isFirestorePlant && firestorePlant.photoUrls && firestorePlant.photoUrls.length > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {firestorePlant.photoUrls.map((url, index) => (
                    <div key={index} className="aspect-square pixel-border overflow-hidden bg-[var(--sand)]">
                      <img 
                        src={url} 
                        alt={`${plant.name} photo ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
                <PixelButton
                  variant="accent"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={!storage || uploadingPhoto}
                >
                  <Upload className="w-4 h-4 mr-2" strokeWidth={2.5} />
                  {uploadingPhoto ? 'UPLOADING...' : 'ADD ANOTHER PHOTO'}
                </PixelButton>
              </div>
            ) : (
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
                  disabled={!storage || uploadingPhoto}
                >
                  <Upload className="w-4 h-4 mr-2" strokeWidth={2.5} />
                  {uploadingPhoto ? 'UPLOADING...' : 'UPLOAD PHOTO'}
                </PixelButton>
                {!storage && (
                  <p className="text-[8px] text-[var(--khaki)] mt-2">
                    Photo upload requires Firebase configuration
                  </p>
                )}
                {!isFirestorePlant && storage && (
                  <p className="text-[8px] text-[var(--clay)] mt-2">
                    ⚠️ Migrate to AI to enable photo tracking
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </PixelCard>
    </div>
  );
}
