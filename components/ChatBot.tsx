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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const greeting = type === 'tutor' 
        ? "Hi! I'm your tutor matching assistant. Tell me what subject you need help with, or ask me something like:\n\n• 'I need help with Data Structures'\n• 'Find CSE tutors'\n• 'Who can teach Python?'"
        : "Hi! I'm your teammate finder assistant. Tell me what skills you're looking for, or ask:\n\n• 'Looking for React developers'\n• 'Find CSE students'\n• 'Need someone with UI/UX skills'";
      
      setMessages([{ text: greeting, isBot: true }]);
    }
  }, [isOpen, type]);

  const analyzeMessage = (msg: string): { query?: string; department?: string; subject?: string } => {
    const lower = msg.toLowerCase();
    const filters: any = {};

    // Extract department
    const depts = ['cse', 'it', 'ece', 'eee', 'mechanical'];
    const foundDept = depts.find(d => lower.includes(d));
    if (foundDept) {
      filters.department = foundDept.toUpperCase();
    }

    // Extract subject/skill keywords
    const subjects = [
      'data structures', 'algorithms', 'python', 'java', 'c++', 'javascript',
      'react', 'web development', 'machine learning', 'database', 'sql',
      'operating systems', 'networks', 'embedded', 'ai', 'ml', 'statistics',
      'ui', 'ux', 'design', 'frontend', 'backend', 'fullstack'
    ];
    
    const foundSubject = subjects.find(s => lower.includes(s));
    if (foundSubject) {
      filters.subject = foundSubject;
      filters.query = foundSubject;
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
    onSearch(filters);

    // Bot response
    setTimeout(() => {
      let response = '';
      
      if (filters.subject && filters.department) {
        response = `Great! I'm searching for ${type === 'tutor' ? 'tutors' : 'teammates'} in ${filters.department} who know ${filters.subject}. Check the results below! 👇`;
      } else if (filters.subject) {
        response = `Looking for ${filters.subject} ${type === 'tutor' ? 'tutors' : 'experts'} for you! See the results below. 📚`;
      } else if (filters.department) {
        response = `Showing ${filters.department} ${type === 'tutor' ? 'tutors' : 'students'}! Scroll down to see matches. 🎯`;
      } else {
        response = `I've updated the search with "${userMessage}". Check the filtered results below!`;
      }

      setMessages(prev => [...prev, { text: response, isBot: true }]);
    }, 500);
  };

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform z-50"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-t-2xl flex justify-between items-center">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              <h3 className="font-bold">AI Assistant</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
                <div
                  className={`max-w-[80%] p-3 rounded-2xl whitespace-pre-line ${
                    msg.isBot
                      ? 'bg-gray-100 text-gray-800'
                      : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask me anything..."
                className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none text-gray-800"
              />
              <button
                onClick={handleSend}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-2 rounded-lg hover:opacity-90 transition-opacity"
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
