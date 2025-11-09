import React, { useState, useEffect } from 'react';
import { PixelButton } from './PixelButton';
import { PixelCard } from './PixelCard';
import { PixelLoader } from './PixelLoader';
import { migrateLocalStoragePlantsToFirestore, getMigrationStatus } from '../utils/migrateToFirestore';
import { auth } from '../lib/firebase-client';
import { toast } from 'sonner';
import { Upload, CheckCircle, AlertCircle } from 'lucide-react';

interface MigrationButtonProps {
  onMigrationComplete?: () => void;
}

export function MigrationButton({ onMigrationComplete }: MigrationButtonProps) {
  const [status, setStatus] = useState<{
    localCount: number;
    firestoreCount: number;
    needsMigration: boolean;
  } | null>(null);
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationComplete, setMigrationComplete] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const migrationStatus = await getMigrationStatus();
      setStatus(migrationStatus);
    } catch (error) {
      console.error('Error checking migration status:', error);
    }
  };

  const handleMigration = async () => {
    setIsMigrating(true);
    try {
      const userId = auth?.currentUser?.uid || 'local-user';
      const result = await migrateLocalStoragePlantsToFirestore(userId);

      if (result.success > 0) {
        toast.success(`Migrated ${result.success} plants to Firestore! 🌱`);
        setMigrationComplete(true);
        
        if (onMigrationComplete) {
          onMigrationComplete();
        }
      }

      if (result.failed > 0) {
        toast.error(`Failed to migrate ${result.failed} plants. Check console for details.`);
        console.error('Migration errors:', result.errors);
      }

      // Refresh status
      await checkStatus();
    } catch (error) {
      console.error('Migration error:', error);
      toast.error('Migration failed. Check console for details.');
    } finally {
      setIsMigrating(false);
    }
  };

  if (!status) {
    return null;
  }

  if (migrationComplete || !status.needsMigration) {
    return (
      <PixelCard className="p-4 bg-[var(--sprout)] border-[var(--fern)]">
        <div className="flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-white" strokeWidth={2.5} />
          <div>
            <p className="text-[10px] text-white uppercase">AI System Active</p>
            <p className="text-[8px] text-[var(--eggshell)] opacity-90">
              {status.firestoreCount} plants synced to Firestore
            </p>
          </div>
        </div>
      </PixelCard>
    );
  }

  return (
    <PixelCard className="p-4 bg-[var(--sand-2)]">
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-[var(--clay)] flex-shrink-0" strokeWidth={2.5} />
          <div className="flex-1">
            <p className="text-[10px] text-[var(--soil)] uppercase mb-1">
              Enable AI Features
            </p>
            <p className="text-[8px] text-[var(--khaki)] mb-2">
              Migrate your {status.localCount} plant{status.localCount !== 1 ? 's' : ''} to unlock:
            </p>
            <ul className="text-[8px] text-[var(--khaki)] space-y-1 mb-3">
              <li>• 🤖 AI happiness tracking</li>
              <li>• 📅 Automatic task scheduling</li>
              <li>• 📸 Photo analysis</li>
              <li>• 💧 Care reminders</li>
            </ul>

            {showDetails && (
              <div className="text-[8px] text-[var(--khaki)] mb-2 p-2 bg-[var(--sand)] pixel-border">
                <p className="mb-1">Status:</p>
                <p>• localStorage: {status.localCount} plants</p>
                <p>• Firestore: {status.firestoreCount} plants</p>
              </div>
            )}

            <div className="flex gap-2">
              {isMigrating ? (
                <div className="w-full">
                  <PixelLoader text="MIGRATING..." />
                </div>
              ) : (
                <>
                  <PixelButton
                    variant="primary"
                    size="sm"
                    onClick={handleMigration}
                    className="flex-1"
                  >
                    <Upload className="w-3 h-3 mr-1" strokeWidth={2.5} />
                    MIGRATE TO AI
                  </PixelButton>
                  <PixelButton
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowDetails(!showDetails)}
                  >
                    {showDetails ? 'HIDE' : 'INFO'}
                  </PixelButton>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </PixelCard>
  );
}

