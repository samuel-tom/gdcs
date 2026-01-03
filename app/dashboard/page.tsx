'use client';

import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { BookOpen, Users, LogOut, GraduationCap, MessageCircle } from 'lucide-react';
import UniversalChatBot from '@/components/UniversalChatBot';

export default function Dashboard() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({ tutors: 0, students: 0, teams: 0 });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  // Load stats from localStorage
  useEffect(() => {
    const tutors = JSON.parse(localStorage.getItem('tutors') || '[]');
    const teammates = JSON.parse(localStorage.getItem('teammates') || '[]');
    setStats({
      tutors: tutors.length,
      students: Math.floor(tutors.length * 4.2), // Estimate based on ratio
      teams: teammates.length
    });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-2xl font-semibold text-gray-700">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-lg">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                SASTRA Tutor Connect
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <img
                  src={user.photoURL || 'https://via.placeholder.com/40'}
                  alt={user.displayName || 'User'}
                  className="w-10 h-10 rounded-full border-2 border-blue-500"
                />
                <div className="hidden md:block">
                  <p className="font-semibold text-gray-800">{user.displayName}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Welcome, {user.displayName?.split(' ')[0]}! 👋
            </h2>
            <p className="text-xl text-gray-600">
              What would you like to do today?
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Tutor Matching Card */}
            <button
              onClick={() => router.push('/tutors')}
              className="group bg-white p-8 rounded-2xl shadow-lg border-2 border-gray-100 hover:border-blue-500 hover:shadow-xl transition-all duration-200 text-left"
            >
              <div className="bg-gradient-to-br from-blue-100 to-blue-50 w-20 h-20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BookOpen className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-blue-600 transition-colors">
                Tutor Matching
              </h3>
              <p className="text-gray-600 mb-4">
                Find a tutor to help you with your subjects or become a tutor and help others
              </p>
              <div className="flex items-center text-blue-600 font-semibold group-hover:gap-3 gap-2 transition-all">
                Get Started
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </button>

            {/* Find Teammates Card */}
            <button
              onClick={() => router.push('/teammates')}
              className="group bg-white p-8 rounded-2xl shadow-lg border-2 border-gray-100 hover:border-purple-500 hover:shadow-xl transition-all duration-200 text-left"
            >
              <div className="bg-gradient-to-br from-purple-100 to-purple-50 w-20 h-20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Users className="w-10 h-10 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-purple-600 transition-colors">
                Find Teammates
              </h3>
              <p className="text-gray-600 mb-4">
                Connect with students for hackathons, projects, and competitions
              </p>
              <div className="flex items-center text-purple-600 font-semibold group-hover:gap-3 gap-2 transition-all">
                Get Started
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </button>

            {/* Messages Card */}
            <button
              onClick={() => router.push('/chats')}
              className="group bg-white p-8 rounded-2xl shadow-lg border-2 border-gray-100 hover:border-green-500 hover:shadow-xl transition-all duration-200 text-left"
            >
              <div className="bg-gradient-to-br from-green-100 to-green-50 w-20 h-20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <MessageCircle className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-green-600 transition-colors">
                Messages
              </h3>
              <p className="text-gray-600 mb-4">
                Chat with tutors, teammates, and peers in direct messages or public rooms
              </p>
              <div className="flex items-center text-green-600 font-semibold group-hover:gap-3 gap-2 transition-all">
                Get Started
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </button>
          </div>

          {/* Quick Stats */}
          <div className="mt-12 grid grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-md text-center">
              <p className="text-3xl font-bold text-blue-600 mb-2">{stats.tutors}+</p>
              <p className="text-gray-600">Active Tutors</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md text-center">
              <p className="text-3xl font-bold text-purple-600 mb-2">{stats.students}+</p>
              <p className="text-gray-600">Students Helped</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md text-center">
              <p className="text-3xl font-bold text-green-600 mb-2">{stats.teams}+</p>
              <p className="text-gray-600">Teams Formed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Universal ChatBot */}
      <UniversalChatBot />
    </div>
  );
}
