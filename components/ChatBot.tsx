'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';

interface Message {
  text: string;
  isBot: boolean;
}

interface ChatBotProps {
  onSearch: (filters: {
    query?: string;
    department?: string;
    subject?: string;
  }) => void;
  type: 'tutor' | 'teammate';
}

export default function ChatBot({ onSearch, type }: ChatBotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [context, setContext] = useState<{ lastSubject?: string; lastDept?: string }>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const greeting = type === 'tutor' 
        ? "👋 Hey there! I'm here to help you find the perfect tutor.\n\nJust chat with me naturally! For example:\n• 'I'm struggling with Data Structures'\n• 'Can you recommend a Python tutor?'\n• 'I need help preparing for my OS exam'\n\nWhat subject are you looking for help with?"
        : "👋 Hi! I'll help you find awesome teammates for your project.\n\nTell me about what you're working on:\n• 'I need a React developer for my web app'\n• 'Looking for someone who knows ML'\n• 'Want to find CSE students for a hackathon'\n\nWhat kind of teammate are you looking for?";
      
      setMessages([{ text: greeting, isBot: true }]);
    }
  }, [isOpen, type]);

  const getSmartResponse = (msg: string, filters: any): string => {
    const lower = msg.toLowerCase();
    
    // Greetings
    if (/^(hi|hello|hey|hola|yo)\b/i.test(msg.trim())) {
      return type === 'tutor'
        ? "Hey! 😊 What subject do you need help with today?"
        : "Hello! 👋 What kind of project are you working on?";
    }

    // Thanks
    if (/^(thanks|thank you|thx|ty)\b/i.test(msg.trim())) {
      return "You're welcome! Feel free to ask me anything else. 😊";
    }

    // Questions about bot
    if (lower.includes('who are you') || lower.includes('what can you do')) {
      return `I'm your AI assistant! I help you find the perfect ${type === 'tutor' ? 'tutor' : 'teammate'} by understanding what you need and showing you the best matches. Just tell me what you're looking for! 🎯`;
    }

    // Struggling/difficulty mentions
    if (lower.includes('struggling') || lower.includes('difficult') || lower.includes('hard time')) {
      if (filters.subject) {
        return `I totally understand - ${filters.subject} can be challenging! 📚 I've found some great tutors below who specialize in this. They've helped many students just like you!`;
      }
    }

    // Exam preparation
    if (lower.includes('exam') || lower.includes('test') || lower.includes('quiz')) {
      return `Exam prep mode activated! 📝 I've filtered for ${filters.subject || 'experienced'} tutors who can help you ace your test. Good luck with your studies!`;
    }

    // Project mentions
    if (lower.includes('project') || lower.includes('hackathon') || lower.includes('building')) {
      return `Awesome project! 🚀 Let me find you some talented ${type === 'tutor' ? 'tutors' : 'teammates'} who can help. Check the results below!`;
    }

    // Specific responses based on what was found
    if (filters.subject && filters.department) {
      setContext({ lastSubject: filters.subject, lastDept: filters.department });
      return `Perfect! I found ${filters.department} ${type === 'tutor' ? 'tutors' : 'students'} who know ${filters.subject}. 🎯 Check them out below!\n\nNeed anything else? I can also filter by year or availability!`;
    } else if (filters.subject) {
      setContext({ lastSubject: filters.subject });
      return `Great choice! I've found ${type === 'tutor' ? 'tutors' : 'experts'} for ${filters.subject}. 📚\n\nWant me to narrow it down by department? Just let me know!`;
    } else if (filters.department) {
      setContext({ lastDept: filters.department });
      return `Showing ${filters.department} ${type === 'tutor' ? 'tutors' : 'students'} for you! 🎓\n\nTell me what specific skills or subjects you need help with!`;
    }

    // Generic helpful response
    return `Got it! I've updated the search based on what you said. 🔍\n\nSee anyone interesting? Let me know if you want me to refine the search further!`;
  };

  const analyzeMessage = (msg: string): { query?: string; department?: string; subject?: string } => {
    const lower = msg.toLowerCase();
    const filters: any = {};

    // Extract department
    const depts = ['cse', 'it', 'ece', 'eee', 'mechanical'];
    const foundDept = depts.find(d => lower.includes(d));
    if (foundDept) {
      filters.department = foundDept.toUpperCase();
    }

    // Comprehensive subject/skill matching
    const subjectPatterns = [
      { names: ['data structures', 'dsa', 'ds'], canonical: 'Data Structures' },
      { names: ['algorithms', 'algo'], canonical: 'Algorithms' },
      { names: ['python', 'py'], canonical: 'Python' },
      { names: ['java'], canonical: 'Java' },
      { names: ['c++', 'cpp', 'c plus'], canonical: 'C++' },
      { names: ['javascript', 'js'], canonical: 'JavaScript' },
      { names: ['react', 'reactjs'], canonical: 'React' },
      { names: ['web dev', 'web development'], canonical: 'Web Development' },
      { names: ['machine learning', 'ml'], canonical: 'Machine Learning' },
      { names: ['artificial intelligence', 'ai'], canonical: 'AI' },
      { names: ['database', 'dbms', 'sql'], canonical: 'Database' },
      { names: ['operating system', 'os'], canonical: 'Operating Systems' },
      { names: ['computer networks', 'networks', 'cn'], canonical: 'Networks' },
      { names: ['embedded systems', 'embedded'], canonical: 'Embedded Systems' },
      { names: ['ui', 'ux', 'design'], canonical: 'UI/UX Design' },
      { names: ['frontend', 'front end'], canonical: 'Frontend' },
      { names: ['backend', 'back end'], canonical: 'Backend' },
      { names: ['fullstack', 'full stack'], canonical: 'Full Stack' },
      { names: ['digital electronics', 'digital'], canonical: 'Digital Electronics' },
      { names: ['statistics', 'stats'], canonical: 'Statistics' }
    ];
    
    const foundPattern = subjectPatterns.find(p => 
      p.names.some(name => lower.includes(name))
    );
    
    if (foundPattern) {
      filters.subject = foundPattern.canonical;
      filters.query = foundPattern.canonical;
    } else {
      // Use the whole message as query if no specific subject found
      filters.query = msg;
    }

    return filters;
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { text: userMessage, isBot: false }]);
    setInput('');

    // Analyze the message
    const filters = analyzeMessage(userMessage);
    
    // Apply filters if they were found
    if (filters.query || filters.department || filters.subject) {
      onSearch(filters);
    }

    // Bot response with delay for natural feel
    setTimeout(() => {
      const response = getSmartResponse(userMessage, filters);
      setMessages(prev => [...prev, { text: response, isBot: true }]);
    }, 400);
  };

  const handleQuickAction = (action: string) => {
    setInput(action);
    setTimeout(() => handleSend(), 100);
  };

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform z-50 animate-pulse"
          title="Chat with AI Assistant"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[550px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-t-2xl flex justify-between items-center">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              <div>
                <h3 className="font-bold">AI Assistant</h3>
                <p className="text-xs opacity-90">Always here to help! 💬</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
                <div
                  className={`max-w-[85%] p-3 rounded-2xl whitespace-pre-line text-sm ${
                    msg.isBot
                      ? 'bg-white text-gray-800 shadow-md border border-gray-100'
                      : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            
            {/* Quick action suggestions */}
            {messages.length === 1 && (
              <div className="space-y-2 pt-2">
                <p className="text-xs text-gray-500 text-center">Quick suggestions:</p>
                <div className="flex flex-wrap gap-2">
                  {type === 'tutor' ? (
                    <>
                      <button onClick={() => handleQuickAction('I need help with Data Structures')} className="text-xs bg-purple-100 text-purple-700 px-3 py-1.5 rounded-full hover:bg-purple-200">
                        Data Structures help
                      </button>
                      <button onClick={() => handleQuickAction('Python tutor')} className="text-xs bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full hover:bg-blue-200">
                        Python tutor
                      </button>
                      <button onClick={() => handleQuickAction('CSE tutors')} className="text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-full hover:bg-green-200">
                        CSE tutors
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleQuickAction('React developer')} className="text-xs bg-purple-100 text-purple-700 px-3 py-1.5 rounded-full hover:bg-purple-200">
                        React developer
                      </button>
                      <button onClick={() => handleQuickAction('ML expert')} className="text-xs bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full hover:bg-blue-200">
                        ML expert
                      </button>
                      <button onClick={() => handleQuickAction('UI/UX designer')} className="text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-full hover:bg-green-200">
                        UI/UX designer
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 bg-white rounded-b-2xl">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask me anything..."
                className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none text-gray-800 text-sm"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-2.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
