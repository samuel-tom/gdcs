'use client';

import { useAuth } from '@/lib/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { 
  getUserProfile, 
  UserProfile, 
  submitRating, 
  getRating, 
  getTutorRatings,
  Rating 
} from '@/lib/profile';
import { 
  User as UserIcon, 
  Mail, 
  MapPin, 
  Calendar, 
  Star, 
  MessageCircle,
  BookOpen,
  DollarSign,
  Clock,
  Edit,
  X,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

export default function PublicProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const profileUid = params.uid as string;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [myRating, setMyRating] = useState<Rating | null>(null);
  const [allRatings, setAllRatings] = useState<Rating[]>([]);
  
  // Rating modal state
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingValue, setRatingValue] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadProfile();
  }, [profileUid, user]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const userProfile = await getUserProfile(profileUid);
      setProfile(userProfile);

      // Load my rating if viewing a tutor
      if (user && userProfile?.isTutor) {
        const rating = await getRating(profileUid, user.uid);
        setMyRating(rating);
        if (rating) {
          setRatingValue(rating.rating);
          setRatingComment(rating.comment);
        }

        // Load all ratings
        const ratings = await getTutorRatings(profileUid);
        setAllRatings(ratings);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRating = async () => {
    if (!user || !ratingValue) return;

    setSubmitting(true);
    try {
      await submitRating(profileUid, user.uid, ratingValue, ratingComment);
      alert('Rating submitted successfully!');
      setShowRatingModal(false);
      loadProfile(); // Reload to show updated rating
    } catch (error: any) {
      console.error('Error submitting rating:', error);
      alert(error.message || 'Error submitting rating');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMessageClick = () => {
    // Navigate to chat with this user (implement DM functionality)
    router.push(`/chats?dm=${profileUid}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Profile not found</h2>
          <Link href="/dashboard" className="text-blue-600 hover:underline">
            Go back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  const isOwnProfile = user?.uid === profileUid;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back</span>
        </button>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-32"></div>
          
          {/* Profile Info */}
          <div className="px-8 pb-8">
            <div className="flex flex-col sm:flex-row gap-6 -mt-16 mb-6">
              {/* Avatar */}
              <div className="flex-shrink-0">
                {profile.photoURL ? (
                  <img
                    src={profile.photoURL}
                    alt={profile.displayName}
                    className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-gray-200 flex items-center justify-center">
                    <UserIcon className="w-16 h-16 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Name and Actions */}
              <div className="flex-1 pt-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-800">
                      {profile.displayName}
                    </h1>
                    {(profile.department || profile.year) && (
                      <div className="text-gray-600 mt-1 flex items-center gap-2">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <span className="whitespace-nowrap">
                          {profile.department && profile.year 
                            ? `${profile.department} - ${profile.year}` 
                            : profile.department || profile.year}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {isOwnProfile ? (
                      <Link
                        href="/profile"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        Edit Profile
                      </Link>
                    ) : (
                      <button
                        onClick={() => {
                          alert(`📧 Contact ${profile.displayName}:\n\nEmail: ${profile.email}${profile.photoURL ? '\n\nYou can also reach out via the chat feature!' : ''}`);
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                      >
                        <Mail className="w-4 h-4" />
                        Contact
                      </button>
                    )}
                  </div>
                </div>

                {/* Bio */}
                {profile.bio && (
                  <p className="mt-4 text-gray-700 leading-relaxed">{profile.bio}</p>
                )}

                {/* Skills */}
                {profile.skills && profile.skills.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-semibold text-gray-600 mb-2">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Tutor Section */}
            {profile.isTutor && (
              <div className="mt-8 border-t pt-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <BookOpen className="w-6 h-6 text-blue-600" />
                    Tutor Information
                  </h2>
                  
                  {/* Rating Summary */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      <span className="font-bold text-lg">
                        {profile.tutorStats.ratingAvg > 0 
                          ? profile.tutorStats.ratingAvg.toFixed(1) 
                          : 'No ratings'}
                      </span>
                    </div>
                    {profile.tutorStats.ratingCount > 0 && (
                      <span className="text-gray-800 font-medium">
                        ({profile.tutorStats.ratingCount} rating{profile.tutorStats.ratingCount !== 1 ? 's' : ''})
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mb-6">
                  {/* Subjects */}
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      Subjects
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.tutorSubjects.map((subject) => (
                        <span
                          key={subject}
                          className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                        >
                          {subject}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Pricing */}
                  {profile.tutorPricingText && (
                    <div>
                      <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        Pricing
                      </h3>
                      <p className="text-gray-600">{profile.tutorPricingText}</p>
                    </div>
                  )}

                  {/* Availability */}
                  {profile.tutorAvailabilityText && (
                    <div>
                      <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Availability
                      </h3>
                      <p className="text-gray-600">{profile.tutorAvailabilityText}</p>
                    </div>
                  )}
                </div>

                {/* Rate Button (only for others) */}
                {!isOwnProfile && user && (
                  <button
                    onClick={() => setShowRatingModal(true)}
                    className="px-6 py-3 bg-yellow-500 text-gray-900 rounded-lg hover:bg-yellow-600 font-bold flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
                  >
                    <Star className="w-5 h-5 fill-current" />
                    <span>{myRating ? 'Update Your Rating' : 'Rate This Tutor'}</span>
                  </button>
                )}

                {/* Reviews */}
                {allRatings.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Reviews</h3>
                    <div className="space-y-4">
                      {allRatings.slice(0, 10).map((rating) => (
                        <div
                          key={rating.reviewerUid}
                          className="p-4 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-4 h-4 ${
                                    star <= rating.rating
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-gray-500">
                              {rating.createdAt && 
                                new Date((rating.createdAt as any).seconds * 1000).toLocaleDateString()}
                            </span>
                          </div>
                          {rating.comment && (
                            <p className="text-gray-700">{rating.comment}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rating Modal */}
      {showRatingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">
                {myRating ? 'Update Your Rating' : 'Rate This Tutor'}
              </h2>
              <button
                onClick={() => setShowRatingModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Star Rating */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Your Rating *
              </label>
              <div className="flex gap-2 justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRatingValue(star)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`w-12 h-12 transition-colors ${
                        star <= ratingValue
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300 hover:text-yellow-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comment (Optional)
              </label>
              <textarea
                value={ratingComment}
                onChange={(e) => setRatingComment(e.target.value)}
                maxLength={500}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="Share your experience..."
              />
              <p className="text-sm text-gray-500 mt-1">
                {ratingComment.length}/500 characters
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleSubmitRating}
                disabled={submitting || !ratingValue}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                {submitting ? 'Submitting...' : 'Submit Rating'}
              </button>
              <button
                onClick={() => setShowRatingModal(false)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
