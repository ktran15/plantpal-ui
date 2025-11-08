# 🌱 PlantPal - 16-Bit Pixel Art Plant Care App

## Overview
PlantPal is a nostalgic, Game Boy Color-inspired plant care web application built with React, TypeScript, and Tailwind CSS. The entire UI features hand-crafted 16-bit pixel art aesthetics with a warm botanical color palette.

## 🎨 Design System

### Color Palette
- **Sand** (#E4B88B) - Light warm backgrounds
- **Leaf** (#87B960) - Success states, healthy indicators
- **Clay** (#B76746) - Warning states, danger actions
- **Bark** (#945341) - Primary borders
- **Soil** (#6A3C33) - Text color
- **Fern** (#3B7F4B) - Deep green accents
- **Sprout** (#5FA244) - Primary action color
- **Eggshell** (#E7EAD1) - Main background
- **Wheat** (#C3A17C) - Secondary surfaces
- **Khaki** (#C29871) - Muted text

### Typography
- **Font**: Press Start 2P (Google Fonts)
- **Sizes**: 8px - 24px (pixel-friendly increments)
- **Style**: All uppercase, tight line-height, no anti-aliasing
- **Rendering**: Crisp pixel-perfect edges

### Visual Style
- 2px borders on all components
- Block shadows (no blur) - 3px offset
- Maximum 2px corner rounding for pixel aesthetic
- Pixel grid background pattern
- Image rendering: pixelated/crisp-edges

## 📁 Component Architecture

### Core Pixel Components
1. **PixelButton** - Multi-variant buttons with active state animations
   - Variants: primary, secondary, accent, danger
   - Sizes: sm, md, lg
   - Features: 2px border, block shadow, 1px shift on active

2. **PixelCard** - Container components with variants
   - Variants: default, dark, light
   - Pixel borders and block shadows

3. **PixelInput** - Form inputs with pixel styling
   - 2px borders, focus states
   - Pixel-perfect text rendering

4. **PixelCheckbox** - Custom checkbox with pixel leaf icon
   - 16×16 sprite size
   - Custom SVG checkmark

5. **PixelBadge** - Status indicators
   - Variants: success, warning, info, neutral

6. **PixelLoader** - Loading state with bouncing pixel blocks

7. **EmptyState** - Reusable empty state component

### Feature Components

8. **PlantSprite** - Tamagotchi-style plant sprites
   - States: happy, neutral, sad, sick, evolving
   - XP bar with visual progress
   - Heart meter for care level
   - Ready for AI-generated 16-bit sprites

9. **PlantCard** - Individual plant card with sprite
   - Shows name, species, XP, and care hearts
   - Hover animations

10. **Header** - App navigation header
    - Logo with hover animation
    - Navigation buttons (My Plants, Camera, Agent)
    - Design System toggle

11. **Footer** - Minimal footer with links

12. **AddPlantCard** - Large CTA card for adding plants
    - Faint plant silhouette shadow
    - Adapts messaging for first plant vs. subsequent

13. **DailyTasksJournal** - Pixel notebook design
    - Date navigation with pixel arrows
    - Task checklist with completion counter
    - Page binding visual effect
    - Empty state

14. **PlantPalAgent** - Chat drawer with AI assistant
    - Pixel chat mascot (🌿)
    - Message bubbles with pixel borders
    - Slide-in animation
    - Input field with send button

15. **AddPlantModal** - Modal for adding new plants
    - Form with name and species inputs
    - Pixel-styled overlay

### Page Components

16. **HomePage** - Main dashboard
    - Welcome banner (when plants exist)
    - 60/40 split layout (Add Card / Journal)
    - Responsive grid

17. **MyPlantsPage** - Plant collection grid
    - Grid of plant cards
    - Plant count header
    - Empty state for no plants

18. **PlantDetailPage** - Individual plant view
    - Large plant sprite with XP
    - Tabbed interface (Overview, Tasks, Stats, Photos)
    - Care statistics and metrics
    - Action buttons (Add Photo, Remove)

19. **CameraPage** - Plant identification/diagnosis
    - Mode toggle (Identify vs. Diagnose)
    - File upload with drag-drop area
    - Mock AI results display
    - Add to garden functionality

20. **DesignShowcase** - Complete design system documentation
    - All component examples
    - Color palette display
    - Typography samples
    - Implementation guide
    - Feature previews

## 🗺️ Navigation Flow

```
Showcase (Welcome) → Home
                      ├─→ My Plants → Plant Detail
                      ├─→ Camera
                      └─→ PlantPal Agent (Drawer)
```

## 🎮 Features

### Implemented
- ✅ 16-bit pixel art design system
- ✅ Responsive layout (desktop + mobile)
- ✅ Plant management (add, view, detail)
- ✅ Daily task journal with checkboxes
- ✅ PlantPal AI chat interface
- ✅ Camera upload UI for identification
- ✅ Tamagotchi-style plant sprites with states
- ✅ XP and care meter system
- ✅ Toast notifications
- ✅ Modal dialogs
- ✅ Empty states
- ✅ Loading states

### Ready for Backend Integration
- 🔌 Supabase database connection
- 🔌 Gemini 2.5 Flash API for:
  - Plant identification
  - Plant diagnosis
  - 16-bit sprite generation
  - Daily task recommendations
  - Chat responses

## 🛠️ Tech Stack

- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS v4.0
- **Icons**: Lucide React
- **Font**: Press Start 2P (Google Fonts)
- **Notifications**: Sonner
- **Future**: Supabase + Gemini 2.5 Flash

## 🎯 Key Design Principles

1. **Pixel-Perfect**: Everything rendered with crisp edges, no anti-aliasing
2. **Nostalgic**: Inspired by Game Boy Color and early Pokémon games
3. **Botanical**: Warm earthy color palette with plant-themed elements
4. **Cozy**: Friendly, nurturing tone throughout
5. **Consistent**: All components follow 16-bit aesthetic rules
6. **Accessible**: Proper semantic HTML, keyboard navigation
7. **Responsive**: Works on mobile through desktop

## 📦 File Structure

```
/
├── App.tsx (Main app with routing)
├── components/
│   ├── PixelButton.tsx
│   ├── PixelCard.tsx
│   ├── PixelInput.tsx
│   ├── PixelCheckbox.tsx
│   ├── PixelBadge.tsx
│   ├── PixelLoader.tsx
│   ├── EmptyState.tsx
│   ├── PlantSprite.tsx
│   ├── PlantCard.tsx
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── AddPlantCard.tsx
│   ├── DailyTasksJournal.tsx
│   ├── PlantPalAgent.tsx
│   ├── AddPlantModal.tsx
│   ├── HomePage.tsx
│   ├── MyPlantsPage.tsx
│   ├── PlantDetailPage.tsx
│   ├── CameraPage.tsx
│   └── DesignShowcase.tsx
└── styles/
    └── globals.css (Color palette + pixel utilities)
```

## 🚀 Next Steps for Implementation

1. **Backend Setup**
   - Initialize Supabase project
   - Create tables: plants, tasks, photos, chat_history
   - Set up authentication (optional)

2. **AI Integration**
   - Connect Gemini 2.5 Flash API
   - Implement plant identification endpoint
   - Implement plant diagnosis endpoint
   - Set up sprite generation workflow
   - Create autonomous task generator

3. **Data Persistence**
   - Replace mock data with Supabase queries
   - Implement CRUD operations for plants
   - Store task completions
   - Save chat history

4. **Advanced Features**
   - Photo gallery with upload
   - Growth timeline tracking
   - Plant evolution system
   - Achievement badges
   - Care streak counter
   - Watering reminders

## 📝 Design Tokens

All design tokens are defined in `/styles/globals.css`:
- Color variables (--sand, --leaf, etc.)
- Pixel utilities (.pixel-shadow, .pixel-border)
- Background patterns (.pixel-grid-bg, .dithered-bg)
- Typography scales (--text-xs through --text-3xl)

## 🎨 Export Assets

For production, export these assets:
- Logo sprite (32×32, 64×64)
- Plant state sprites (16×16, 32×32)
- UI element sprite sheets
- Icon set
- Favicon

## 💡 Usage

Start the showcase to see all components:
- Click "LAUNCH APP" to enter the main application
- Use palette icon in header to return to showcase
- Navigate between pages using header buttons
- Add plants, complete tasks, chat with agent

---

**PlantPal** - Nurturing plants, pixel by pixel 🌱
