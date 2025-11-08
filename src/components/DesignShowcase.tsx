import { PixelButton } from './PixelButton';
import { PixelCard } from './PixelCard';
import { PixelInput } from './PixelInput';
import { PixelCheckbox } from './PixelCheckbox';
import { PlantSprite } from './PlantSprite';
import { PixelBadge } from './PixelBadge';
import { PixelLoader } from './PixelLoader';
import { EmptyState } from './EmptyState';

interface DesignShowcaseProps {
  onStart: () => void;
}

export function DesignShowcase({ onStart }: DesignShowcaseProps) {
  return (
    <div className="min-h-screen bg-[var(--eggshell)] p-6 overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-[24px] text-[var(--soil)] mb-4">PLANTPAL DESIGN SYSTEM</h1>
          <p className="text-[12px] text-[var(--khaki)] mb-6">
            16-BIT PIXEL-ART • BOTANICAL • NOSTALGIC
          </p>
          <PixelButton onClick={onStart} variant="primary" size="lg">
            LAUNCH APP
          </PixelButton>
        </div>

        {/* Color Palette */}
        <PixelCard className="p-6">
          <h2 className="text-[16px] text-[var(--soil)] mb-4">COLOR PALETTE</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'SAND', color: 'var(--sand)' },
              { name: 'LEAF', color: 'var(--leaf)' },
              { name: 'CLAY', color: 'var(--clay)' },
              { name: 'BARK', color: 'var(--bark)' },
              { name: 'SOIL', color: 'var(--soil)' },
              { name: 'FERN', color: 'var(--fern)' },
              { name: 'SPROUT', color: 'var(--sprout)' },
              { name: 'EGGSHELL', color: 'var(--eggshell)' },
            ].map((item) => (
              <div key={item.name} className="space-y-2">
                <div
                  className="h-16 pixel-border"
                  style={{ backgroundColor: `var(--${item.name.toLowerCase()})` }}
                />
                <p className="text-[8px] text-[var(--soil)]">{item.name}</p>
              </div>
            ))}
          </div>
        </PixelCard>

        {/* Buttons */}
        <PixelCard className="p-6">
          <h2 className="text-[16px] text-[var(--soil)] mb-4">PIXEL BUTTONS</h2>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <PixelButton variant="primary">PRIMARY</PixelButton>
              <PixelButton variant="secondary">SECONDARY</PixelButton>
              <PixelButton variant="accent">ACCENT</PixelButton>
              <PixelButton variant="danger">DANGER</PixelButton>
            </div>
            <div className="flex flex-wrap gap-2">
              <PixelButton size="sm">SMALL</PixelButton>
              <PixelButton size="md">MEDIUM</PixelButton>
              <PixelButton size="lg">LARGE</PixelButton>
            </div>
          </div>
        </PixelCard>

        {/* Inputs & Forms */}
        <PixelCard className="p-6">
          <h2 className="text-[16px] text-[var(--soil)] mb-4">INPUTS & FORMS</h2>
          <div className="space-y-4 max-w-md">
            <PixelInput placeholder="ENTER PLANT NAME..." />
            <div className="space-y-2">
              <PixelCheckbox label="Water the plants" />
              <PixelCheckbox label="Check soil moisture" checked />
              <PixelCheckbox label="Rotate for sunlight" />
            </div>
          </div>
        </PixelCard>

        {/* Badges & Status */}
        <PixelCard className="p-6">
          <h2 className="text-[16px] text-[var(--soil)] mb-4">BADGES & STATUS</h2>
          <div className="flex flex-wrap gap-2">
            <PixelBadge variant="success">HEALTHY</PixelBadge>
            <PixelBadge variant="warning">NEEDS WATER</PixelBadge>
            <PixelBadge variant="info">NEW</PixelBadge>
            <PixelBadge variant="neutral">DORMANT</PixelBadge>
          </div>
        </PixelCard>

        {/* Loading States */}
        <PixelCard className="p-6">
          <h2 className="text-[16px] text-[var(--soil)] mb-4">LOADING STATES</h2>
          <PixelLoader text="GROWING..." />
        </PixelCard>

        {/* Empty States */}
        <div>
          <h2 className="text-[16px] text-[var(--soil)] mb-4">EMPTY STATES</h2>
          <EmptyState
            icon="🌿"
            title="NO PLANTS YET"
            description="Add your first plant to start your garden!"
            action={<PixelButton variant="primary" size="sm">ADD PLANT</PixelButton>}
          />
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-4">
          <PixelCard variant="default" className="p-4">
            <h3 className="text-[12px] text-[var(--soil)] mb-2">DEFAULT CARD</h3>
            <p className="text-[10px] text-[var(--khaki)]">Pixel borders with shadow</p>
          </PixelCard>
          <PixelCard variant="dark" className="p-4">
            <h3 className="text-[12px] text-[var(--soil)] mb-2">DARK VARIANT</h3>
            <p className="text-[10px] text-[var(--khaki)]">Darker background tone</p>
          </PixelCard>
          <PixelCard variant="light" className="p-4">
            <h3 className="text-[12px] text-[var(--soil)] mb-2">LIGHT VARIANT</h3>
            <p className="text-[10px] text-[var(--khaki)]">Lighter background tone</p>
          </PixelCard>
        </div>

        {/* Plant Sprites (Tamagotchi Mode) */}
        <PixelCard className="p-6">
          <h2 className="text-[16px] text-[var(--soil)] mb-4">PLANT SPRITES (TAMAGOTCHI MODE)</h2>
          <p className="text-[10px] text-[var(--khaki)] mb-6">
            Backend will generate 16-bit sprites via Gemini 2.5 Flash API
          </p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            <div className="text-center">
              <PlantSprite state="happy" xp={80} />
              <p className="text-[8px] text-[var(--soil)] mt-2 uppercase">Happy</p>
            </div>
            <div className="text-center">
              <PlantSprite state="neutral" xp={50} />
              <p className="text-[8px] text-[var(--soil)] mt-2 uppercase">Neutral</p>
            </div>
            <div className="text-center">
              <PlantSprite state="sad" xp={20} />
              <p className="text-[8px] text-[var(--soil)] mt-2 uppercase">Sad</p>
            </div>
            <div className="text-center">
              <PlantSprite state="sick" xp={10} />
              <p className="text-[8px] text-[var(--soil)] mt-2 uppercase">Sick</p>
            </div>
            <div className="text-center">
              <PlantSprite state="evolving" xp={100} />
              <p className="text-[8px] text-[var(--soil)] mt-2 uppercase">Evolving</p>
            </div>
          </div>
        </PixelCard>

        {/* Typography */}
        <PixelCard className="p-6">
          <h2 className="text-[16px] text-[var(--soil)] mb-4">TYPOGRAPHY</h2>
          <div className="space-y-3">
            <div>
              <p className="text-[8px] text-[var(--khaki)] mb-1">FONT: Press Start 2P</p>
              <h1>HEADING 1 (20PX)</h1>
            </div>
            <div>
              <h2>HEADING 2 (16PX)</h2>
            </div>
            <div>
              <h3>HEADING 3 (14PX)</h3>
            </div>
            <div>
              <p>Body text (12px) - Perfect for pixel-art interfaces with crisp rendering</p>
            </div>
            <div>
              <p className="text-[10px]">Small text (10px) - Used for labels and metadata</p>
            </div>
          </div>
        </PixelCard>

        {/* Features Preview */}
        <PixelCard className="p-6">
          <h2 className="text-[16px] text-[var(--soil)] mb-4">KEY FEATURES</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="text-[12px] text-[var(--sprout)]">✓ PLANTPAL AGENT</h3>
              <p className="text-[10px] text-[var(--soil)]">
                Pixel-chat drawer with friendly plant guide mascot
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-[12px] text-[var(--sprout)]">✓ TAMAGOTCHI MODE</h3>
              <p className="text-[10px] text-[var(--soil)]">
                Each plant becomes a pixel sprite with expressive states
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-[12px] text-[var(--sprout)]">✓ CAMERA TOOL</h3>
              <p className="text-[10px] text-[var(--soil)]">
                Identify plants or diagnose issues with AI
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-[12px] text-[var(--sprout)]">✓ DAILY JOURNAL</h3>
              <p className="text-[10px] text-[var(--soil)]">
                Pixel notebook with tasks and care tracking
              </p>
            </div>
          </div>
        </PixelCard>

        {/* Layout Example */}
        <PixelCard className="p-6">
          <h2 className="text-[16px] text-[var(--soil)] mb-4">DESIGN NOTES</h2>
          <div className="space-y-2 text-[10px] text-[var(--soil)]">
            <p>• All components use 2px borders with block shadows (no blur)</p>
            <p>• Pixel-perfect rendering with crisp edges</p>
            <p>• No anti-aliasing on fonts or images</p>
            <p>• Buttons shift 1-2px on active state</p>
            <p>• Checkboxes are 16×16 sprites with pixel leaf icon</p>
            <p>• Cards have 2px corner rounding maximum</p>
            <p>• Shadows use offset color blocks (no opacity)</p>
            <p>• Responsive: stacks to mobile, expands to desktop</p>
          </div>
        </PixelCard>

        {/* Implementation Details */}
        <PixelCard className="p-6 bg-[var(--wheat)]">
          <h2 className="text-[16px] text-[var(--soil)] mb-4">📋 IMPLEMENTATION GUIDE</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-[12px] text-[var(--bark)] mb-2 uppercase">Components Created</h3>
              <div className="grid grid-cols-2 gap-2 text-[8px] text-[var(--soil)]">
                <div>• PixelButton</div>
                <div>• PixelCard</div>
                <div>• PixelInput</div>
                <div>• PixelCheckbox</div>
                <div>• PlantSprite</div>
                <div>• PlantCard</div>
                <div>• PixelBadge</div>
                <div>• PixelLoader</div>
                <div>• EmptyState</div>
                <div>• Header</div>
                <div>• Footer</div>
                <div>• DailyTasksJournal</div>
                <div>• AddPlantCard</div>
                <div>• PlantPalAgent</div>
              </div>
            </div>
            
            <div>
              <h3 className="text-[12px] text-[var(--bark)] mb-2 uppercase">Pages Implemented</h3>
              <div className="text-[8px] text-[var(--soil)] space-y-1">
                <p>✓ Home Page (/) - Add Plant Card + Daily Tasks Journal</p>
                <p>✓ My Plants (/plants) - Grid view of all plants</p>
                <p>✓ Plant Detail (/plants/:id) - Tabs for Overview/Tasks/Stats/Photos</p>
                <p>✓ Camera (/camera) - Identify & Diagnose modes</p>
                <p>✓ Design Showcase - This comprehensive design system</p>
              </div>
            </div>
            
            <div>
              <h3 className="text-[12px] text-[var(--bark)] mb-2 uppercase">Tech Stack</h3>
              <div className="text-[8px] text-[var(--soil)] space-y-1">
                <p>• React + TypeScript</p>
                <p>• Tailwind CSS v4.0</p>
                <p>• Press Start 2P (Google Fonts)</p>
                <p>• Lucide React (icons)</p>
                <p>• Sonner (toast notifications)</p>
              </div>
            </div>
            
            <div>
              <h3 className="text-[12px] text-[var(--bark)] mb-2 uppercase">Next Steps for Backend</h3>
              <div className="text-[8px] text-[var(--soil)] space-y-1">
                <p>1. Connect to Supabase for plant data persistence</p>
                <p>2. Integrate Gemini 2.5 Flash API for plant identification</p>
                <p>3. Generate 16-bit sprites dynamically via AI</p>
                <p>4. Implement autonomous daily task generation</p>
                <p>5. Add photo upload and growth tracking</p>
              </div>
            </div>
          </div>
        </PixelCard>

        <div className="text-center pb-8 space-y-4">
          <PixelButton onClick={onStart} variant="accent" size="lg">
            START USING PLANTPAL →
          </PixelButton>
          
          <p className="text-[8px] text-[var(--khaki)] uppercase">
            Built with React • Tailwind CSS • TypeScript
          </p>
          
          <p className="text-[8px] text-[var(--khaki)]">
            Press ESC to close modals • Enter to submit forms
          </p>
        </div>
      </div>
    </div>
  );
}
