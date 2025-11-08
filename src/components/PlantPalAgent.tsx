import { useState, useEffect } from 'react';
import { X, Send } from 'lucide-react';
import { PixelButton } from './PixelButton';
import { PixelInput } from './PixelInput';
import { PixelCard } from './PixelCard';

interface PlantPalAgentProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'agent';
}

export function PlantPalAgent({ isOpen, onClose }: PlantPalAgentProps) {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: 'Hi there! 🌱 I\'m your PlantPal.', sender: 'agent' },
    { id: '2', text: 'I can help you identify plants, diagnose issues, and give care tips. What do you need help with?', sender: 'agent' }
  ]);
  const [input, setInput] = useState('');

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const sendMessage = () => {
    if (!input.trim()) return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user'
    };
    
    setMessages([...messages, newMessage]);
    setInput('');
    
    // Simulate agent response
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: 'I\'m here to help! This feature will use AI to answer your plant care questions.',
        sender: 'agent'
      }]);
    }, 500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-end md:items-center justify-end animate-in fade-in duration-200">
      <div className="w-full md:w-96 h-[80vh] md:h-[600px] md:mr-4 md:mb-4 animate-in slide-in-from-right duration-300">
        <PixelCard className="h-full flex flex-col bg-[var(--eggshell)]">
          {/* Agent Header */}
          <div className="border-b-2 border-[var(--bark)] p-4 bg-[var(--wheat)] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[var(--sprout)] pixel-border-light flex items-center justify-center">
                <span className="text-[20px]">🌿</span>
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
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] px-3 py-2 pixel-border text-[10px] ${
                    message.sender === 'user'
                      ? 'bg-[var(--leaf)] text-white'
                      : 'bg-[var(--sand-2)] text-[var(--soil)]'
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
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
            <PixelButton onClick={sendMessage} variant="primary" size="sm">
              <Send className="w-4 h-4" strokeWidth={2.5} />
            </PixelButton>
          </div>
        </PixelCard>
      </div>
    </div>
  );
}
