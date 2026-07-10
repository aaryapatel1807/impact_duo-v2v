import { Request, Response, NextFunction } from 'express';
import { clerkClient } from '@clerk/clerk-sdk-node';
import { prisma } from '../lib/prisma';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    imageUrl: string | null;
    username: string | null;
    profile: any;
    createdAt: Date;
  };
}

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    // Get token from Authorization header
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized - please sign in'
      });
    }

    // Verify token with Clerk
    const sessionClaims = await clerkClient.verifyToken(token);
    const userId = sessionClaims.sub;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    }

    // Get user from Clerk
    const clerkUser = await clerkClient.users.getUser(userId);

    // Ensure user exists in database
    let dbUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    // Create user if doesn't exist
    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          id: userId,
          email: clerkUser.emailAddresses[0]?.emailAddress || '',
          name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'User',
          imageUrl: clerkUser.imageUrl || null,
          username: clerkUser.username || null,
        },
        include: { profile: true },
      });
    }

    // Attach user to request
    req.user = {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      imageUrl: dbUser.imageUrl,
      username: dbUser.username,
      profile: dbUser.profile,
      createdAt: dbUser.createdAt,
    };

    next();
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(401).json({
      success: false,
      error: 'Authentication failed'
    });
  }
}
