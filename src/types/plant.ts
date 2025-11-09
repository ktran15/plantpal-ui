export interface Plant {
  id: string;
  name: string;
  species: string;
  spriteUrl: string; // single PNG data URL with alpha
  xp: number;
  state: 'happy' | 'neutral' | 'sad' | 'sick' | 'evolving';
  createdAt: string;
}

