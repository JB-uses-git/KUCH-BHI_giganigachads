import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Detect | AI-PROOF',
  description: 'Detect AI-generated images and watermarks',
};

export default function DetectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
