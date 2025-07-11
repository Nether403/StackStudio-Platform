/** @type {import('next').NextConfig} */

// Environment-based configuration for Blue-Green deployments
const isProduction = process.env.NODE_ENV === 'production';
const isVercelPreview = process.env.VERCEL_ENV === 'preview';
const isStaging = process.env.NEXT_PUBLIC_ENVIRONMENT === 'staging' || isVercelPreview;

// Firebase project configuration
const getFirebaseConfig = () => {
  if (isProduction && !isStaging) {
    // Production environment
    return {
      FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    };
  } else {
    // Staging/Preview environment - use test Firebase project
    return {
      FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID_STAGING || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY_STAGING || process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN_STAGING || process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET_STAGING || process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID_STAGING || process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID_STAGING || process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    };
  }
};

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Environment-specific configuration
  env: {
    ...getFirebaseConfig(),
    NEXT_PUBLIC_ENVIRONMENT: isStaging ? 'staging' : (isProduction ? 'production' : 'development'),
    NEXT_PUBLIC_VERCEL_ENV: process.env.VERCEL_ENV || 'development',
  },

  // Public runtime configuration
  publicRuntimeConfig: {
    environment: isStaging ? 'staging' : (isProduction ? 'production' : 'development'),
    isStaging,
    isProduction,
    isVercelPreview,
  },

  // Rewrites for staging environment
  async rewrites() {
    const rewrites = [
      {
        source: '/api/:path*',
        destination: '/api/:path*'
      }
    ];

    // Add staging-specific rewrites
    if (isStaging) {
      rewrites.push({
        source: '/staging-info',
        destination: '/api/staging-info'
      });
    }

    return rewrites;
  },

  // Headers for environment identification
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Environment',
            value: isStaging ? 'staging' : (isProduction ? 'production' : 'development'),
          },
          {
            key: 'X-Vercel-Environment',
            value: process.env.VERCEL_ENV || 'development',
          },
        ],
      },
    ];
  },

  // Development-specific configuration
  ...(!isProduction && {
    experimental: {
      // Enable helpful dev features
      optimizeCss: false,
      scrollRestoration: true,
    },
  }),
};

// Log environment configuration
console.log('🔧 Next.js Configuration:');
console.log(`   Environment: ${isStaging ? 'staging' : (isProduction ? 'production' : 'development')}`);
console.log(`   Firebase Project: ${getFirebaseConfig().FIREBASE_PROJECT_ID}`);
console.log(`   Vercel Environment: ${process.env.VERCEL_ENV || 'local'}`);

module.exports = nextConfig;
