import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pkg from 'pg';
const { Pool } = pkg;

// Load environment variables
config({ path: '.env.local' });
config({ path: '.env' });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting seed...');

  // Create Priya - the demo user matching PRD persona exactly
  const priya = await prisma.user.upsert({
    where: { email: 'priya.demo@sherise.app' },
    update: {},
    create: {
      name: 'Priya',
      email: 'priya.demo@sherise.app',
      profile: {
        create: {
          age: 27,
          country: 'India',
          educationLevel: 'Higher Secondary (Grade 11-12)',
          reasonStopped: 'Marriage and caregiving responsibilities',
          skills: 'Tutoring children, tailoring, household budgeting, cooking',
          interests: 'Education, small business, crafts',
          hoursPerDay: '1-2 hours',
          internetAvailability: 'low',
          careerGoal: 'I want to earn independently, maybe start a small tailoring business or work remotely as a tutor',
        },
      },
      progressLogs: {
        create: {
          tasksCompleted: 0,
          confidenceScore: 5,
          streakCount: 0,
          currentStepIndex: 0,
        },
      },
    },
  });

  console.log('✅ Created demo user: Priya');

  // Seed realistic opportunities
  const opportunities = [
    {
      title: 'Women in Tech Scholarship',
      organization: 'IEEE WiE',
      type: 'scholarship',
      description: 'Full scholarship for women pursuing STEM education, includes laptop and internet stipend for online learning',
      region: ['India', 'Global'],
      minAge: 18,
      maxAge: 35,
      minEducation: ['Higher Secondary (Grade 11-12)', 'Some College', 'Bachelor Degree'],
      tags: ['technology', 'education', 'STEM', 'online-learning'],
      url: 'https://wie.ieee.org',
      deadline: 'March 2026',
    },
    {
      title: 'Digital Sakhi Program',
      organization: 'Ministry of Rural Development, India',
      type: 'program',
      description: 'Government program training women as digital literacy ambassadors in rural communities, no prior tech experience required',
      region: ['India'],
      minAge: 18,
      maxAge: 45,
      minEducation: ['Secondary (Grade 9-10)', 'Higher Secondary (Grade 11-12)'],
      tags: ['digital-literacy', 'community', 'government', 'offline'],
      url: 'https://rural.nic.in',
      deadline: 'Ongoing',
    },
    {
      title: 'Freelance Content Writing Opportunities',
      organization: 'Upwork / Fiverr',
      type: 'job',
      description: 'Remote writing opportunities for blogs, social media, and educational content. Flexible hours, work from home',
      region: ['Global'],
      minAge: 18,
      maxAge: null,
      minEducation: ['Higher Secondary (Grade 11-12)', 'Some College', "Bachelor Degree"],
      tags: ['writing', 'communication', 'remote-work', 'tutoring', 'education'],
      url: 'https://upwork.com',
      deadline: null,
    },
    {
      title: 'MUDRA Loan for Women Entrepreneurs',
      organization: 'MUDRA / SIDBI',
      type: 'grant',
      description: 'Micro-financing up to ₹10 lakh for women-owned small businesses like tailoring, crafts, home-based businesses. No collateral required',
      region: ['India'],
      minAge: 18,
      maxAge: null,
      minEducation: ['Primary (Grade 1-8)', 'Secondary (Grade 9-10)', 'Higher Secondary (Grade 11-12)', 'Some College'],
      tags: ['entrepreneurship', 'tailoring', 'crafts', 'small-business', 'financing'],
      url: 'https://udyamimitra.in',
      deadline: 'Ongoing',
    },
    {
      title: 'Virtual Assistant Training Bootcamp',
      organization: 'SheMeansBusiness (Meta)',
      type: 'program',
      description: 'Free 6-week training in remote administrative work, email management, and digital tools. Includes job placement support',
      region: ['India', 'Southeast Asia'],
      minAge: 18,
      maxAge: 40,
      minEducation: ['Higher Secondary (Grade 11-12)', 'Some College'],
      tags: ['remote-work', 'digital-skills', 'administration', 'training'],
      url: 'https://www.facebook.com/business/boost/resource/she-means-business',
      deadline: 'January 2027',
    },
    {
      title: 'Online Tutoring Platform Instructor',
      organization: 'Vedantu / Byjus',
      type: 'job',
      description: 'Part-time online teaching for K-12 students. Flexible hours, teach from home. Prior teaching or tutoring experience valued',
      region: ['India'],
      minAge: 21,
      maxAge: null,
      minEducation: ['Higher Secondary (Grade 11-12)', 'Some College', "Bachelor Degree"],
      tags: ['tutoring', 'education', 'teaching', 'remote-work', 'communication'],
      url: 'https://careers.vedantu.com',
      deadline: null,
    },
    {
      title: 'Women Entrepreneurship Platform',
      organization: 'NITI Aayog',
      type: 'program',
      description: 'Incubation support, mentorship, and funding access for women-led startups in any sector including crafts, education, services',
      region: ['India'],
      minAge: 21,
      maxAge: null,
      minEducation: ['Higher Secondary (Grade 11-12)', 'Some College', "Bachelor Degree"],
      tags: ['entrepreneurship', 'startup', 'mentorship', 'funding', 'small-business'],
      url: 'https://wep.gov.in',
      deadline: 'Ongoing',
    },
    {
      title: 'Coursera Financial Aid',
      organization: 'Coursera',
      type: 'scholarship',
      description: '100% financial aid for professional certificates in tech, business, data science, and digital marketing. Self-paced online learning',
      region: ['Global'],
      minAge: 16,
      maxAge: null,
      minEducation: ['Secondary (Grade 9-10)', 'Higher Secondary (Grade 11-12)', 'Some College', "Bachelor Degree"],
      tags: ['online-learning', 'technology', 'business', 'education', 'certification'],
      url: 'https://www.coursera.org/financial-aid',
      deadline: 'Apply anytime',
    },
    {
      title: 'ASHA Community Health Worker',
      organization: 'National Health Mission',
      type: 'job',
      description: 'Part-time work providing health education and support in local communities. Government-backed role with regular stipend',
      region: ['India'],
      minAge: 21,
      maxAge: 45,
      minEducation: ['Secondary (Grade 9-10)', 'Higher Secondary (Grade 11-12)'],
      tags: ['community', 'healthcare', 'social-work', 'offline', 'government'],
      url: 'https://nhm.gov.in/communitisation/asha.html',
      deadline: 'Ongoing',
    },
    {
      title: 'Etsy / Amazon Handmade Seller',
      organization: 'E-commerce Platforms',
      type: 'job',
      description: 'Sell handmade crafts, tailoring work, and artisan products globally through online marketplaces. Work from home, set your own prices',
      region: ['Global'],
      minAge: 18,
      maxAge: null,
      minEducation: ['Primary (Grade 1-8)', 'Secondary (Grade 9-10)', 'Higher Secondary (Grade 11-12)', 'Some College'],
      tags: ['crafts', 'tailoring', 'entrepreneurship', 'e-commerce', 'handmade'],
      url: 'https://www.etsy.com/sell',
      deadline: null,
    },
    {
      title: 'Skill India Digital Free Learning',
      organization: 'Ministry of Skill Development & Entrepreneurship',
      type: 'program',
      description: 'Free government-backed skill training courses in multiple languages including offline and online options. Certificates provided',
      region: ['India'],
      minAge: 15,
      maxAge: null,
      minEducation: ['Primary (Grade 1-8)', 'Secondary (Grade 9-10)', 'Higher Secondary (Grade 11-12)', 'Some College'],
      tags: ['education', 'skills', 'government', 'certification', 'offline', 'online-learning'],
      url: 'https://www.skillindiadigital.gov.in',
      deadline: 'Ongoing',
    },
    {
      title: 'Stand-Up India Scheme',
      organization: 'Department of Financial Services',
      type: 'grant',
      description: 'Bank loans between ₹10 lakh to ₹1 crore for women entrepreneurs to set up greenfield enterprises in manufacturing, services, or trading',
      region: ['India'],
      minAge: 18,
      maxAge: null,
      minEducation: ['Secondary (Grade 9-10)', 'Higher Secondary (Grade 11-12)', 'Some College', "Bachelor Degree"],
      tags: ['entrepreneurship', 'financing', 'manufacturing', 'small-business', 'government'],
      url: 'https://www.standupmitra.in',
      deadline: 'Ongoing',
    },
    {
      title: 'Google Career Certificates Scholarship',
      organization: 'Google.org / Coursera',
      type: 'scholarship',
      description: '100,000 scholarships for career certificates in Data Analytics, Project Management, UX Design, and IT Support. No degree required',
      region: ['Global'],
      minAge: 18,
      maxAge: null,
      minEducation: ['Higher Secondary (Grade 11-12)', 'Some College'],
      tags: ['technology', 'online-learning', 'certification', 'IT', 'data', 'design'],
      url: 'https://grow.google/certificates',
      deadline: 'Rolling admissions',
    },
    {
      title: 'National Rural Livelihoods Mission',
      organization: 'Ministry of Rural Development',
      type: 'program',
      description: 'Community-based program helping rural women form self-help groups for livelihood activities, skill training, and microfinance access',
      region: ['India'],
      minAge: 18,
      maxAge: null,
      minEducation: ['Primary (Grade 1-8)', 'Secondary (Grade 9-10)', 'Higher Secondary (Grade 11-12)'],
      tags: ['community', 'rural', 'microfinance', 'self-help-groups', 'offline', 'government'],
      url: 'https://nrlm.gov.in',
      deadline: 'Ongoing',
    },
    {
      title: 'Pradhan Mantri Kaushal Vikas Yojana',
      organization: 'Ministry of Skill Development',
      type: 'program',
      description: 'Free skill training with monetary rewards for youth in trades like tailoring, beauty & wellness, retail, hospitality, and IT',
      region: ['India'],
      minAge: 15,
      maxAge: 45,
      minEducation: ['Primary (Grade 1-8)', 'Secondary (Grade 9-10)', 'Higher Secondary (Grade 11-12)'],
      tags: ['skills', 'tailoring', 'training', 'certification', 'offline', 'government'],
      url: 'https://www.pmkvyofficial.org',
      deadline: 'Ongoing',
    },
  ];

  for (const opp of opportunities) {
    await prisma.opportunity.create({
      data: opp,
    });
  }

  console.log(`✅ Created/updated ${opportunities.length} opportunities`);
  console.log('\n🎉 Seed completed successfully!');
  console.log('\n📊 Verification steps:');
  console.log('1. Run: npx prisma studio');
  console.log('   - Check "users" table for Priya');
  console.log('   - Check "profiles" table for her complete profile');
  console.log('   - Check "opportunities" table for all 15 opportunities');
  console.log('   - Check "progress_logs" table for initial progress entry');
  console.log('\n2. Check Neon dashboard:');
  console.log('   - Go to https://console.neon.tech');
  console.log('   - Select your project');
  console.log('   - Open SQL Editor');
  console.log('   - Run: SELECT * FROM users;');
  console.log('   - Run: SELECT * FROM opportunities;');
  console.log('   - Verify data appears in both Prisma Studio AND Neon dashboard');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


