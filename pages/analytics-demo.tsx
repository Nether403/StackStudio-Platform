import dynamic from 'next/dynamic';

// Disable SSR for the entire analytics demo page to prevent AuthProvider issues
const AnalyticsDemo = dynamic(
  () => import('../components/AnalyticsDemoPage'),
  { ssr: false }
);

export default AnalyticsDemo;
