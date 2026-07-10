import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

const profileSchema = z.object({
  age: z.coerce.number().int().positive(),
  country: z.string().min(1),
  educationLevel: z.string().min(1),
  reasonStopped: z.string().min(1),
  skills: z.string().min(1),
  interests: z.string().min(1),
  hoursPerDay: z.string().min(1),
  internetAvailability: z.enum(['none', 'low', 'stable']),
  careerGoal: z.string().min(1),
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
      error: error instanceof Error ? error.message : 'Failed to fetch profile',
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
      error: error instanceof Error ? error.message : 'Failed to save profile',
    });
  }
});

// GET /api/profile/:userId - Get specific user profile
router.get('/:userId', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { userId } = req.params;

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
      error: error instanceof Error ? error.message : 'Failed to fetch user profile',
    });
  }
});

export default router;
