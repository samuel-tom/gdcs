# Firebase Firestore Setup (2 minutes)

## Quick Setup Steps:

1. **Open Firebase Console**
   - Go to: https://console.firebase.google.com/
   - Select your project: `gdcs-hax`

2. **Enable Firestore**
   - Click "Firestore Database" in left sidebar
   - Click "Create database" button
   - Select "Start in test mode" (for quick demo)
   - Choose location: `nam5 (us-central)` or closest to you
   - Click "Enable"

3. **Done!** 
   - Your app will automatically sync data in real-time
   - Test on 2 devices to see live updates

## What This Enables:

✅ **Real-time sync** - Profiles appear instantly on all devices
✅ **Persistent data** - Data survives browser refreshes
✅ **Multi-device demo** - Impress judges by showing live collaboration
✅ **Production-ready** - Actual cloud database, not just localStorage

## Demo Script for Judges:

1. Open app on your laptop
2. Create a profile
3. Have someone else open it on their phone
4. They see your profile instantly! (Real-time sync)
5. This proves it's a real collaborative platform

## Security Note:

Test mode allows anyone to read/write for 30 days - perfect for hackathons!
For production, you'd add security rules to restrict access.
