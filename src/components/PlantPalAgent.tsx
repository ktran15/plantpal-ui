import React, { useState, useEffect } from 'react';
import { X, Send } from 'lucide-react';
import { PixelButton } from './PixelButton';
import { PixelInput } from './PixelInput';
import { PixelCard } from './PixelCard';
import { chatWithPlantPal, ChatMessage } from '../services/geminiService';
import plantPalImage from '../assets/PlantPalPlant.png';

interface PlantPalAgentProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'agent';
  avatar?: string; // PlantPal avatar for agent messages
}

export function PlantPalAgent({ isOpen, onClose }: PlantPalAgentProps) {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: 'Hi there! 🌱 I\'m your PlantPal.', sender: 'agent', avatar: '🌿' },
    { id: '2', text: 'I can help you identify plants, diagnose issues, and give care tips. What do you need help with?', sender: 'agent', avatar: '🌿' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    const userQuestion = input.trim();
    const newMessage: Message = {
      id: Date.now().toString(),
      text: userQuestion,
      sender: 'user'
    };
    
    setMessages(prev => [...prev, newMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);
    
    try {
      // Build conversation history for context
      const conversationHistory: ChatMessage[] = messages
        .filter(msg => msg.sender === 'agent' || msg.sender === 'user')
        .slice(-4) // Last 4 messages for context
        .map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }]
        }));
      
      const response = await chatWithPlantPal(userQuestion, conversationHistory);
      
      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.response_text,
        sender: 'agent',
        avatar: response.plant_avatar || '🌿'
      };
      
      setMessages(prev => [...prev, agentMessage]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get response from PlantPal';
      setError(errorMessage);
      
      const errorAgentMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `Sorry, I'm having trouble right now. ${errorMessage}. Please try again!`,
        sender: 'agent',
        avatar: '🌿'
      };
      
      setMessages(prev => [...prev, errorAgentMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-end md:items-center justify-end animate-in fade-in duration-200">
      <div className="w-full md:w-96 h-[80vh] md:h-[600px] md:mr-4 md:mb-4 animate-in slide-in-from-right duration-300">
        <PixelCard className="h-full flex flex-col bg-[var(--eggshell)]">
          {/* Agent Header */}
          <div className="border-b-2 border-[var(--bark)] p-4 bg-[var(--wheat)] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[var(--sprout)] pixel-border-light flex items-center justify-center overflow-hidden">
                <img 
                  src={plantPalImage} 
                  alt="PlantPal" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h3 className="text-[12px] text-[var(--soil)] uppercase">PlantPal</h3>
                <p className="text-[8px] text-[var(--khaki)]">YOUR PLANT GUIDE</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="text-[var(--soil)] hover:text-[var(--clay)] transition-colors"
            >
              <X className="w-5 h-5" strokeWidth={3} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-2 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.sender === 'agent' && (
                  <div className="w-12 h-12 bg-[var(--sprout)] pixel-border-light flex items-center justify-center flex-shrink-0 overflow-hidden">
                    <img 
                      src={plantPalImage} 
                      alt="PlantPal" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
                <div
                  className={`max-w-[80%] px-3 py-2 pixel-border text-[10px] ${
                    message.sender === 'user'
                      ? 'bg-[var(--leaf)] text-white'
                      : 'bg-[var(--sand-2)] text-[var(--soil)]'
                  }`}
                >
                  {message.text}
                </div>
                {message.sender === 'user' && (
                  <div className="w-12 h-12 flex-shrink-0">{/* Spacer for alignment */}</div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start gap-2 justify-start">
                <div className="w-12 h-12 bg-[var(--sprout)] pixel-border-light flex items-center justify-center flex-shrink-0 overflow-hidden">
                  <img 
                    src={plantPalImage} 
                    alt="PlantPal" 
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="bg-[var(--sand-2)] pixel-border px-3 py-2 flex items-center gap-2">
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-2 h-2 bg-[var(--sprout)] pixel-border animate-bounce"
                        style={{
                          animationDelay: `${i * 0.15}s`,
                          animationDuration: '0.6s'
                        }}
                      />
                    ))}
                  </div>
                  <p className="text-[9px] text-[var(--khaki)] uppercase">Thinking...</p>
                </div>
              </div>
            )}
            {error && !isLoading && (
              <div className="p-3 bg-[var(--sand)] border-2 border-[var(--bark)]">
                <p className="text-[9px] text-[var(--soil)] uppercase mb-1">Error</p>
                <p className="text-[9px] text-[var(--khaki)]">{error}</p>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t-2 border-[var(--bark)] p-4 bg-[var(--wheat)] flex gap-2">
            <PixelInput
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Ask me anything..."
              className="flex-1 text-[10px]"
            />
            <PixelButton 
              onClick={sendMessage} 
              variant="primary" 
              size="sm"
              disabled={isLoading}
            >
              <Send className="w-4 h-4" strokeWidth={2.5} />
            </PixelButton>
          </div>
        </PixelCard>
      </div>
    </div>
  );
}
