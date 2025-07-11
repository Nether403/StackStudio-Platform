#!/usr/bin/env node

// Environment validation script for StackStudio
// Validates required environment variables on startup

import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

interface EnvConfig {
  required: string[];
  optional: string[];
  development?: string[];
  production?: string[];
}

const ENV_CONFIG: EnvConfig = {
  required: [
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
  ],
  optional: [
    'FIREBASE_PRIVATE_KEY',
    'FIREBASE_CLIENT_EMAIL',
    'GITHUB_CLIENT_ID',
    'GITHUB_CLIENT_SECRET',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'OPENAI_API_KEY',
  ],
  development: [
    'NODE_ENV',
  ],
  production: [
    'NODE_ENV',
    'FIREBASE_PRIVATE_KEY',
    'FIREBASE_CLIENT_EMAIL',
  ],
};

class EnvValidator {
  private errors: string[] = [];
  private warnings: string[] = [];
  private isProduction: boolean;

  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  private checkVariable(name: string, isRequired: boolean = true): void {
    const value = process.env[name];
    
    if (!value) {
      if (isRequired) {
        this.errors.push(`❌ Missing required environment variable: ${name}`);
      } else {
        this.warnings.push(`⚠️  Optional environment variable not set: ${name}`);
      }
      return;
    }

    // Additional validation for specific variables
    if (name === 'NEXTAUTH_URL' && !this.isValidUrl(value)) {
      this.errors.push(`❌ Invalid URL format for ${name}: ${value}`);
    }

    if (name === 'NEXT_PUBLIC_FIREBASE_PROJECT_ID' && !this.isValidProjectId(value)) {
      this.errors.push(`❌ Invalid Firebase project ID format: ${value}`);
    }

    if (name === 'NEXTAUTH_SECRET' && value.length < 32) {
      this.warnings.push(`⚠️  NEXTAUTH_SECRET should be at least 32 characters long`);
    }

    console.log(`✅ ${name}: ${this.maskValue(name, value)}`);
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  private isValidProjectId(projectId: string): boolean {
    // Firebase project IDs must be 6-30 characters, lowercase, numbers, and hyphens
    return /^[a-z0-9-]{6,30}$/.test(projectId);
  }

  private maskValue(name: string, value: string): string {
    // Mask sensitive values
    const sensitiveKeys = ['SECRET', 'KEY', 'PASSWORD', 'TOKEN'];
    
    if (sensitiveKeys.some(key => name.includes(key))) {
      return '*'.repeat(Math.min(value.length, 8));
    }
    
    // Show first few characters for identifiers
    if (name.includes('ID') || name.includes('PROJECT')) {
      return value.length > 10 ? `${value.substring(0, 8)}...` : value;
    }
    
    return value;
  }

  private loadEnvFile(path: string): void {
    if (!existsSync(path)) return;

    try {
      const content = readFileSync(path, 'utf8');
      const lines = content.split('\n');
      
      lines.forEach(line => {
        const match = line.match(/^([A-Z_]+)=(.*)$/);
        if (match && !process.env[match[1]]) {
          process.env[match[1]] = match[2];
        }
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.warnings.push(`⚠️  Could not load ${path}: ${message}`);
    }
  }

  public validate(): boolean {
    console.log('🔍 Validating environment configuration...\n');

    // Load environment files
    this.loadEnvFile('.env.local');
    this.loadEnvFile('.env');

    // Check required variables
    ENV_CONFIG.required.forEach(name => {
      this.checkVariable(name, true);
    });

    // Check environment-specific variables
    if (this.isProduction && ENV_CONFIG.production) {
      ENV_CONFIG.production.forEach(name => {
        this.checkVariable(name, true);
      });
    } else if (!this.isProduction && ENV_CONFIG.development) {
      ENV_CONFIG.development.forEach(name => {
        this.checkVariable(name, false);
      });
    }

    // Check optional variables
    ENV_CONFIG.optional.forEach(name => {
      this.checkVariable(name, false);
    });

    // Display results
    console.log('\n' + '='.repeat(50));
    
    if (this.errors.length > 0) {
      console.log('\n🚨 Environment validation failed:');
      this.errors.forEach(error => console.log(error));
      
      console.log('\n📋 To fix these issues:');
      console.log('1. Create .env.local file in your project root');
      console.log('2. Add the missing environment variables');
      console.log('3. Restart your development server');
      console.log('4. Check the README.md for configuration examples');
      
      return false;
    }

    if (this.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      this.warnings.forEach(warning => console.log(warning));
    }

    console.log('\n✅ Environment validation passed!');
    console.log(`🌍 Running in ${this.isProduction ? 'production' : 'development'} mode`);
    
    return true;
  }

  public static generateTemplate(): string {
    return `# StackStudio Environment Configuration Template
# Copy this to .env.local and fill in your values

# Firebase Configuration (Required)
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# NextAuth Configuration (Required)
NEXTAUTH_SECRET=your-secret-key-at-least-32-characters-long
NEXTAUTH_URL=http://localhost:3000

# Firebase Admin SDK (Required for production)
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nYOUR_PRIVATE_KEY\\n-----END PRIVATE KEY-----\\n"
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com

# OAuth Providers (Optional)
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# AI Services (Optional)
OPENAI_API_KEY=your-openai-api-key

# Environment
NODE_ENV=development
`;
  }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  
  if (args.includes('--template')) {
    console.log(EnvValidator.generateTemplate());
    process.exit(0);
  }
  
  if (args.includes('--help')) {
    console.log(`
StackStudio Environment Validator

Usage:
  node scripts/check-env.js            Validate environment
  node scripts/check-env.js --template Generate .env template
  node scripts/check-env.js --help     Show this help

Environment variables are loaded from:
  1. System environment
  2. .env.local
  3. .env
`);
    process.exit(0);
  }

  const validator = new EnvValidator();
  const isValid = validator.validate();
  
  process.exit(isValid ? 0 : 1);
}

export default EnvValidator;
