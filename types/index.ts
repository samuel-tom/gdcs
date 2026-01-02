export interface TutorProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subjects: string[];
  year: string;
  department: string;
  availability: string;
  location?: string;
  photoURL?: string;
}

export interface StudentRequest {
  id: string;
  name: string;
  email: string;
  subject: string;
  description: string;
  year: string;
  department: string;
  photoURL?: string;
}

export interface TeammateProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  skills: string[];
  interests: string[];
  year: string;
  department: string;
  lookingFor: string;
  photoURL?: string;
}
