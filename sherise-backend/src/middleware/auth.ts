import { Request, Response, NextFunction } from 'express';
import { clerkClient, verifyToken } from '@clerk/express';
import { Prisma } from '@prisma/client';
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
  // Get token from Authorization header
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized - please sign in'
    });
  }

  // Verify the session token. A failure HERE is a genuine auth failure (401).
  // Infrastructure failures further down return 500 instead — previously one
  // catch-all returned 401 for everything, so DB/Clerk outages masqueraded
  // as "please sign in" and were undebuggable from the client.
  let userId: string | undefined;
  try {
    const sessionClaims = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
    });
    userId = sessionClaims.sub;
  } catch (error) {
    console.error('Token verification failed:', error);
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired token'
    });
  }

  if (!userId) {
    return res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }

  try {
    // Fast path: user already synced — no Clerk API round-trip needed
    // (previously getUser was called on EVERY authenticated request).
    let dbUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    // First request for this user: fetch from Clerk once and create the row.
    if (!dbUser) {
      const clerkUser = await clerkClient.users.getUser(userId);
      const email = clerkUser.emailAddresses[0]?.emailAddress;

      if (!email) {
        // Never write '' into the @unique email column — a second email-less
        // user would collide with the first and fail every login.
        console.error(`Clerk user ${userId} has no email address; cannot create account row`);
        return res.status(500).json({
          success: false,
          error: 'Account is missing an email address'
        });
      }

      try {
        dbUser = await prisma.user.create({
          data: {
            id: userId,
            email,
            name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'User',
            imageUrl: clerkUser.imageUrl || null,
            username: clerkUser.username || null,
          },
          include: { profile: true },
        });
      } catch (error) {
        // Parallel first requests race the create: the loser gets a unique
        // violation (P2002) — re-read the row the winner created instead of
        // failing the login (previously this surfaced as a spurious 401).
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
          dbUser = await prisma.user.findUnique({
            where: { id: userId },
            include: { profile: true },
          });
        } else {
          throw error;
        }
      }
    }

    if (!dbUser) {
      return res.status(500).json({
        success: false,
        error: 'Failed to load user account'
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
    return res.status(500).json({
      success: false,
      error: 'Authentication service error'
    });
  }
}
