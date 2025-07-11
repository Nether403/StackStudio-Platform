// Next.js App component - Global configuration and styles
// This wraps all pages with necessary providers and styles

import type { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';
import Head from 'next/head';
import '../styles/globals.css';

export default function App({ 
  Component, 
  pageProps: { session, ...pageProps } 
}: AppProps) {
  return (
    <SessionProvider session={session}>
      <Head>
        <title>StackFast - AI-Powered Tech Stack Recommendations</title>
        <meta name="description" content="Get personalized technology stack recommendations powered by AI. Build better projects faster with StackFast." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://stackfast.dev/" />
        <meta property="og:title" content="StackFast - AI-Powered Tech Stack Recommendations" />
        <meta property="og:description" content="Get personalized technology stack recommendations powered by AI. Build better projects faster with StackFast." />
        <meta property="og:image" content="/og-image.png" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://stackfast.dev/" />
        <meta property="twitter:title" content="StackFast - AI-Powered Tech Stack Recommendations" />
        <meta property="twitter:description" content="Get personalized technology stack recommendations powered by AI. Build better projects faster with StackFast." />
        <meta property="twitter:image" content="/og-image.png" />
      </Head>
      <Component {...pageProps} />
    </SessionProvider>
  );
}
