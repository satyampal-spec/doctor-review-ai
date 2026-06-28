import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'ClinicReview AI — Google Review Generator for Doctors',
  description:
    'AI-powered Google review assistant for clinics. Patients scan a QR code and get a personalised, authentic review in seconds.',
  keywords: 'doctor reviews, clinic google reviews, healthcare reputation, AI review generator',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
