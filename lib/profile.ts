import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
  Timestamp,
  runTransaction
} from 'firebase/firestore';
import { db } from './firebase';
import { User } from 'firebase/auth';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  department: string | null;
  year: string | number | null;
  bio: string;
  skills: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  
  // Tutor-specific fields
  isTutor: boolean;
  tutorSubjects: string[];
  tutorPricingText: string;
  tutorAvailabilityText: string;
  tutorStats: {
    ratingAvg: number;
    ratingCount: number;
  };
}

export interface Rating {
  reviewerUid: string;
  rating: number; // 1-5
  comment: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Ensures a user profile exists in Firestore, creating or updating as needed
 */
export async function ensureUserProfile(user: User): Promise<void> {
  if (!user.uid) return;

  const profileRef = doc(db, 'profiles', user.uid);
  const profileSnap = await getDoc(profileRef);

  if (!profileSnap.exists()) {
    // Create new profile
    await setDoc(profileRef, {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || 'Anonymous User',
      photoURL: user.photoURL || null,
      department: null,
      year: null,
      bio: '',
      skills: [],
      isTutor: false,
      tutorSubjects: [],
      tutorPricingText: '',
      tutorAvailabilityText: '',
      tutorStats: {
        ratingAvg: 0,
        ratingCount: 0
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  } else {
    // Update existing profile with latest auth info
    await updateDoc(profileRef, {
      email: user.email || profileSnap.data().email,
      displayName: user.displayName || profileSnap.data().displayName,
      photoURL: user.photoURL || profileSnap.data().photoURL,
      updatedAt: serverTimestamp()
    });
  }
}

/**
 * Get a user profile by UID
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const profileRef = doc(db, 'profiles', uid);
  const profileSnap = await getDoc(profileRef);
  
  if (!profileSnap.exists()) {
    return null;
  }
  
  return profileSnap.data() as UserProfile;
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  uid: string, 
  updates: Partial<UserProfile>
): Promise<void> {
  const profileRef = doc(db, 'profiles', uid);
  await updateDoc(profileRef, {
    ...updates,
    updatedAt: serverTimestamp()
  });
}

/**
 * Get all tutors
 */
export async function getTutors(): Promise<UserProfile[]> {
  const profilesRef = collection(db, 'profiles');
  const q = query(profilesRef, where('isTutor', '==', true));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => doc.data() as UserProfile);
}

/**
 * Get all profiles (for teammates)
 */
export async function getAllProfiles(): Promise<UserProfile[]> {
  const profilesRef = collection(db, 'profiles');
  const querySnapshot = await getDocs(profilesRef);
  
  return querySnapshot.docs.map(doc => doc.data() as UserProfile);
}

/**
 * Submit or update a rating for a tutor
 */
export async function submitRating(
  tutorUid: string,
  reviewerUid: string,
  rating: number,
  comment: string = ''
): Promise<void> {
  if (tutorUid === reviewerUid) {
    throw new Error('Cannot rate yourself');
  }

  if (rating < 1 || rating > 5) {
    throw new Error('Rating must be between 1 and 5');
  }

  if (comment.length > 500) {
    throw new Error('Comment must be 500 characters or less');
  }

  const ratingRef = doc(db, 'profiles', tutorUid, 'ratings', reviewerUid);
  const tutorRef = doc(db, 'profiles', tutorUid);

  await runTransaction(db, async (transaction) => {
    const ratingSnap = await transaction.get(ratingRef);
    const tutorSnap = await transaction.get(tutorRef);

    if (!tutorSnap.exists()) {
      throw new Error('Tutor profile not found');
    }

    const tutorData = tutorSnap.data() as UserProfile;
    const oldRatingAvg = tutorData.tutorStats?.ratingAvg || 0;
    const oldRatingCount = tutorData.tutorStats?.ratingCount || 0;

    let newRatingAvg: number;
    let newRatingCount: number;

    if (ratingSnap.exists()) {
      // Updating existing rating
      const oldRating = ratingSnap.data().rating;
      newRatingCount = oldRatingCount;
      newRatingAvg = (oldRatingAvg * oldRatingCount - oldRating + rating) / oldRatingCount;
    } else {
      // New rating
      newRatingCount = oldRatingCount + 1;
      newRatingAvg = (oldRatingAvg * oldRatingCount + rating) / newRatingCount;
    }

    // Update rating document
    transaction.set(ratingRef, {
      reviewerUid,
      rating,
      comment,
      createdAt: ratingSnap.exists() ? ratingSnap.data().createdAt : serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    // Update tutor stats
    transaction.update(tutorRef, {
      'tutorStats.ratingAvg': newRatingAvg,
      'tutorStats.ratingCount': newRatingCount,
      updatedAt: serverTimestamp()
    });
  });
}

/**
 * Get a specific rating
 */
export async function getRating(
  tutorUid: string,
  reviewerUid: string
): Promise<Rating | null> {
  const ratingRef = doc(db, 'profiles', tutorUid, 'ratings', reviewerUid);
  const ratingSnap = await getDoc(ratingRef);
  
  if (!ratingSnap.exists()) {
    return null;
  }
  
  return ratingSnap.data() as Rating;
}

/**
 * Get all ratings for a tutor
 */
export async function getTutorRatings(tutorUid: string): Promise<Rating[]> {
  const ratingsRef = collection(db, 'profiles', tutorUid, 'ratings');
  const querySnapshot = await getDocs(ratingsRef);
  
  return querySnapshot.docs.map(doc => doc.data() as Rating);
}
