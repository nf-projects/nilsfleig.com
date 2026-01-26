import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Vocabulary',
  description: 'Adaptive vocabulary learning with spaced repetition',
};

export default function VocabLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
