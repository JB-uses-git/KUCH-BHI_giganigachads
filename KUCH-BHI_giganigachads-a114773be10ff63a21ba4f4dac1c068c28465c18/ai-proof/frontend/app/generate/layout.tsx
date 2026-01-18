import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Generate & Stamp | AI-PROOF',
  description: 'Embed invisible watermark into images',
};

export default function GenerateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
