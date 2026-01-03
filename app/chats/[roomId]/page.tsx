'use client';

import { useAuth } from '@/lib/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { ArrowLeft, Send } from 'lucide-react';
import { subscribeToMessages, sendMessage, ChatMessage, getRoomById, ChatRoom } from '@/lib/chat';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function ChatRoomPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const roomId = params?.roomId as string;
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [room, setRoom] = useState<ChatRoom | null>(null);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  // Load room details
  useEffect(() => {
    if (!roomId) return;
    
    const loadRoom = async () => {
      const roomDoc = await getDoc(doc(db, 'chat_rooms', roomId));
      if (roomDoc.exists()) {
        setRoom({ id: roomDoc.id, ...roomDoc.data() } as ChatRoom);
      }
    };
    
    loadRoom();
  }, [roomId]);

  // Subscribe to messages
  useEffect(() => {
    if (!roomId) return;

    const unsubscribe = subscribeToMessages(roomId, (msgs) => {
      setMessages(msgs);
      setTimeout(() => scrollToBottom(), 100);
    });

    return () => unsubscribe();
  }, [roomId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!inputMessage.trim() || !user || sending) return;

    setSending(true);
    try {
      await sendMessage(roomId, inputMessage, user.uid, user.displayName || 'Anonymous');
      setInputMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-2xl font-semibold text-gray-700">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  const getRoomTitle = () => {
    if (!room) return 'Chat';
    if (room.type === 'public') return `# ${room.title}`;
    
    // DM room - show other user's name
    const memberNames = (room as any).memberNames || {};
    const otherUid = room.members.find(uid => uid !== user.uid);
    return otherUid ? memberNames[otherUid] || 'Direct Message' : 'Direct Message';
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/chats')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            <h1 className="text-xl font-bold text-gray-800">{getRoomTitle()}</h1>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="container mx-auto max-w-4xl space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              No messages yet. Start the conversation!
            </div>
          ) : (
            messages.map((msg) => {
              const isOwn = msg.senderUid === user.uid;
              return (
                <div
                  key={msg.id}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[70%] ${isOwn ? 'order-2' : 'order-1'}`}>
                    {!isOwn && (
                      <div className="text-xs font-semibold text-gray-600 mb-1 px-3">
                        {msg.senderName}
                      </div>
                    )}
                    <div
                      className={`rounded-2xl px-4 py-2 ${
                        isOwn
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-tr-sm'
                          : 'bg-white border-2 border-gray-200 text-gray-800 rounded-tl-sm'
                      }`}
                    >
                      <p className="break-words">{msg.text}</p>
                      <div
                        className={`text-xs mt-1 ${
                          isOwn ? 'text-blue-100' : 'text-gray-500'
                        }`}
                      >
                        {formatTime(msg.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="bg-white border-t-2 border-gray-200 p-4">
        <div className="container mx-auto max-w-4xl">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none text-gray-800"
              disabled={sending}
            />
            <button
              onClick={handleSend}
              disabled={!inputMessage.trim() || sending}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
