'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Message {
  text: string;
  isBot: boolean;
  action?: {
    type: 'navigate' | 'search';
    route?: string;
    filters?: any;
  };
}

export default function UniversalChatBot() {
  const router = useRouter();
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
      const greeting = "Hey! I'm your universal assistant! 🌟\n\nI can help you with:\n\n📚 Find tutors for any subject\n🎓 Post a request for help\n🚀 Find teammates for projects\n💡 Become a tutor yourself\n\nJust tell me what you need!";
      setMessages([{ text: greeting, isBot: true }]);
    }
  }, [isOpen]);

  const analyzeIntent = (msg: string): { intent: string; data: any } => {
    const lower = msg.toLowerCase();
    
    // Department detection
    const deptMap: { [key: string]: string } = {
      'cse': 'CSE', 'computer science': 'CSE',
      'it': 'IT', 'information technology': 'IT',
      'ece': 'ECE', 'electronics': 'ECE',
      'eee': 'EEE', 'electrical': 'EEE',
      'mechanical': 'Mechanical', 'mech': 'Mechanical'
    };
    
    let department = '';
    for (const [key, value] of Object.entries(deptMap)) {
      if (lower.includes(key)) {
        department = value;
        break;
      }
    }

    // Subject/skill detection
    const subjectPatterns = [
      { names: ['data structures', 'dsa', 'ds', 'data structure'], canonical: 'Data Structures' },
      { names: ['algorithms', 'algo', 'algorithm'], canonical: 'Algorithms' },
      { names: ['python', 'py'], canonical: 'Python' },
      { names: ['java'], canonical: 'Java' },
      { names: ['c++', 'cpp', 'c plus'], canonical: 'C++' },
      { names: ['javascript', 'js'], canonical: 'JavaScript' },
      { names: ['react', 'reactjs', 'react.js'], canonical: 'React' },
      { names: ['web dev', 'web development', 'web'], canonical: 'Web Development' },
      { names: ['machine learning', 'ml'], canonical: 'Machine Learning' },
      { names: ['artificial intelligence', 'ai'], canonical: 'AI' },
      { names: ['database', 'dbms', 'sql', 'databases'], canonical: 'Database' },
      { names: ['operating system', 'os'], canonical: 'Operating Systems' },
      { names: ['computer networks', 'networks', 'cn', 'networking'], canonical: 'Computer Networks' },
      { names: ['embedded systems', 'embedded'], canonical: 'Embedded Systems' },
      { names: ['ui', 'ux', 'design', 'ui/ux'], canonical: 'UI/UX Design' },
      { names: ['frontend', 'front end', 'front-end'], canonical: 'Frontend Development' },
      { names: ['backend', 'back end', 'back-end'], canonical: 'Backend Development' },
      { names: ['fullstack', 'full stack', 'full-stack'], canonical: 'Full Stack Development' },
      { names: ['digital electronics', 'digital', 'electronics'], canonical: 'Digital Electronics' },
      { names: ['statistics', 'stats'], canonical: 'Statistics' },
      { names: ['fluid mechanics', 'fluids'], canonical: 'Fluid Mechanics' },
      { names: ['thermodynamics', 'thermo'], canonical: 'Thermodynamics' }
    ];
    
    const foundSubject = subjectPatterns.find(p => 
      p.names.some(name => lower.includes(name))
    );

    // Intent detection
    if (lower.includes('need help') || lower.includes('looking for help') || lower.includes('struggling with') || lower.includes('post a request') || lower.includes('student request')) {
      return {
        intent: 'student_request',
        data: { subject: foundSubject?.canonical, department }
      };
    }

    if (lower.includes('want to teach') || lower.includes('become a tutor') || lower.includes('help others') || lower.includes('i can teach')) {
      return {
        intent: 'become_tutor',
        data: { subject: foundSubject?.canonical, department }
      };
    }

    if (lower.includes('teammate') || lower.includes('team') || lower.includes('project partner') || lower.includes('hackathon') || lower.includes('collaborat')) {
      return {
        intent: 'find_teammate',
        data: { skill: foundSubject?.canonical, department }
      };
    }

    if (lower.includes('find tutor') || lower.includes('get tutor') || lower.includes('tutor for') || foundSubject) {
      return {
        intent: 'find_tutor',
        data: { subject: foundSubject?.canonical, department }
      };
    }

    return { intent: 'unknown', data: {} };
  };

  const handleIntent = (intent: string, data: any) => {
    switch (intent) {
      case 'find_tutor':
        setTimeout(() => {
          const params = new URLSearchParams();
          if (data.subject) params.append('subject', data.subject);
          if (data.department) params.append('department', data.department);
          router.push(`/tutors?mode=find&${params.toString()}`);
        }, 1500);
        break;

      case 'student_request':
        setTimeout(() => {
          const params = new URLSearchParams();
          if (data.subject) params.append('subject', data.subject);
          if (data.department) params.append('department', data.department);
          router.push(`/tutors?mode=student&${params.toString()}`);
        }, 1500);
        break;

      case 'become_tutor':
        setTimeout(() => {
          router.push('/tutors?mode=tutor');
        }, 1500);
        break;

      case 'find_teammate':
        setTimeout(() => {
          const params = new URLSearchParams();
          if (data.skill) params.append('skill', data.skill);
          if (data.department) params.append('department', data.department);
          router.push(`/teammates?${params.toString()}`);
        }, 1500);
        break;
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { text: userMessage, isBot: false }]);
    setInput('');

    // Show typing indicator
    setMessages(prev => [...prev, { text: '...', isBot: true }]);

    try {
      // Call AI API for intelligent response
      const aiResponse = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage })
      });

      const data = await aiResponse.json();
      
      // Remove typing indicator
      setMessages(prev => prev.slice(0, -1));

      if (data.error) {
        // Fallback to pattern-based response
        const { intent, data: intentData } = analyzeIntent(userMessage);
        const response = handleIntent(intent, intentData);
        setMessages(prev => [...prev, { text: response, isBot: true }]);
      } else {
        // Use AI response
        setMessages(prev => [...prev, { text: data.response, isBot: true }]);
        
        // Still analyze intent for routing
        const { intent, data: intentData } = analyzeIntent(userMessage);
        if (intent !== 'unknown') {
          handleIntent(intent, intentData);
        }
      }
    } catch (error) {
      console.error('AI request failed:', error);
      
      // Remove typing indicator
      setMessages(prev => prev.slice(0, -1));
      
      // Fallback to pattern-based response
      const { intent, data: intentData } = analyzeIntent(userMessage);
      const response = handleIntent(intent, intentData);
      setMessages(prev => [...prev, { text: response, isBot: true }]);
    }
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
          className="fixed bottom-6 right-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-all duration-300 z-50 group"
          title="Chat with AI Assistant"
        >
          <div className="relative">
            <MessageCircle className="w-6 h-6" />
            <Sparkles className="w-3 h-3 absolute -top-1 -right-1 animate-pulse text-yellow-300" />
          </div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[400px] h-[600px] bg-white rounded-3xl shadow-2xl flex flex-col z-50 border-2 border-purple-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 via-purple-500 to-blue-600 text-white p-5 rounded-t-3xl flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="relative">
                <MessageCircle className="w-6 h-6" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></span>
              </div>
              <div>
                <h3 className="font-bold text-lg">Universal AI Assistant</h3>
                <p className="text-xs opacity-90 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  Ready to help!
                </p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-2 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-purple-50 to-white">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
                <div
                  className={`max-w-[85%] p-4 rounded-2xl whitespace-pre-line text-sm leading-relaxed ${
                    msg.isBot
                      ? 'bg-white text-gray-800 shadow-lg border-2 border-purple-100 rounded-tl-sm'
                      : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg rounded-tr-sm'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {/* Quick action suggestions */}
            {messages.length === 1 && (
              <div className="space-y-3 pt-2">
                <p className="text-xs font-semibold text-gray-600 text-center">💡 Quick actions:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <button onClick={() => handleQuickAction('Find me a Python tutor')} className="text-xs bg-white border-2 border-purple-200 text-purple-700 px-4 py-2 rounded-full hover:bg-purple-50 hover:border-purple-300 transition-all font-medium">
                    🐍 Find Python Tutor
                  </button>
                  <button onClick={() => handleQuickAction('I need help with Data Structures')} className="text-xs bg-white border-2 border-blue-200 text-blue-700 px-4 py-2 rounded-full hover:bg-blue-50 hover:border-blue-300 transition-all font-medium">
                    📚 Post Help Request
                  </button>
                  <button onClick={() => handleQuickAction('Find teammates for hackathon')} className="text-xs bg-white border-2 border-green-200 text-green-700 px-4 py-2 rounded-full hover:bg-green-50 hover:border-green-300 transition-all font-medium">
                    🚀 Find Teammates
                  </button>
                  <button onClick={() => handleQuickAction('I want to become a tutor')} className="text-xs bg-white border-2 border-orange-200 text-orange-700 px-4 py-2 rounded-full hover:bg-orange-50 hover:border-orange-300 transition-all font-medium">
                    🎓 Become Tutor
                  </button>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t-2 border-purple-100 bg-white rounded-b-3xl">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type your message..."
                className="flex-1 px-4 py-3 border-2 border-purple-200 rounded-2xl focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 text-gray-800 text-sm transition-all"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-3 rounded-2xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
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
