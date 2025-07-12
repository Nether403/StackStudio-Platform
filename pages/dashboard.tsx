import Dashboard from '../components/Dashboard';
import Head from 'next/head';

export default function DashboardPage() {
  return (
    <>
      <Head>
        <title>Dashboard - StackFast</title>
        <meta name="description" content="Manage your project blueprints and saved configurations" />
      </Head>
      <Dashboard />
    </>
  );
} 