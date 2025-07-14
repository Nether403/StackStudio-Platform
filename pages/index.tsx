// Main entry point for StackFast application - SSR Enabled
// This page uses Server-Side Rendering to prevent blank page issues

import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './api/auth/[...nextauth]';
import { Session } from 'next-auth';
import SimpleDemoPage from '../components/SimpleDemoPage';

interface HomeProps {
  session: Session | null;
}

export default function Home({ session }: HomeProps) {
  return <SimpleDemoPage />;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);

  return {
    props: {
      session,
    },
  };
};
