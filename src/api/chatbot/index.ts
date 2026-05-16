import { API_ENDPOINTS } from '@/constants';
import apiClient from '@/common/axiosClient';

export interface ChatMessage {
  id?: string;
  role: 'user' | 'bot';
  content: string;
  createdAt?: string;
}

const chatbotApi = {
  sendMessage: async (message: string): Promise<string> => {
    const response = await apiClient.post<string>(API_ENDPOINTS.CHATBOT_SEND, { message });
    return response.data;
  },

  getHistory: async (): Promise<ChatMessage[]> => {
    const response = await apiClient.get<ChatMessage[]>(API_ENDPOINTS.CHATBOT_HISTORY);
    return response.data;
  },

  clearHistory: async (): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.CHATBOT_HISTORY);
  },
};

export default chatbotApi;
