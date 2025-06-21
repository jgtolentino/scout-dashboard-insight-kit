import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Brain, Send, Loader2 } from 'lucide-react';
import { useAIChat } from '@/hooks/useAIChat';
import ReactMarkdown from 'react-markdown';

interface AIDataAnalyzerProps {
  title?: string;
  description?: string;
  initialPrompt?: string;
}

export function AIDataAnalyzer({
  title = "Data Analyzer",
  description = "Ask specific questions about your data",
  initialPrompt = "Analyze the current dataset and provide insights"
}: AIDataAnalyzerProps) {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState('');
  const { generateResponse, isLoading } = useAIChat();
  
  const handleAnalyze = async () => {
    if (!query.trim() && !initialPrompt) return;
    
    try {
      const response = await generateResponse(query || initialPrompt);
      setResult(response);
    } catch (error) {
      console.error('Error analyzing data:', error);
      setResult('Error analyzing data. Please try again.');
    }
  };
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          <span>{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4">
        <Textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Enter your query or use the default: "${initialPrompt}"`}
          className="flex-1 min-h-[100px]"
        />
        
        <Button 
          onClick={handleAnalyze} 
          disabled={isLoading}
          className="self-end"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Analyze
            </>
          )}
        </Button>
        
        {result && (
          <div className="mt-4">
            <h4 className="font-medium mb-2">Analysis Results:</h4>
            <ScrollArea className="h-[200px] border rounded-md p-4 bg-muted/20">
              <div className="prose prose-sm dark:prose-invert">
                <ReactMarkdown>{result}</ReactMarkdown>
              </div>
            </ScrollArea>
          </div>
        )}
        
        {!result && !isLoading && (
          <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
            <p>{description}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}