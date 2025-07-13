import dynamic from 'next/dynamic';

// Import the responsive dashboard with SSR disabled to prevent hydration issues
const ResponsiveDashboard = dynamic(
  () => import('../components/ResponsiveDashboard'),
  { ssr: false }
);

export default function ResponsiveDashboardDemo() {
  return (
    <div>
      <ResponsiveDashboard />
    </div>
  );
}
