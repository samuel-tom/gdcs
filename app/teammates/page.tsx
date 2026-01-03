'use client';

import { useAuth } from '@/lib/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { ArrowLeft, Users, Search, Plus, X, Code, Lightbulb, Trophy } from 'lucide-react';
import type { TeammateProfile } from '@/types';
import { db } from '@/lib/firebase';
import { collection, addDoc, onSnapshot, query, orderBy } from 'firebase/firestore';
import UniversalChatBot from '@/components/UniversalChatBot';

function TeammatesContent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [filterSkill, setFilterSkill] = useState('all');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [teammateForm, setTeammateForm] = useState({
    skills: '',
    interests: '',
    year: 'Second Year',
    department: 'CSE',
    lookingFor: '',
    phone: ''
  });

  // Mock data - will be replaced by Firestore when available
  const [teammates, setTeammates] = useState<TeammateProfile[]>([
    {
      id: '1',
      name: 'Vikram Singh',
      email: 'vikram@sastra.ac.in',
      phone: '+91 98765 12345',
      skills: ['React', 'Node.js', 'MongoDB', 'UI/UX'],
      interests: ['Web Development', 'AI/ML'],
      year: 'Third Year',
      department: 'CSE',
      lookingFor: 'Hackathon team for Smart India Hackathon 2026',
      photoURL: 'https://i.pravatar.cc/150?img=13'
    },
    {
      id: '2',
      name: 'Kavya Menon',
      email: 'kavya@sastra.ac.in',
      phone: '+91 99887 65432',
      skills: ['Python', 'Machine Learning', 'Data Analysis', 'TensorFlow'],
      interests: ['AI/ML', 'Research'],
      year: 'Final Year',
      department: 'CSE',
      lookingFor: 'ML project collaborators for research paper',
      photoURL: 'https://i.pravatar.cc/150?img=48'
    },
    {
      id: '3',
      name: 'Arjun Patel',
      email: 'arjun@sastra.ac.in',
      skills: ['Flutter', 'Firebase', 'Figma', 'Dart'],
      interests: ['Mobile Development', 'Startups'],
      year: 'Second Year',
      department: 'IT',
      lookingFor: 'Co-founder for EdTech startup idea',
      photoURL: 'https://i.pravatar.cc/150?img=15'
    },
    {
      id: '4',
      name: 'Meera Krishnan',
      email: 'meera@sastra.ac.in',
      phone: '+91 97654 88776',
      skills: ['Java', 'Spring Boot', 'PostgreSQL', 'Docker'],
      interests: ['Backend Development', 'Cloud Computing'],
      year: 'Third Year',
      department: 'CSE',
      lookingFor: 'Backend developers for cloud-based project',
      photoURL: 'https://i.pravatar.cc/150?img=44'
    },
    {
      id: '5',
      name: 'Siddharth Rao',
      email: 'siddharth@sastra.ac.in',
      skills: ['Blockchain', 'Solidity', 'Web3.js'],
      interests: ['Blockchain', 'Cryptocurrency'],
      year: 'Final Year',
      department: 'CSE',
      lookingFor: 'Team for blockchain hackathon',
      photoURL: 'https://i.pravatar.cc/150?img=17'
    },
    {
      id: '6',
      name: 'Lakshmi Venkat',
      email: 'lakshmi@sastra.ac.in',
      phone: '+91 98123 45678',
      skills: ['C++', 'Competitive Programming', 'DSA'],
      interests: ['Algorithms', 'Problem Solving'],
      year: 'Second Year',
      department: 'IT',
      lookingFor: 'ICPC team members',
      photoURL: 'https://i.pravatar.cc/150?img=46'
    },
  ]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  // Handle URL parameters from chatbot
  useEffect(() => {
    const urlSkill = searchParams.get('skill');
    
    if (urlSkill) {
      setSearchQuery(urlSkill);
    }
  }, [searchParams]);

  // Load from localStorage first
  useEffect(() => {
    const saved = localStorage.getItem('teammates');
    if (saved) {
      try {
        setTeammates(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load from localStorage');
      }
    }
  }, []);

  // Try to sync with Firestore
  useEffect(() => {
    try {
      const unsubscribe = onSnapshot(collection(db, 'teammates'), (snapshot) => {
        const teammatesList: TeammateProfile[] = [];
        snapshot.forEach((doc) => {
          teammatesList.push({ id: doc.id, ...doc.data() } as TeammateProfile);
        });
        setTeammates(teammatesList);
        localStorage.setItem('teammates', JSON.stringify(teammatesList));
      }, (error) => {
        console.log('Firestore not enabled, using localStorage only');
      });

      return () => unsubscribe();
    } catch (error) {
      console.log('Using localStorage mode');
    }
  }, []);

  const handleTeammateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !teammateForm.skills || !teammateForm.interests || !teammateForm.lookingFor) {
      alert('⚠️ Please fill in all required fields (skills, interests, and what you\'re looking for)');
      return;
    }
    
    setIsSubmitting(true);
    
    const newTeammate: TeammateProfile = {
      id: Date.now().toString(),
      name: user.displayName || 'Anonymous',
      email: user.email || '',
      phone: teammateForm.phone || undefined,
      skills: teammateForm.skills.split(',').map(s => s.trim()),
      interests: teammateForm.interests.split(',').map(i => i.trim()),
      year: teammateForm.year,
      department: teammateForm.department,
      lookingFor: teammateForm.lookingFor,
      photoURL: user.photoURL || undefined
    };
    
    // Add to local state and localStorage immediately
    const updatedTeammates = [newTeammate, ...teammates];
    setTeammates(updatedTeammates);
    localStorage.setItem('teammates', JSON.stringify(updatedTeammates));
    
    // Reset form and close it immediately
    setTeammateForm({ skills: '', interests: '', year: 'Second Year', department: 'CSE', lookingFor: '', phone: '' });
    setShowForm(false);
    setIsSubmitting(false);
    
    // Try to save to Firestore in background (don't await)
    addDoc(collection(db, 'teammates'), {
      ...newTeammate,
      createdAt: new Date().toISOString(),
      userId: user.uid
    }).then(() => {
      console.log('Synced to cloud');
    }).catch((error) => {
      console.log('Cloud sync disabled, data saved locally');
    });
    
    // Show success after a brief delay to ensure form closes
    setTimeout(() => {
      alert('✅ SUCCESS!\n\nYour teammate profile has been created!\n\nScroll down to see your profile in the list.');
    }, 100);
  };

  const handleConnect = (teammate: TeammateProfile) => {
    const contactInfo = `Connect with ${teammate.name}:\n\nEmail: ${teammate.email}${teammate.phone ? '\nPhone: ' + teammate.phone : ''}\n\nSkills: ${teammate.skills.join(', ')}\nInterests: ${teammate.interests.join(', ')}\n\nLooking for: ${teammate.lookingFor}`;
    alert(contactInfo);
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-2xl font-semibold text-gray-700">Loading...</div>
      </div>
    );
  }

  const allSkills = Array.from(new Set(teammates.flatMap(t => t.skills)));

  const filteredTeammates = teammates.filter(teammate => {
    const matchesSearch = 
      teammate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teammate.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
      teammate.interests.some(i => i.toLowerCase().includes(searchQuery.toLowerCase())) ||
      teammate.lookingFor.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSkill = filterSkill === 'all' || teammate.skills.includes(filterSkill);
    
    return matchesSearch && matchesSkill;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
            <div className="flex items-center gap-3">
              <div className="bg-purple-500 p-2 rounded-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800">Find Teammates</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                Connect with Amazing Teammates
              </h2>
              <p className="text-gray-600">
                Find the perfect collaborators for your next big project
              </p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              {showForm ? 'Cancel' : 'Add Profile'}
            </button>
          </div>

          {/* Profile Form */}
          {showForm && (
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 mb-8">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Create Your Profile</h3>
              <form onSubmit={handleTeammateSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Your Skills
                  </label>
                  <input
                    type="text"
                    value={teammateForm.skills}
                    onChange={(e) => setTeammateForm({...teammateForm, skills: e.target.value})}
                    placeholder="e.g., React, Python, UI/UX Design"
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-purple-500 focus:outline-none text-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Interests
                  </label>
                  <input
                    type="text"
                    value={teammateForm.interests}
                    onChange={(e) => setTeammateForm({...teammateForm, interests: e.target.value})}
                    placeholder="e.g., Web Development, AI/ML, Mobile Apps"
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-purple-500 focus:outline-none text-gray-800"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Year
                    </label>
                    <select 
                      value={teammateForm.year}
                      onChange={(e) => setTeammateForm({...teammateForm, year: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-purple-500 focus:outline-none text-gray-800"
                    >
                      <option>First Year</option>
                      <option>Second Year</option>
                      <option>Third Year</option>
                      <option>Final Year</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Department
                    </label>
                    <select 
                      value={teammateForm.department}
                      onChange={(e) => setTeammateForm({...teammateForm, department: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-purple-500 focus:outline-none text-gray-800"
                    >
                      <option>CSE</option>
                      <option>IT</option>
                      <option>ECE</option>
                      <option>EEE</option>
                      <option>Mechanical</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    value={teammateForm.phone}
                    onChange={(e) => setTeammateForm({...teammateForm, phone: e.target.value})}
                    placeholder="e.g., +91 98765 43210"
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-purple-500 focus:outline-none text-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    What are you looking for?
                  </label>
                  <textarea
                    value={teammateForm.lookingFor}
                    onChange={(e) => setTeammateForm({...teammateForm, lookingFor: e.target.value})}
                    placeholder="e.g., Looking for a team for Smart India Hackathon, need frontend and backend developers"
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-purple-500 focus:outline-none resize-none text-gray-800"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  {isSubmitting ? 'Creating Profile...' : 'Create Profile'}
                </button>
              </form>
            </div>
          )}

          {/* Quick Categories */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-white p-4 rounded-xl shadow-md text-center border-2 border-blue-100 hover:border-blue-500 transition-all cursor-pointer">
              <Code className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="font-semibold text-gray-800">Developers</p>
              <p className="text-2xl font-bold text-blue-600">{teammates.length}</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-md text-center border-2 border-green-100 hover:border-green-500 transition-all cursor-pointer">
              <Trophy className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="font-semibold text-gray-800">Hackathons</p>
              <p className="text-2xl font-bold text-green-600">12+</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-md text-center border-2 border-purple-100 hover:border-purple-500 transition-all cursor-pointer">
              <Lightbulb className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="font-semibold text-gray-800">Projects</p>
              <p className="text-2xl font-bold text-purple-600">25+</p>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="mb-8 space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, skills, or interests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none text-gray-800"
              />
            </div>
            
            <div className="flex gap-2 overflow-x-auto pb-2">
              <button
                onClick={() => setFilterSkill('all')}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  filterSkill === 'all'
                    ? 'bg-purple-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                All Skills
              </button>
              {allSkills.slice(0, 8).map((skill) => (
                <button
                  key={skill}
                  onClick={() => setFilterSkill(skill)}
                  className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                    filterSkill === skill
                      ? 'bg-purple-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>

          {/* Teammates Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {filteredTeammates.map((teammate) => (
              <div
                key={teammate.id}
                className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <div className="flex items-start gap-4 mb-4">
                  <img
                    src={teammate.photoURL}
                    alt={teammate.name}
                    className="w-16 h-16 rounded-full border-2 border-purple-500"
                  />
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 text-xl">{teammate.name}</h3>
                    <p className="text-sm text-gray-500">{teammate.year} • {teammate.department}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Skills:</p>
                  <div className="flex flex-wrap gap-2">
                    {teammate.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Interests:</p>
                  <div className="flex flex-wrap gap-2">
                    {teammate.interests.map((interest, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <p className="text-sm font-semibold text-gray-700 mb-1">Looking for:</p>
                  <p className="text-gray-700">{teammate.lookingFor}</p>
                </div>

                <button 
                  onClick={() => handleConnect(teammate)}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                  Connect
                </button>
              </div>
            ))}
          </div>

          {filteredTeammates.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No teammates found matching your criteria</p>
              <p className="text-gray-400">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>

      {/* AI Chatbot Assistant */}
      <UniversalChatBot />
    </div>
  );
}

export default function TeammatesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50"><div className="text-2xl font-semibold text-gray-700">Loading...</div></div>}>
      <TeammatesContent />
    </Suspense>
  );
}
