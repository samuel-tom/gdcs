import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  onSnapshot, 
  orderBy, 
  serverTimestamp,
  limit,
  Timestamp
} from 'firebase/firestore';

export interface ChatRoom {
  id: string;
  type: 'dm' | 'public';
  title?: string;
  dmKey?: string;
  members: string[];
  createdAt: Timestamp;
}

export interface ChatMessage {
  id: string;
  text: string;
  senderUid: string;
  senderName: string;
  createdAt: Timestamp;
}

/**
 * Get or create a DM room between two users
 */
export async function getOrCreateDmRoom(currentUid: string, otherUid: string, currentUserName: string, otherUserName: string): Promise<string> {
  // Create consistent dmKey
  const [uid1, uid2] = [currentUid, otherUid].sort();
  const dmKey = `${uid1}_${uid2}`;

  // Check if room already exists
  const roomsRef = collection(db, 'chat_rooms');
  const q = query(
    roomsRef,
    where('type', '==', 'dm'),
    where('dmKey', '==', dmKey),
    limit(1)
  );

  const snapshot = await getDocs(q);
  
  if (!snapshot.empty) {
    return snapshot.docs[0].id;
  }

  // Create new DM room
  const newRoom = await addDoc(roomsRef, {
    type: 'dm',
    dmKey,
    members: [currentUid, otherUid],
    memberNames: {
      [currentUid]: currentUserName,
      [otherUid]: otherUserName
    },
    createdAt: serverTimestamp()
  });

  return newRoom.id;
}

/**
 * List all DM rooms for a user
 */
export function subscribeToDmRooms(currentUid: string, callback: (rooms: ChatRoom[]) => void) {
  const roomsRef = collection(db, 'chat_rooms');
  const q = query(
    roomsRef,
    where('type', '==', 'dm'),
    where('members', 'array-contains', currentUid),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const rooms: ChatRoom[] = [];
    snapshot.forEach((doc) => {
      rooms.push({ id: doc.id, ...doc.data() } as ChatRoom);
    });
    callback(rooms);
  });
}

/**
 * List all public rooms
 */
export function subscribeToPublicRooms(callback: (rooms: ChatRoom[]) => void) {
  const roomsRef = collection(db, 'chat_rooms');
  const q = query(
    roomsRef,
    where('type', '==', 'public'),
    orderBy('title', 'asc')
  );

  return onSnapshot(q, (snapshot) => {
    const rooms: ChatRoom[] = [];
    snapshot.forEach((doc) => {
      rooms.push({ id: doc.id, ...doc.data() } as ChatRoom);
    });
    callback(rooms);
  });
}

/**
 * Send a message to a room
 */
export async function sendMessage(roomId: string, text: string, senderUid: string, senderName: string) {
  if (!text.trim() || text.length > 2000) {
    throw new Error('Message must be between 1 and 2000 characters');
  }

  const messagesRef = collection(db, 'chat_rooms', roomId, 'messages');
  await addDoc(messagesRef, {
    text: text.trim(),
    senderUid,
    senderName,
    createdAt: serverTimestamp()
  });
}

/**
 * Subscribe to messages in a room
 */
export function subscribeToMessages(roomId: string, callback: (messages: ChatMessage[]) => void) {
  const messagesRef = collection(db, 'chat_rooms', roomId, 'messages');
  const q = query(messagesRef, orderBy('createdAt', 'asc'));

  return onSnapshot(q, (snapshot) => {
    const messages: ChatMessage[] = [];
    snapshot.forEach((doc) => {
      messages.push({ id: doc.id, ...doc.data() } as ChatMessage);
    });
    callback(messages);
  });
}

/**
 * Get room details by ID
 */
export async function getRoomById(roomId: string): Promise<ChatRoom | null> {
  const roomsRef = collection(db, 'chat_rooms');
  const q = query(roomsRef, where('__name__', '==', roomId), limit(1));
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) return null;
  
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() } as ChatRoom;
}

/**
 * Seed default public rooms (call once on app init)
 */
export async function seedPublicRooms() {
  const roomsRef = collection(db, 'chat_rooms');
  
  const publicRooms = [
    { title: 'General', description: 'General discussion' },
    { title: 'Hackathons', description: 'Discuss hackathons and competitions' },
    { title: 'Academics', description: 'Academic discussions and study tips' },
    { title: 'Placements', description: 'Placement prep and opportunities' },
    { title: 'Off-topic', description: 'Random fun conversations' }
  ];

  for (const room of publicRooms) {
    // Check if room already exists
    const q = query(
      roomsRef,
      where('type', '==', 'public'),
      where('title', '==', room.title),
      limit(1)
    );
    
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      await addDoc(roomsRef, {
        type: 'public',
        title: room.title,
        description: room.description,
        members: [],
        createdAt: serverTimestamp()
      });
    }
  }
}
