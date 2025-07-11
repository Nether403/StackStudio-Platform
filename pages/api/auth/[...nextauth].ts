/*
 * API Route: /api/auth/[...nextauth].ts
 *
 * This file configures Auth.js to handle all authentication routes.
 * It sets up the GitHub provider and uses the Firestore Adapter to
 * automatically sync users and sessions with our database.
 */

import NextAuth, { type NextAuthOptions } from "next-auth"
import GithubProvider from "next-auth/providers/github"
import { FirestoreAdapter } from "@auth/firebase-adapter"
import { db } from "../../../lib/firebase-admin"

export const authOptions: NextAuthOptions = {
  // 1. Configure the Authentication Provider (GitHub)
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],

  // 2. Use the Firestore Adapter
  // This adapter automatically handles creating users, sessions, etc.
  // in your Firestore database, following the schema we designed.
  adapter: FirestoreAdapter(db),

  // 3. Define Callbacks for Custom Actions
  callbacks: {
    /**
     * The session callback is called whenever a session is checked.
     * We use it here to add the user's unique ID (uid) to the session object,
     * so our frontend code can access it.
     */
    async session({ session, user }) {
      if (session?.user) {
        session.user.id = user.id; // Add the user ID to the session
      }
      return session;
    },

    /**
     * The signIn callback is called when a user first signs in.
     * While the adapter handles user creation, you could add custom logic here,
     * such as sending a welcome email or adding default data to the user profile.
     * For now, we just log the event.
     */
    async signIn({ user, account, profile }) {
      console.log(`User signing in: ${user.name} (${user.email})`);
      // You can check `profile` for additional data from GitHub.
      // The adapter will automatically create a document in the `users` collection.
      return true; // Return true to continue the sign-in process
    }
  },

  // 4. Configure Session Strategy
  session: {
    strategy: "database", // Use database sessions, managed by the adapter
  },

  // 5. Add Secret
  // A secret is required to sign and encrypt session cookies.
  secret: process.env.NEXTAUTH_SECRET,

  // 6. Custom Pages (Optional)
  pages: {
    signIn: '/auth/signin', // Custom sign-in page (optional)
    error: '/auth/error', // Error page (optional)
  },
};

export default NextAuth(authOptions);
