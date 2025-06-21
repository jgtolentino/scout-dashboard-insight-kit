import { useState } from 'react';
import { API_BASE_URL } from '@/config/api';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const useAIChat = () => {
  const [isLoading, setIsLoading] = useState(false);

  const generateResponse = async (prompt: string, chatHistory: Message[] = []): Promise<string> => {
    setIsLoading(true);
    
    try {
      // Format chat history for the API
      const formattedHistory = chatHistory
        .filter(msg => msg.id !== '1') // Skip the initial greeting
        .map(msg => ({
          role: msg.role,
          content: msg.content
        }));
      
      // Call the API
      const response = await fetch(`${API_BASE_URL}/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: prompt,
          history: formattedHistory
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate AI response');
      }
      
      const data = await response.json();
      
      // If the API returns a structured response
      if (data.response) {
        return data.response;
      }
      
      // If the API returns just the text
      if (typeof data === 'string') {
        return data;
      }
      
      // Fallback for other response formats
      return JSON.stringify(data);
      
    } catch (error) {
      console.error('Error in AI chat:', error);
      return "I'm sorry, I encountered an error processing your request. Please try again later.";
    } finally {
      setIsLoading(false);
    }
  };

  return {
    generateResponse,
    isLoading
  };
};