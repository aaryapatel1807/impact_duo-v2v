import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

// NOTE: content generation here is template-based (see /generate below).
// This file previously imported and instantiated GoogleGenerativeAI without
// ever calling it, while the docs promised AI-generated content.

const skillEntrySchema = z.object({
  lifeRole: z.string().min(1).max(100),
  mappedSkill: z.string().min(1).max(200),
  justification: z.string().min(1).max(1000),
});

const skillPassportSchema = z.object({
  skills: z.array(skillEntrySchema).max(50),
  generatedContent: z.object({
    resumeSummary: z.string().min(1).max(5000),
    bio: z.string().min(1).max(5000),
    elevatorPitch: z.string().min(1).max(5000),
  }),
});

const generateSkillPassportSchema = z.object({
  selectedRoles: z.array(z.string().min(1).max(50)).min(1).max(20),
});

// GET /api/skill-passport
router.get('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const [skillEntries, generatedContent] = await Promise.all([
      prisma.skillPassportEntry.findMany({
        where: { userId: req.user!.id },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.generatedContent.findUnique({
        where: { userId: req.user!.id },
      }),
    ]);

    return res.json({
      success: true,
      skillEntries,
      generatedContent,
    });
  } catch (error) {
    console.error('Error fetching skill passport:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch skill passport',
    });
  }
});

// POST /api/skill-passport
router.post('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const validatedData = skillPassportSchema.parse(req.body);

    // Delete + recreate + upsert must be atomic: as separate awaits, a
    // failure after the delete permanently wiped the user's skill passport.
    const [skillEntries, generatedContent] = await prisma.$transaction(async (tx) => {
      await tx.skillPassportEntry.deleteMany({
        where: { userId: req.user!.id },
      });

      const entries = await tx.skillPassportEntry.createMany({
        data: validatedData.skills.map((skill) => ({
          userId: req.user!.id,
          ...skill,
        })),
      });

      const content = await tx.generatedContent.upsert({
        where: { userId: req.user!.id },
        create: {
          userId: req.user!.id,
          ...validatedData.generatedContent,
        },
        update: validatedData.generatedContent,
      });

      return [entries, content] as const;
    });

    return res.json({
      success: true,
      skillEntriesCount: skillEntries.count,
      generatedContent,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.issues,
      });
    }

    console.error('Error saving skill passport:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to save skill passport',
    });
  }
});

// POST /api/skill-passport/generate
router.post('/generate', requireAuth, async (req: AuthRequest, res) => {
  try {
    const body = generateSkillPassportSchema.parse(req.body);
    const { selectedRoles } = body;

    const profile = await prisma.profile.findUnique({
      where: { userId: req.user!.id },
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: 'Profile not found. Please complete onboarding.',
      });
    }

    // Life role mapping
    const lifeRoleMapping: Record<string, { skill: string; justification: string }> = {
      homemaker: {
        skill: 'Budget & Cash Flow Management',
        justification: 'Managing household expenses requires tracking income, prioritizing needs, and planning for irregular costs.',
      },
      caregiver: {
        skill: 'Crisis Management & Problem-Solving',
        justification: 'Responding to urgent needs, staying calm under pressure, and making quick decisions are core leadership competencies.',
      },
      cook: {
        skill: 'Operations & Resource Planning',
        justification: 'Coordinating multiple dishes, timing, and ingredient prep is operations management.',
      },
      tutor: {
        skill: 'Communication & Instructional Design',
        justification: 'Breaking complex ideas into simple steps and adapting to different learning styles.',
      },
      tailor: {
        skill: 'Entrepreneurship & Production Management',
        justification: 'Taking orders, managing materials, meeting deadlines, and pricing work are small business operations.',
      },
      organizer: {
        skill: 'Stakeholder Coordination & Networking',
        justification: 'Bringing people together, building consensus, and managing group activities are key project management skills.',
      },
    };

    // Map selected roles to skills
    const mappedSkills = selectedRoles
      .map((roleId) => {
        const mapping = lifeRoleMapping[roleId];
        if (!mapping) return null;

        return {
          lifeRole: roleId.charAt(0).toUpperCase() + roleId.slice(1),
          mappedSkill: mapping.skill,
          justification: mapping.justification,
        };
      })
      .filter((s): s is NonNullable<typeof s> => s !== null);

    if (mappedSkills.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid roles selected',
      });
    }

    // Build the content from templates (deterministic; no AI call is made —
    // docs/UI copy should describe it that way)
    const templateContent = {
      resumeSummary: `Resourceful professional with hands-on experience in ${mappedSkills.map((s) => s.mappedSkill).join(' and ').toLowerCase()}. Proven track record of managing complex responsibilities.`,
      bio: `I'm a dedicated professional who has built valuable expertise through real-world experience. My background has taught me ${mappedSkills[0]?.mappedSkill.toLowerCase()}, effective communication, and adaptability.`,
      elevatorPitch: `I've spent years managing responsibilities, solving problems, and delivering results. I bring experience in ${mappedSkills[0]?.mappedSkill.toLowerCase()} and a proven ability to learn quickly.`,
    };

    // Save entries + content atomically (same wipe risk as POST / above)
    const generatedContent = await prisma.$transaction(async (tx) => {
      await tx.skillPassportEntry.deleteMany({
        where: { userId: req.user!.id },
      });

      await tx.skillPassportEntry.createMany({
        data: mappedSkills.map((skill) => ({
          userId: req.user!.id,
          ...skill,
        })),
      });

      return tx.generatedContent.upsert({
        where: { userId: req.user!.id },
        create: {
          userId: req.user!.id,
          ...templateContent,
        },
        update: templateContent,
      });
    });

    return res.json({
      success: true,
      skillEntries: mappedSkills,
      generatedContent,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.issues,
      });
    }

    console.error('Error generating skill passport:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to generate skill passport',
    });
  }
});

export default router;
