/**
 * Migration script to add UID fields to existing tutor and teammate profiles
 * Run this once to update existing Firestore documents
 */

import { db } from '@/lib/firebase';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';

export async function migrateAddUids() {
  console.log('Starting migration: Adding UIDs to profiles...');
  
  try {
    // Migrate tutors
    const tutorsRef = collection(db, 'tutors');
    const tutorsSnapshot = await getDocs(tutorsRef);
    
    let tutorsUpdated = 0;
    for (const tutorDoc of tutorsSnapshot.docs) {
      const data = tutorDoc.data();
      
      // Only update if uid is missing
      if (!data.uid && data.userId) {
        await updateDoc(doc(db, 'tutors', tutorDoc.id), {
          uid: data.userId
        });
        tutorsUpdated++;
        console.log(`Updated tutor: ${data.name} (${data.userId})`);
      }
    }
    
    // Migrate teammates
    const teammatesRef = collection(db, 'teammates');
    const teammatesSnapshot = await getDocs(teammatesRef);
    
    let teammatesUpdated = 0;
    for (const teammateDoc of teammatesSnapshot.docs) {
      const data = teammateDoc.data();
      
      // Only update if uid is missing
      if (!data.uid && data.userId) {
        await updateDoc(doc(db, 'teammates', teammateDoc.id), {
          uid: data.userId
        });
        teammatesUpdated++;
        console.log(`Updated teammate: ${data.name} (${data.userId})`);
      }
    }
    
    console.log(`✅ Migration complete!`);
    console.log(`   - Tutors updated: ${tutorsUpdated}`);
    console.log(`   - Teammates updated: ${teammatesUpdated}`);
    
    return { tutorsUpdated, teammatesUpdated };
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}
