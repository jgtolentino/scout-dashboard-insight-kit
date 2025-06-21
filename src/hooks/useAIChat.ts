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
      
      // In mock mode, simulate AI response
      if (import.meta.env.VITE_USE_MOCKS === 'true') {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
        
        const mockResponses = [
          "Based on your transaction data, I've identified several optimization opportunities. Peak sales occur between 6-8 PM, representing 23% of daily volume. Consider adjusting staffing and inventory during these hours.",
          "Your beverage category shows strong performance in Metro Manila with 15% higher conversion rates compared to other regions. This presents an excellent opportunity for targeted marketing campaigns.",
          "Analysis reveals that customers aged 26-35 have the highest average order value at ₱189, but represent only 31% of transactions. This segment has significant upselling potential.",
          "I've detected a pattern in your substitution data. When Coca-Cola products are out of stock, 83% of customers accept Pepsi as a substitute. However, the reverse is only true 62% of the time, indicating stronger brand loyalty for Coca-Cola.",
          "Weekend transactions are 18% higher than weekdays, but average order value is 12% lower. This suggests different shopping behaviors that could be optimized with targeted promotions."
        ];
        
        return mockResponses[Math.floor(Math.random() * mockResponses.length)];
      }
      
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