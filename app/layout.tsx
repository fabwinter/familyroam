import type { Metadata } from 'next';
import './globals.css';
import Nav from '@/components/Nav';

export const metadata: Metadata = {
  title: {
    default: 'FamilyRoam – Find your perfect family-friendly city',
    template: '%s | FamilyRoam',
  },
  description:
    'Discover the best cities for families living abroad. Compare cost of living, safety, schools, and more.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <Nav />
        <main>{children}</main>
      </body>
    </html>
  );
}
