// Main entry point for StackFast application - SSR Disabled
// This page renders the complete application with authentication

import dynamic from 'next/dynamic';

// Disable SSR for the entire app to prevent authentication and Firebase issues
const StackFastApp = dynamic(
  () => import('../components/StackFastApp'),
  { ssr: false }
);

export default function Home() {
  return <StackFastApp />;
}
