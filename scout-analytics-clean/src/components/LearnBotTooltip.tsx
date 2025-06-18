import React, { useState, useEffect, useRef } from 'react';
import { 
  HelpCircle, 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  BookOpen, 
  TrendingUp,
  BarChart3,
  Users,
  MapPin
} from 'lucide-react';

interface LearnBotTooltipProps {
  trigger?: React.ReactNode;
  context?: string;
  userAction?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  context?: string;
}

const LearnBotTooltip: React.FC<LearnBotTooltipProps> = ({
  trigger,
  context = 'dashboard',
  userAction = 'viewing',
  position = 'bottom',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentMode, setCurrentMode] = useState<'help' | 'chat'>('help');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Quick help suggestions based on context
  const getContextualHelp = (context: string) => {
    const helpMap: Record<string, Array<{ icon: React.ReactNode; title: string; description: string; action: string }>> = {
      'dashboard': [
        {
          icon: <BarChart3 className="h-4 w-4" />,
          title: 'Understanding KPI Cards',
          description: 'Learn how to read revenue, transactions, and growth metrics',
          action: 'explain-kpis'
        },
        {
          icon: <TrendingUp className="h-4 w-4" />,
          title: 'Growth Indicators',
          description: 'Interpret percentage changes and trend arrows',
          action: 'explain-trends'
        },
        {
          icon: <MapPin className="h-4 w-4" />,
          title: 'Regional Analysis',
          description: 'Compare performance across Philippine regions',
          action: 'explain-regions'
        },
        {
          icon: <Users className="h-4 w-4" />,
          title: 'Customer Insights',
          description: 'Understand customer behavior and segmentation',
          action: 'explain-customers'
        }
      ],
      'transaction-analysis': [
        {
          icon: <BarChart3 className="h-4 w-4" />,
          title: 'Transaction Patterns',
          description: 'Identify peak hours and seasonal trends',
          action: 'explain-patterns'
        },
        {
          icon: <TrendingUp className="h-4 w-4" />,
          title: 'Anomaly Detection',
          description: 'Spot unusual spikes or drops in data',
          action: 'explain-anomalies'
        }
      ]
    };

    return helpMap[context] || helpMap['dashboard'];
  };

  // Initialize with contextual greeting
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const greeting = {
        id: `msg-${Date.now()}`,
        type: 'assistant' as const,
        content: `Hi! I'm LearnBot 🤖. I can help you understand your Scout Analytics dashboard. What would you like to learn about?`,
        timestamp: new Date(),
        context
      };
      setMessages([greeting]);
    }
  }, [isOpen, context, messages.length]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleQuickHelp = async (action: string) => {
    setIsLoading(true);
    setCurrentMode('chat');

    // Add user message
    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      type: 'user',
      content: `Help me with: ${action.replace('-', ' ')}`,
      timestamp: new Date(),
      context
    };

    setMessages(prev => [...prev, userMessage]);

    // Simulate AI response (in production, this would call the AI API)
    setTimeout(() => {
      const responses: Record<string, string> = {
        'explain-kpis': `📊 **KPI Cards Explained:**

**Total Revenue** - Your gross sales in Philippine Pesos. The green trend shows growth vs previous period.

**Transactions** - Number of individual purchases. Higher numbers indicate more customer activity.

**Unique Customers** - Distinct buyers in your timeframe. This shows market reach.

**Average Order Value** - Revenue ÷ Transactions. Higher AOV means customers buy more per visit.

💡 *Tip: Focus on trends rather than absolute numbers. A 15% revenue growth with 8% transaction growth means customers are buying more expensive items!*`,

        'explain-trends': `📈 **Growth Indicators Guide:**

**Green arrows (↗)** = Positive growth compared to previous period
**Red arrows (↙)** = Negative growth (needs attention)
**Percentage numbers** = Exact growth rate

**What to watch:**
- Revenue growth > 10% = Excellent
- Revenue growth 5-10% = Good
- Revenue growth 0-5% = Stable
- Negative growth = Investigate immediately

💡 *Pro tip: Compare different metrics. If revenue grows but transactions drop, you're selling higher-value items.*`,

        'explain-regions': `🗺️ **Regional Performance Analysis:**

**Metro Manila** - Usually your highest revenue region (urban market)
**Central Luzon** - Agricultural region, different buying patterns  
**Southern Luzon** - Mixed urban/rural demographics
**Visayas** - Island market with unique logistics considerations

**Key insights:**
- Compare regions fairly (Metro Manila has more population)
- Look for unexpected growth in smaller regions
- Consider seasonal factors (harvest seasons, holidays)

💡 *Tip: High growth in smaller regions often indicates successful expansion or local marketing campaigns.*`,

        'explain-customers': `👥 **Customer Insights Deep Dive:**

**Unique Customers** - How many different people bought from you
**Repeat Rate** - Percentage who bought multiple times
**Customer Lifetime Value** - Total revenue per customer

**Segmentation insights:**
- **New Customers** - First-time buyers (acquisition)
- **Returning Customers** - Repeat buyers (retention)
- **VIP Customers** - High-value regular buyers

💡 *Focus on retention: Getting existing customers to buy again is 5x cheaper than acquiring new ones!*`
      };

      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now()}-assistant`,
        type: 'assistant',
        content: responses[action] || `I'd be happy to help you understand ${action.replace('-', ' ')}. This feature provides insights into your Scout Analytics data. Would you like me to explain anything specific about it?`,
        timestamp: new Date(),
        context
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    setIsLoading(true);
    
    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
      context
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    // Simulate AI response (in production, this would call the LearnBot API)
    setTimeout(() => {
      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now()}-assistant`,
        type: 'assistant',
        content: `I understand you're asking about "${userMessage.content}". Based on your Scout Analytics data, here's what I can tell you:\n\nThis is a simulated response. In the full implementation, I would analyze your specific data and provide personalized insights using the LearnBot RAG system.\n\n💡 Would you like me to explain any specific metric or feature you're seeing on the dashboard?`,
        timestamp: new Date(),
        context
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 2000);
  };

  const defaultTrigger = (
    <button className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors">
      <HelpCircle className="h-4 w-4" />
    </button>
  );

  return (
    <div className={`relative ${className}`}>
      {/* Trigger */}
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger || defaultTrigger}
      </div>

      {/* Tooltip/Chat Panel */}
      {isOpen && (
        <div className={`absolute z-50 w-96 bg-white rounded-xl shadow-2xl border border-slate-200 ${
          position === 'bottom' ? 'top-full mt-2' : 
          position === 'top' ? 'bottom-full mb-2' :
          position === 'left' ? 'right-full mr-2' :
          'left-full ml-2'
        }`}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">LearnBot</h3>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs text-slate-500">AI Assistant</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Mode Toggle */}
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => setCurrentMode('help')}
              className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                currentMode === 'help'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <BookOpen className="h-4 w-4 inline mr-1" />
              Quick Help
            </button>
            <button
              onClick={() => setCurrentMode('chat')}
              className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                currentMode === 'chat'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Sparkles className="h-4 w-4 inline mr-1" />
              AI Chat
            </button>
          </div>

          {/* Content */}
          <div className="h-80 overflow-hidden">
            {currentMode === 'help' ? (
              /* Quick Help Mode */
              <div className="p-4 space-y-3 h-full overflow-y-auto">
                <p className="text-sm text-slate-600 mb-4">
                  Quick help for: <span className="font-medium text-slate-900">{context}</span>
                </p>
                {getContextualHelp(context).map((help, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickHelp(help.action)}
                    className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all group"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 group-hover:bg-blue-200">
                        {help.icon}
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-900 text-sm">{help.title}</h4>
                        <p className="text-xs text-slate-600 mt-1">{help.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              /* Chat Mode */
              <div className="h-full flex flex-col">
                {/* Messages */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg px-3 py-2 ${
                          message.type === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 text-slate-900'
                        }`}
                      >
                        <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                        <div className={`text-xs mt-1 ${
                          message.type === 'user' ? 'text-blue-100' : 'text-slate-500'
                        }`}>
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-slate-100 rounded-lg px-3 py-2">
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-slate-200">
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Ask me anything about your analytics..."
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={isLoading}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!inputValue.trim() || isLoading}
                      className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LearnBotTooltip;