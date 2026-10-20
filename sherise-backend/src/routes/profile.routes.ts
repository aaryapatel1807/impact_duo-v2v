import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { normalizeEducationLevel } from '../lib/education';

const router = Router();

const profileSchema = z.object({
  age: z.coerce.number().int().min(10).max(100),
  country: z.string().min(1).max(100),
  // Normalised to the canonical vocabulary the matcher understands, so an
  // alternate spelling can never silently break education matching later.
  educationLevel: z.string().min(1).max(100)
    .transform((value) => normalizeEducationLevel(value) ?? value),
  reasonStopped: z.string().min(1).max(500),
  skills: z.string().min(1).max(2000),
  interests: z.string().min(1).max(2000),
  hoursPerDay: z.string().min(1).max(50),
  internetAvailability: z.enum(['none', 'low', 'stable']),
  careerGoal: z.string().min(1).max(1000),
});

// GET /api/profile - Get authenticated user's profile
router.get('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const profile = await prisma.profile.findUnique({
      where: { userId: req.user!.id },
    });

    return res.json({
      success: true,
      user: {
        id: req.user!.id,
        name: req.user!.name,
        email: req.user!.email,
        imageUrl: req.user!.imageUrl,
        username: req.user!.username,
        profile,
      },
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch profile',
    });
  }
});

// POST /api/profile - Create or update profile
router.post('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const validatedData = profileSchema.parse(req.body);

    const profile = await prisma.profile.upsert({
      where: { userId: req.user!.id },
      create: {
        userId: req.user!.id,
        ...validatedData,
      },
      update: validatedData,
    });

    // Initialize progress log if doesn't exist
    const existingProgress = await prisma.progressLog.findFirst({
      where: { userId: req.user!.id },
    });

    if (!existingProgress) {
      await prisma.progressLog.create({
        data: {
          userId: req.user!.id,
          tasksCompleted: 0,
          confidenceScore: 5,
          streakCount: 0,
          currentStepIndex: 0,
          xpEarned: 0,
        },
      });
    }

    return res.json({
      success: true,
      user: {
        id: req.user!.id,
        name: req.user!.name,
        email: req.user!.email,
        imageUrl: req.user!.imageUrl,
      },
      profile,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.issues,
      });
    }

    console.error('Error saving profile:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to save profile',
    });
  }
});

// GET /api/profile/:userId - Get a user's profile (owner only: this returns
// email, age and career-gap details, so it was an IDOR for any signed-in user)
router.get('/:userId', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;

    if (userId !== req.user!.id) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden - you can only access your own profile',
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    return res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        imageUrl: user.imageUrl,
        username: user.username,
        profile: user.profile,
      },
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch user profile',
    });
  }
});

export default router;
