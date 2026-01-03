'use client';

import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, Send, Sparkles, Loader2, ArrowRight } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  action?: {
    type: 'navigate';
    url: string;
  };
}

export default function AssistantPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([{
    role: 'assistant',
    content: "Hi! I'm your AI assistant for SASTRA's student platform. I can help you find tutors, teammates, or guide you through the community features. What can I help you with today?"
  }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: textToSend };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          context: {
            currentUser: {
              name: user?.displayName || undefined,
              department: undefined,
              year: undefined
            },
            mode: 'general'
          }
        })
      });

      const data = await response.json();

      if (data.reply) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.reply,
          action: data.action
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        
        // If there's a navigation action, redirect after a short delay
        if (data.action?.type === 'navigate' && data.action.url) {
          setTimeout(() => {
            router.push(data.action.url);
          }, 2000);
        }
      } else if (data.fallbackReply) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.fallbackReply
        }]);
      } else {
        throw new Error('No response from AI');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm having trouble right now. Try browsing the Tutor Matching or Find Teammates sections!"
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    { label: 'Find me a tutor', message: 'I need help finding a tutor for my subjects' },
    { label: 'Find teammates', message: 'I want to find teammates for a hackathon project' },
    { label: 'How do chat rooms work?', message: 'Can you explain how the community chat rooms work?' },
    { label: 'Get started', message: 'What can you help me with?' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-2xl font-semibold text-gray-700">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-2 rounded-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                AI Assistant
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 container mx-auto px-4 py-6 max-w-4xl overflow-y-auto">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-6 py-4 ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                    : 'bg-white text-gray-800 shadow-md border border-gray-100'
                }`}
              >
                <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                {message.action?.type === 'navigate' && (
                  <div className="mt-3 pt-3 border-t border-gray-200 flex items-center gap-2 text-sm text-purple-600 font-medium">
                    <ArrowRight className="w-4 h-4" />
                    <span>Redirecting you in 2 seconds...</span>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white rounded-2xl px-6 py-4 shadow-md border border-gray-100">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                  <span className="text-gray-600">Thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        {messages.length === 1 && !isLoading && (
          <div className="mt-8 bg-white rounded-2xl p-6 shadow-md border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-600 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => sendMessage(action.message)}
                  className="px-4 py-3 rounded-xl border-2 border-purple-200 hover:border-purple-500 hover:bg-purple-50 transition-all text-sm font-medium text-gray-700 text-left"
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 shadow-lg">
        <div className="container mx-auto px-4 py-4 max-w-4xl">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="flex gap-3"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              disabled={isLoading}
              className="flex-1 px-6 py-4 rounded-2xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none text-gray-800 placeholder-gray-400 disabled:bg-gray-50"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              <Send className="w-5 h-5" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
