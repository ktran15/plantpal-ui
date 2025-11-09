import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs,
  onSnapshot, 
  query, 
  where, 
  Timestamp 
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase-client';
import { PlantDocument, PlantTask, HappinessStatus } from '../types/plant';
import { getHappinessStatus } from '../utils/happiness';

interface PlantContextType {
  plants: PlantDocument[];
  plant: PlantDocument | null;
  tasks: PlantTask[];
  loading: boolean;
  error: string | null;
  fetchPlant: (plantId: string) => Promise<void>;
  fetchTasks: (plantId?: string) => Promise<void>;
  subscribeToPlant: (plantId: string) => () => void;
  subscribeToTasks: (plantId?: string) => () => void;
}

const PlantContext = createContext<PlantContextType | undefined>(undefined);

export function usePlantContext() {
  const context = useContext(PlantContext);
  if (!context) {
    throw new Error('usePlantContext must be used within PlantProvider');
  }
  return context;
}

interface PlantProviderProps {
  children: ReactNode;
}

export function PlantProvider({ children }: PlantProviderProps) {
  const [plants, setPlants] = useState<PlantDocument[]>([]);
  const [plant, setPlant] = useState<PlantDocument | null>(null);
  const [tasks, setTasks] = useState<PlantTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch a single plant by ID
   */
  const fetchPlant = async (plantId: string) => {
    if (!db) {
      setError('Firebase not configured');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);

      const plantRef = doc(db, 'plants', plantId);
      const plantSnap = await getDoc(plantRef);

      if (plantSnap.exists()) {
        const plantData = plantSnap.data() as PlantDocument;
        setPlant(plantData);
      } else {
        setError('Plant not found');
        setPlant(null);
      }
    } catch (err) {
      console.error('Error fetching plant:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch plant');
      setPlant(null);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch tasks for a plant (or all tasks for current user)
   */
  const fetchTasks = async (plantId?: string) => {
    if (!db || !auth) {
      setError('Firebase not configured');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);

      const user = auth.currentUser;
      if (!user) {
        setError('User not authenticated');
        return;
      }

      let tasksQuery;
      if (plantId) {
        tasksQuery = query(
          collection(db, 'tasks'),
          where('userId', '==', user.uid),
          where('plantId', '==', plantId)
        );
      } else {
        tasksQuery = query(
          collection(db, 'tasks'),
          where('userId', '==', user.uid)
        );
      }

      // For now, we'll use a one-time fetch
      // Real-time subscription is handled by subscribeToTasks
      const tasksSnapshot = await getDocs(tasksQuery);
      const tasksData: PlantTask[] = [];
      tasksSnapshot.forEach((doc) => {
        tasksData.push({
          id: doc.id,
          ...doc.data(),
        } as PlantTask);
      });
      setTasks(tasksData);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Subscribe to real-time plant updates
   */
  const subscribeToPlant = (plantId: string) => {
    if (!db) {
      console.warn('Firebase not configured for plant subscription');
      return () => {};
    }
    
    const plantRef = doc(db, 'plants', plantId);
    
    const unsubscribe = onSnapshot(
      plantRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const plantData = snapshot.data() as PlantDocument;
          setPlant(plantData);
        } else {
          setPlant(null);
          setError('Plant not found');
        }
      },
      (err) => {
        console.error('Plant subscription error:', err);
        setError(err.message);
      }
    );

    return unsubscribe;
  };

  /**
   * Subscribe to real-time task updates
   */
  const subscribeToTasks = (plantId?: string) => {
    if (!db || !auth) {
      console.warn('Firebase not configured for task subscription');
      return () => {};
    }
    
    const user = auth.currentUser;
    if (!user) {
      console.warn('No authenticated user for task subscription');
      return () => {};
    }

    let tasksQuery;
    if (plantId) {
      tasksQuery = query(
        collection(db, 'tasks'),
        where('userId', '==', user.uid),
        where('plantId', '==', plantId)
      );
    } else {
      tasksQuery = query(
        collection(db, 'tasks'),
        where('userId', '==', user.uid)
      );
    }

    const unsubscribe = onSnapshot(
      tasksQuery,
      (snapshot) => {
        const tasksData: PlantTask[] = [];
        snapshot.forEach((doc) => {
          tasksData.push({
            id: doc.id,
            ...doc.data(),
          } as PlantTask);
        });
        setTasks(tasksData);
      },
      (err) => {
        console.error('Tasks subscription error:', err);
        setError(err.message);
      }
    );

    return unsubscribe;
  };

  const value: PlantContextType = {
    plants,
    plant,
    tasks,
    loading,
    error,
    fetchPlant,
    fetchTasks,
    subscribeToPlant,
    subscribeToTasks,
  };

  return <PlantContext.Provider value={value}>{children}</PlantContext.Provider>;
}

