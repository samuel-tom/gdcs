'use client';

import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, BookOpen, Search, Plus, X } from 'lucide-react';
import type { TutorProfile, StudentRequest } from '@/types';
import { db } from '@/lib/firebase';
import { collection, addDoc, onSnapshot, query, orderBy } from 'firebase/firestore';

export default function TutorsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<'choose' | 'tutor' | 'student'>('choose');
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterDepartment, setFilterDepartment] = useState('all');
  
  // Form state for tutor profile
  const [tutorForm, setTutorForm] = useState({
    subjects: '',
    year: 'Second Year',
    department: 'CSE',
    availability: '',
    phone: '',
    location: ''
  });
  
  // Form state for student request
  const [studentForm, setStudentForm] = useState({
    subject: '',
    description: '',
    year: 'Second Year',
    department: 'CSE'
  });
  
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [filterRequestDepartment, setFilterRequestDepartment] = useState('all');

  // Mock data - will be replaced by Firestore data when available
  const [tutors, setTutors] = useState<TutorProfile[]>([
    {
      id: '1',
      name: 'Rajesh Kumar',
      email: 'rajesh@sastra.ac.in',
      phone: '+91 98765 43210',
      subjects: ['Data Structures', 'Algorithms', 'C++'],
      year: 'Final Year',
      department: 'CSE',
      availability: 'Weekday evenings',
      photoURL: 'https://i.pravatar.cc/150?img=12'
    },
    {
      id: '2',
      name: 'Priya Sharma',
      email: 'priya@sastra.ac.in',
      phone: '+91 98234 56789',
      subjects: ['Machine Learning', 'Python', 'Statistics'],
      year: 'Third Year',
      department: 'CSE',
      availability: 'Weekends',
      photoURL: 'https://i.pravatar.cc/150?img=47'
    },
    {
      id: '3',
      name: 'Arun Prakash',
      email: 'arun@sastra.ac.in',
      subjects: ['Database Management', 'SQL', 'Java'],
      year: 'Final Year',
      department: 'IT',
      availability: 'Flexible',
      photoURL: 'https://i.pravatar.cc/150?img=33'
    },
    {
      id: '4',
      name: 'Divya Ramesh',
      email: 'divya@sastra.ac.in',
      phone: '+91 99876 54321',
      subjects: ['Web Development', 'React', 'JavaScript'],
      year: 'Final Year',
      department: 'CSE',
      availability: 'Afternoons',
      photoURL: 'https://i.pravatar.cc/150?img=45'
    },
    {
      id: '5',
      name: 'Karthik Subramanian',
      email: 'karthik@sastra.ac.in',
      subjects: ['Operating Systems', 'Computer Networks'],
      year: 'Third Year',
      department: 'IT',
      availability: 'Mornings',
      photoURL: 'https://i.pravatar.cc/150?img=14'
    },
    {
      id: '6',
      name: 'Anjali Iyer',
      email: 'anjali@sastra.ac.in',
      phone: '+91 97654 32109',
      subjects: ['Digital Electronics', 'Embedded Systems'],
      year: 'Final Year',
      department: 'ECE',
      availability: 'Weekends',
      photoURL: 'https://i.pravatar.cc/150?img=49'
    },
  ]);

  const [studentRequests, setStudentRequests] = useState<StudentRequest[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  // Load from localStorage first (instant) - but Firestore will override
  useEffect(() => {
    const saved = localStorage.getItem('tutors');
    if (saved) {
      try {
        setTutors(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load from localStorage');
      }
    }
    
    // Don't load mock data from localStorage for student requests
    // Let Firestore be the source of truth
  }, []);

  // Try to sync with Firestore (if enabled)
  useEffect(() => {
    try {
      const q = query(collection(db, 'tutors'), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const tutorsList: TutorProfile[] = [];
        snapshot.forEach((doc) => {
          tutorsList.push({ id: doc.id, ...doc.data() } as TutorProfile);
        });
        setTutors(tutorsList);
        localStorage.setItem('tutors', JSON.stringify(tutorsList));
      }, (error) => {
        console.log('Firestore not enabled, using localStorage only');
      });

      return () => unsubscribe();
    } catch (error) {
      console.log('Using localStorage mode');
    }
  }, []);

  // Sync student requests with Firestore
  useEffect(() => {
    try {
      // Try without ordering first to avoid index issues
      const unsubscribe = onSnapshot(collection(db, 'studentRequests'), (snapshot) => {
        const requestsList: StudentRequest[] = [];
        snapshot.forEach((doc) => {
          requestsList.push({ id: doc.id, ...doc.data() } as StudentRequest);
        });
        console.log('Loaded student requests from Firestore:', requestsList.length);
        setStudentRequests(requestsList);
        localStorage.setItem('studentRequests', JSON.stringify(requestsList));
      }, (error) => {
        console.log('Firestore student requests error:', error);
      });

      return () => unsubscribe();
    } catch (error) {
      console.log('Using localStorage mode for student requests');
    }
  }, []);

  const handleTutorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !tutorForm.subjects || !tutorForm.availability) {
      alert('⚠️ Please fill in all required fields (subjects and availability)');
      return;
    }
    
    setIsSubmitting(true);
    
    const newTutor: TutorProfile = {
      id: Date.now().toString(),
      name: user.displayName || 'Anonymous',
      email: user.email || '',
      phone: tutorForm.phone || undefined,
      subjects: tutorForm.subjects.split(',').map(s => s.trim()),
      year: tutorForm.year,
      department: tutorForm.department,
      availability: tutorForm.availability,
      location: tutorForm.location || undefined,
      photoURL: user.photoURL || undefined
    };
    
    // Add to local state and localStorage immediately
    const updatedTutors = [newTutor, ...tutors];
    setTutors(updatedTutors);
    localStorage.setItem('tutors', JSON.stringify(updatedTutors));
    
    // Reset form and close it immediately
    setTutorForm({ subjects: '', year: 'Second Year', department: 'CSE', availability: '', phone: '', location: '' });
    setShowForm(false);
    setIsSubmitting(false);
    
    // Try to save to Firestore in background (don't await)
    addDoc(collection(db, 'tutors'), {
      ...newTutor,
      createdAt: new Date().toISOString(),
      userId: user.uid
    }).then(() => {
      console.log('Synced to cloud');
    }).catch((error) => {
      console.log('Cloud sync disabled, data saved locally');
    });
    
    // Show success after a brief delay to ensure form closes
    setTimeout(() => {
      alert('✅ SUCCESS!\n\nYour tutor profile has been created!\n\nSwitch to "Find a Tutor" mode to see your profile.');
    }, 100);
  };

  const handleContactTutor = (tutor: TutorProfile) => {
    const contactInfo = `Contact ${tutor.name}:\n\nEmail: ${tutor.email}${tutor.phone ? '\nPhone: ' + tutor.phone : ''}${tutor.location ? '\nLocation: ' + tutor.location : ''}\n\nSubjects: ${tutor.subjects.join(', ')}\nAvailability: ${tutor.availability}`;
    alert(contactInfo);
  };
  
  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !studentForm.subject || !studentForm.description) {
      alert('⚠️ Please fill in subject and description');
      return;
    }
    
    setIsSubmitting(true);
    
    const newRequest: StudentRequest = {
      id: Date.now().toString(),
      name: user.displayName || 'Anonymous',
      email: user.email || '',
      subject: studentForm.subject,
      description: studentForm.description,
      year: studentForm.year,
      department: studentForm.department,
      photoURL: user.photoURL || undefined
    };
    
    const updatedRequests = [newRequest, ...studentRequests];
    setStudentRequests(updatedRequests);
    localStorage.setItem('studentRequests', JSON.stringify(updatedRequests));
    
    setStudentForm({ subject: '', description: '', year: 'Second Year', department: 'CSE' });
    setShowStudentForm(false);
    setIsSubmitting(false);
    
    // Try to save to Firestore
    addDoc(collection(db, 'studentRequests'), {
      ...newRequest,
      createdAt: new Date().toISOString(),
      userId: user.uid
    }).then(() => {
      console.log('Synced to cloud');
    }).catch((error) => {
      console.log('Cloud sync disabled, data saved locally');
    });
    
    setTimeout(() => {
      alert('✅ SUCCESS!\n\nYour help request has been posted!\n\nTutors can now see your request.');
    }, 100);
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-2xl font-semibold text-gray-700">Loading...</div>
      </div>
    );
  }

  const filteredTutors = tutors.filter(tutor => {
    const matchesSearch = 
      tutor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tutor.subjects.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
      tutor.department.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDepartment = filterDepartment === 'all' || tutor.department === filterDepartment;
    
    return matchesSearch && matchesDepartment;
  });

  const filteredRequests = studentRequests.filter(req => {
    const matchesSearch =
      req.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDepartment = filterRequestDepartment === 'all' || req.department === filterRequestDepartment;
    
    return matchesSearch && matchesDepartment;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => mode === 'choose' ? router.push('/dashboard') : setMode('choose')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
            <div className="flex items-center gap-3">
              <div className="bg-blue-500 p-2 rounded-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800">Tutor Matching</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {mode === 'choose' && (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                How would you like to participate?
              </h2>
              <p className="text-gray-600">Choose your role to get started</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <button
                onClick={() => setMode('student')}
                className="group bg-white p-8 rounded-2xl shadow-lg border-2 border-gray-100 hover:border-blue-500 hover:shadow-xl transition-all text-left"
              >
                <div className="bg-blue-100 w-16 h-16 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Search className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">Find a Tutor</h3>
                <p className="text-gray-600">
                  Browse available tutors and get help with your subjects
                </p>
              </button>

              <button
                onClick={() => setMode('tutor')}
                className="group bg-white p-8 rounded-2xl shadow-lg border-2 border-gray-100 hover:border-purple-500 hover:shadow-xl transition-all text-left"
              >
                <div className="bg-purple-100 w-16 h-16 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <BookOpen className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">Become a Tutor</h3>
                <p className="text-gray-600">
                  Share your knowledge and help other students succeed
                </p>
              </button>
            </div>
          </div>
        )}

        {mode === 'student' && (
          <div className="max-w-6xl mx-auto">
            {/* Search and Filter Bar */}
            <div className="mb-8 space-y-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by name, subject, or department..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none text-gray-800"
                />
              </div>
              
              {/* Department Filter */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                <button
                  onClick={() => setFilterDepartment('all')}
                  className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                    filterDepartment === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  All Departments
                </button>
                {['CSE', 'IT', 'ECE', 'EEE', 'Mechanical'].map((dept) => (
                  <button
                    key={dept}
                    onClick={() => setFilterDepartment(dept)}
                    className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                      filterDepartment === dept
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    {dept}
                  </button>
                ))}
              </div>
            </div>

            {/* Tutors Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTutors.map((tutor) => (
                <div
                  key={tutor.id}
                  className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <img
                      src={tutor.photoURL}
                      alt={tutor.name}
                      className="w-16 h-16 rounded-full border-2 border-blue-500"
                    />
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800 text-lg">{tutor.name}</h3>
                      <p className="text-sm text-gray-500">{tutor.year} • {tutor.department}</p>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Subjects:</p>
                    <div className="flex flex-wrap gap-2">
                      {tutor.subjects.map((subject, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium"
                        >
                          {subject}
                        </span>
                      ))}
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-2">
                    <span className="font-semibold">Available:</span> {tutor.availability}
                  </p>
                  
                  {tutor.location && (
                    <p className="text-sm text-gray-600 mb-4">
                      <span className="font-semibold">Location:</span> {tutor.location}
                    </p>
                  )}
                  
                  {!tutor.location && <div className="mb-4"></div>}

                  <button 
                    onClick={() => handleContactTutor(tutor)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                  >
                    Contact Tutor
                  </button>
                </div>
              ))}
            </div>

            {filteredTutors.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No tutors found matching your search</p>
              </div>
            )}
          </div>
        )}

        {mode === 'tutor' && (
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Student Requests</h2>
                <p className="text-gray-600">Help students who need your expertise</p>
              </div>
              <button
                onClick={() => setShowForm(!showForm)}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                {showForm ? 'Cancel' : 'Create Profile'}
              </button>
            </div>

            {showForm && (
              <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 mb-8">
                <h3 className="text-xl font-bold text-gray-800 mb-6">Create Your Tutor Profile</h3>
                <form onSubmit={handleTutorSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Subjects You Can Teach
                    </label>
                    <input
                      type="text"
                      value={tutorForm.subjects}
                      onChange={(e) => setTutorForm({...tutorForm, subjects: e.target.value})}
                      placeholder="e.g., Data Structures, Algorithms, Python"
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-purple-500 focus:outline-none text-gray-800"
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Year
                      </label>
                      <select 
                        value={tutorForm.year}
                        onChange={(e) => setTutorForm({...tutorForm, year: e.target.value})}
                        className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-purple-500 focus:outline-none text-gray-800"
                      >
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
                        value={tutorForm.department}
                        onChange={(e) => setTutorForm({...tutorForm, department: e.target.value})}
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
                      value={tutorForm.phone}
                      onChange={(e) => setTutorForm({...tutorForm, phone: e.target.value})}
                      placeholder="e.g., +91 98765 43210"
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-purple-500 focus:outline-none text-gray-800"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Location (Optional)
                    </label>
                    <input
                      type="text"
                      value={tutorForm.location}
                      onChange={(e) => setTutorForm({...tutorForm, location: e.target.value})}
                      placeholder="e.g., Block A Hostel, Main Library, etc."
                      title="Enter your hostel block or preferred teaching location (e.g., library, canteen)"
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-purple-500 focus:outline-none text-gray-800"
                    />
                    <p className="text-xs text-gray-500 mt-1">Where students can find you (hostel block, library, etc.)</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Availability
                    </label>
                    <input
                      type="text"
                      value={tutorForm.availability}
                      onChange={(e) => setTutorForm({...tutorForm, availability: e.target.value})}
                      placeholder="e.g., Weekday evenings, Weekends"
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-purple-500 focus:outline-none text-gray-800"
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

            {/* Post Help Request Button */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Post a Help Request</h2>
                <p className="text-gray-600">Looking for help? Post your request and tutors will reach out</p>
              </div>
              <button
                onClick={() => setShowStudentForm(!showStudentForm)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                {showStudentForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                {showStudentForm ? 'Cancel' : 'Post Request'}
              </button>
            </div>

            {/* Student Request Form */}
            {showStudentForm && (
              <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 mb-8">
                <h3 className="text-xl font-bold text-gray-800 mb-6">Post Your Help Request</h3>
                <form onSubmit={handleStudentSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Subject/Topic
                    </label>
                    <input
                      type="text"
                      value={studentForm.subject}
                      onChange={(e) => setStudentForm({...studentForm, subject: e.target.value})}
                      placeholder="e.g., Operating Systems, Data Structures"
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:outline-none text-gray-800"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={studentForm.description}
                      onChange={(e) => setStudentForm({...studentForm, description: e.target.value})}
                      placeholder="Describe what you need help with..."
                      rows={3}
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:outline-none text-gray-800 resize-none"
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Year
                      </label>
                      <select 
                        value={studentForm.year}
                        onChange={(e) => setStudentForm({...studentForm, year: e.target.value})}
                        className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:outline-none text-gray-800"
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
                        value={studentForm.department}
                        onChange={(e) => setStudentForm({...studentForm, department: e.target.value})}
                        className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:outline-none text-gray-800"
                      >
                        <option>CSE</option>
                        <option>IT</option>
                        <option>ECE</option>
                        <option>EEE</option>
                        <option>Mechanical</option>
                      </select>
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                  >
                    {isSubmitting ? 'Posting Request...' : 'Post Help Request'}
                  </button>
                </form>
              </div>
            )}

            {/* Search and Filter Bar */}
            <div className="mb-8 space-y-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search requests by subject or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none text-gray-800"
                />
              </div>
              
              {/* Department Filter */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                <button
                  onClick={() => setFilterRequestDepartment('all')}
                  className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                    filterRequestDepartment === 'all'
                      ? 'bg-purple-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  All Departments
                </button>
                {['CSE', 'IT', 'ECE', 'EEE', 'Mechanical'].map((dept) => (
                  <button
                    key={dept}
                    onClick={() => setFilterRequestDepartment(dept)}
                    className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                      filterRequestDepartment === dept
                        ? 'bg-purple-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    {dept}
                  </button>
                ))}
              </div>
            </div>

            {/* Student Requests */}
            <div className="space-y-4">
              {filteredRequests.map((request) => (
                <div
                  key={request.id}
                  className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={request.photoURL}
                      alt={request.name}
                      className="w-14 h-14 rounded-full border-2 border-purple-500"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-bold text-gray-800 text-lg">{request.name}</h3>
                          <p className="text-sm text-gray-500">{request.year} • {request.department}</p>
                        </div>
                        <span className="px-4 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                          {request.subject}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-4">{request.description}</p>
                      <button className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors">
                        Offer Help
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredRequests.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No student requests at the moment</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
