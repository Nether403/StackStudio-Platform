/*
 * API Route: /api/blueprints.ts
 *
 * This endpoint handles all CRUD (Create, Read, Update, Delete) operations
 * for a user's saved blueprints. It's protected and ensures users can only
 * access their own data.
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import { db } from "../../lib/firebase-admin";
import type { AuthOptions } from "next-auth";

// Extend the session type to include the user id
interface ExtendedSession {
  user?: {
    id?: string;
    email?: string | null;
    name?: string | null;
    image?: string | null;
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // 1. Get the user's session to ensure they are logged in.
  const session = await getServerSession(req, res, authOptions as AuthOptions) as ExtendedSession;

  if (!session || !session.user) {
    return res.status(401).json({ error: "Unauthorized. You must be logged in." });
  }

  const userId = session.user.id || session.user.email; // Get the user's unique ID from the session

  if (!userId) {
    return res.status(401).json({ error: "Unable to identify user." });
  }

  // 2. Handle the request based on the HTTP method.
  switch (req.method) {
    // --- CASE GET: Fetch all blueprints for the current user ---
    case 'GET':
      try {
        const blueprintsRef = db.collection("blueprints");
        // Create a query to get documents where the userId matches the session user's ID
        const querySnapshot = await blueprintsRef.where("userId", "==", userId).get();
        
        const userBlueprints = querySnapshot.docs.map((doc: any) => ({
          id: doc.id,
          ...doc.data(),
        }));

        res.status(200).json(userBlueprints);
      } catch (error) {
        console.error("Error fetching blueprints:", error);
        res.status(500).json({ error: "Failed to fetch blueprints." });
      }
      break;

    // --- CASE POST: Save a new blueprint for the current user ---
    case 'POST':
      try {
        const { projectName, projectIdea, blueprintData } = req.body;

        // Basic validation
        if (!projectName || !blueprintData) {
          return res.status(400).json({ error: "Missing projectName or blueprintData." });
        }

        const newBlueprint = {
          userId,
          projectName,
          projectIdea,
          blueprintData,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        // Add the new document to the 'blueprints' collection
        const docRef = await db.collection("blueprints").add(newBlueprint);

        res.status(201).json({ 
          success: true,
          blueprintId: docRef.id, 
          ...newBlueprint 
        });
      } catch (error) {
        console.error("Error saving blueprint:", error);
        res.status(500).json({ error: "Failed to save blueprint." });
      }
      break;

    // --- CASE DELETE: Delete a specific blueprint ---
    case 'DELETE':
      try {
        const { blueprintId } = req.query;

        if (!blueprintId || typeof blueprintId !== 'string') {
          return res.status(400).json({ error: "Missing or invalid blueprintId." });
        }

        // First, verify the blueprint belongs to the current user
        const blueprintRef = db.collection("blueprints").doc(blueprintId);
        const blueprintDoc = await blueprintRef.get();

        if (!blueprintDoc.exists) {
          return res.status(404).json({ error: "Blueprint not found." });
        }

        const blueprintData = blueprintDoc.data();
        if (blueprintData?.userId !== userId) {
          return res.status(403).json({ error: "Forbidden. You can only delete your own blueprints." });
        }

        // Delete the blueprint
        await blueprintRef.delete();

        res.status(200).json({ 
          success: true, 
          message: "Blueprint deleted successfully.",
          blueprintId 
        });
      } catch (error) {
        console.error("Error deleting blueprint:", error);
        res.status(500).json({ error: "Failed to delete blueprint." });
      }
      break;

    default:
      // Handle any other HTTP methods
      res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
