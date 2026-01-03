'use client';

import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { MessageCircle, Users, Hash, ArrowLeft } from 'lucide-react';
import { subscribeToDmRooms, subscribeToPublicRooms, seedPublicRooms, ChatRoom } from '@/lib/chat';

export default function ChatsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [dmRooms, setDmRooms] = useState<ChatRoom[]>([]);
  const [publicRooms, setPublicRooms] = useState<ChatRoom[]>([]);
  const [seeded, setSeeded] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  // Seed public rooms on first load
  useEffect(() => {
    if (user && !seeded) {
      seedPublicRooms().then(() => setSeeded(true));
    }
  }, [user, seeded]);

  // Subscribe to DM rooms
  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToDmRooms(user.uid, (rooms) => {
      setDmRooms(rooms);
    });

    return () => unsubscribe();
  }, [user]);

  // Subscribe to public rooms
  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToPublicRooms((rooms) => {
      setPublicRooms(rooms);
    });

    return () => unsubscribe();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-2xl font-semibold text-gray-700">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  const getOtherUserName = (room: ChatRoom) => {
    const memberNames = (room as any).memberNames || {};
    const otherUid = room.members.find(uid => uid !== user.uid);
    return otherUid ? memberNames[otherUid] || 'Unknown User' : 'Unknown User';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
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
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-lg">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Messages
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Direct Messages */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <Users className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-800">Direct Messages</h2>
            </div>
            
            {dmRooms.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No direct messages yet. Connect with tutors or teammates to start chatting!
              </p>
            ) : (
              <div className="space-y-2">
                {dmRooms.map((room) => (
                  <button
                    key={room.id}
                    onClick={() => router.push(`/chats/${room.id}`)}
                    className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                      {getOtherUserName(room).charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{getOtherUserName(room)}</h3>
                      <p className="text-sm text-gray-500">Click to open chat</p>
                    </div>
                    <MessageCircle className="w-5 h-5 text-gray-400" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Public Rooms */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <Hash className="w-6 h-6 text-purple-600" />
              <h2 className="text-xl font-bold text-gray-800">Public Rooms</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              {publicRooms.map((room) => (
                <button
                  key={room.id}
                  onClick={() => router.push(`/chats/${room.id}`)}
                  className="p-4 rounded-xl border-2 border-gray-200 hover:border-purple-500 hover:bg-purple-50 transition-all text-left"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Hash className="w-5 h-5 text-purple-600" />
                    <h3 className="font-bold text-gray-800">{room.title}</h3>
                  </div>
                  <p className="text-sm text-gray-600">{(room as any).description || 'Join the conversation'}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
