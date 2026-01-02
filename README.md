# SASTRA Tutor Connect

A web application for SASTRA students to find tutors and teammates for projects and hackathons.

## Features

- 🔐 **Google Authentication** - Login with your SASTRA college email (@sastra.ac.in)
- 📚 **Tutor Matching** - Find tutors or become one to help other students
- 👥 **Teammate Finder** - Connect with students for hackathons and projects
- 🎨 **Beautiful UI** - Modern, responsive design with Tailwind CSS

## Quick Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (or use existing one)
3. Enable Google Authentication:
   - Go to Authentication > Sign-in method
   - Enable Google provider
   - Add your domain to authorized domains
4. Get your Firebase config:
   - Go to Project Settings > Your Apps > Web App
   - Copy the configuration
5. Update `lib/firebase-config.ts` with your Firebase credentials

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Important Notes for Demo

- The app currently uses **mock data** for tutors and teammates
- To make it production-ready, you'll need to:
  - Set up Firebase Firestore for data storage
  - Implement actual CRUD operations
  - Add real-time updates

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Firebase** - Authentication
- **Lucide React** - Icons

## Project Structure

```
├── app/
│   ├── page.tsx          # Login page
│   ├── dashboard/        # Main dashboard
│   ├── tutors/           # Tutor matching page
│   └── teammates/        # Teammate finder page
├── lib/
│   ├── firebase.ts       # Firebase initialization
│   ├── firebase-config.ts # Firebase configuration
│   └── AuthContext.tsx   # Authentication context
└── types/
    └── index.ts          # TypeScript types
```

## Presentation Tips

1. **Show the login flow** - Demonstrate SASTRA email restriction
2. **Navigate through features** - Show both tutor matching and teammate finding
3. **Highlight the UI** - Point out the modern, professional design
4. **Discuss scalability** - Mention how you'd add database integration for production

## Future Enhancements

- Real-time chat between users
- Calendar integration for scheduling
- Rating and review system
- Email notifications
- Mobile app version

## License

MIT
