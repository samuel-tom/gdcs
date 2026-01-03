import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/AuthContext';
import ChatbotBubble from '@/components/ChatbotBubble';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SASTRA Tutor Connect',
  description: 'Connect with tutors and find teammates at SASTRA',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <ChatbotBubble />
        </AuthProvider>
      </body>
    </html>
  );
}
