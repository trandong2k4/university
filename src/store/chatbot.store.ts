import { createContext, useContext } from 'react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface ChatbotStore {
  messages: ChatMessage[];
  isOpen: boolean;
  isLoading: boolean;
  sendMessage: (content: string) => Promise<void>;
  toggleOpen: () => void;
  clearHistory: () => void;
}

export const ChatbotContext = createContext<ChatbotStore | undefined>(undefined);

export const useChatbotStore = (): ChatbotStore => {
  const context = useContext(ChatbotContext);
  if (!context) throw new Error('useChatbotStore must be used within ChatbotProvider');
  return context;
};
