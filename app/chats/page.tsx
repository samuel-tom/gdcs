'use client';

import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Hash, ArrowLeft } from 'lucide-react';
import { subscribeToPublicRooms, seedPublicRooms, cleanupDuplicateRooms, ChatRoom } from '@/lib/chat';

export default function ChatsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [publicRooms, setPublicRooms] = useState<ChatRoom[]>([]);
  const [seeded, setSeeded] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  // Seed public rooms and cleanup duplicates on first load
  useEffect(() => {
    if (user && !seeded) {
      const initRooms = async () => {
        await cleanupDuplicateRooms();
        await seedPublicRooms();
        setSeeded(true);
      };
      initRooms();
    }
  }, [user, seeded]);

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
              <Hash className="w-8 h-8 text-green-600" />
              <h1 className="text-2xl font-bold text-gray-800">Community Chat</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Public Rooms */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <Hash className="w-6 h-6 text-purple-600" />
              <h2 className="text-xl font-bold text-gray-800">Public Discussion Rooms</h2>
            </div>
            
            {publicRooms.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Loading rooms...
              </p>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {publicRooms.map((room) => (
                  <button
                    key={room.id}
                    onClick={() => router.push(`/chats/${room.id}`)}
                    className="p-6 rounded-xl border-2 border-gray-200 hover:border-purple-500 hover:bg-purple-50 transition-all text-left group"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <Hash className="w-6 h-6 text-purple-600 group-hover:scale-110 transition-transform" />
                      <h3 className="font-bold text-lg text-gray-800">{room.title}</h3>
                    </div>
                    <p className="text-sm text-gray-600">{(room as any).description || 'Join the conversation'}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
