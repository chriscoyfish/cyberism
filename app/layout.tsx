import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Cyberism // GenAI Cyberpunk Red RPG Adventure',
  description:
    'A server-side GenAI-powered Cyberpunk text adventure roleplaying game set in Night City. Play as detective Senna Bladesmith with dynamic Gemini AI referee, dice rolls, and persistent game state saving.',
  keywords: ['Cyberpunk', 'Gemini AI', 'RPG', 'Text Adventure', 'Edgerunners', 'Cyberpunk Red'],
  authors: [{ name: "Chris 'Coy' Coykendall" }],
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
