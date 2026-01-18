import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pipeline | AI-PROOF',
  description: 'Test watermark resilience against attacks',
};

export default function PipelineLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
