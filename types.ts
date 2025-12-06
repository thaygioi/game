
export interface GameGenerationState {
  status: 'idle' | 'loading' | 'consulting' | 'streaming' | 'success' | 'error';
  code: string;
  error?: string;
}

export interface PendingGameRequest {
  idea: string;
  ageGroup: string;
  difficulty: string;
}

export interface PromptInputProps {
  onGenerate: (idea: string, ageGroup: string, difficulty: string) => void;
  isGenerating: boolean;
}

export interface GameDisplayProps {
  state: GameGenerationState;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isThinking?: boolean;
}
