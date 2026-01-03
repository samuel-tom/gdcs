# 🔒 Deploy Firestore Security Rules

## The permissions error you're seeing is because the Firestore security rules haven't been deployed yet.

### Quick Fix (2 minutes):

1. **Open Firebase Console**
   - Go to: https://console.firebase.google.com
   - Select your project: **gdcs-b5fc4**

2. **Navigate to Firestore Rules**
   - Click **Firestore Database** in the left sidebar
   - Click the **Rules** tab at the top

3. **Copy & Paste Rules**
   - Open the `firestore.rules` file in this project
   - Select all the text (Ctrl+A)
   - Copy it (Ctrl+C)
   - Paste into the Firebase Console rules editor (replacing everything)

4. **Publish**
   - Click **Publish** button
   - Wait for confirmation (usually instant)

5. **Test**
   - Refresh your app at https://gdcs.vercel.app
   - Try rating a tutor - it should work now! ✅

---

## What These Rules Do:

- ✅ **Profiles**: Anyone logged in can view, only owners can edit their own
- ✅ **Ratings**: Anyone can read, users can rate others (not themselves)
- ✅ **Validation**: Rating must be 1-5 stars, comment max 500 chars
- ✅ **Security**: Prevents self-rating, prevents deleting ratings
- ✅ **Chat**: Full access for logged-in users (hackathon mode)

---

## Alternative: Use Firebase CLI (if above doesn't work)

```bash
# Make sure you have Firebase CLI installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Deploy just the rules
firebase deploy --only firestore:rules
```

If you get a permissions error with CLI, just use the Firebase Console method above - it's easier!
